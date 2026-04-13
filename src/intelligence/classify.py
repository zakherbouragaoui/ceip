# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/classify.py

from dotenv import load_dotenv
import os, requests, json
load_dotenv()

from concurrent.futures import ThreadPoolExecutor, as_completed
from contracts.evidence import PaperClassification
from src.intelligence.db import Paper, get_session
from loguru import logger
from tqdm import tqdm

# From RESOURCES.md AI Models section
OLLAMA_BASE      = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_GENERATION = "gemma4:e4b"

PROMPT = """Extract structured metadata from this conservation paper abstract.
Return ONLY valid JSON — no other text, no markdown, no explanation:
{{
  "intervention_type": "habitat_restoration|species_reintro|protected_area|invasive_control|captive_breeding|community_mgmt|policy|monitoring|other",
  "species_group": "mammals|birds|reptiles|fish|invertebrates|plants|fungi|general",
  "outcome": "positive|negative|mixed|unclear",
  "geography": "country or region or global",
  "has_quantitative_result": true or false,
  "is_conservation_relevant": true or false
}}

Abstract: {abstract}"""


def classify_paper(abstract: str,
                   max_retries: int = 3) -> PaperClassification | None:
    for attempt in range(max_retries):
        try:
            r = requests.post(
                f"{OLLAMA_BASE}/api/generate",
                json={
                    "model":   MODEL_GENERATION,
                    "prompt":  PROMPT.format(abstract=abstract[:1500]),
                    "stream":  False,
                    "format":  "json",
                    "options": {"temperature": 0.0}
                },
                timeout=60,
            )
            return PaperClassification(**json.loads(r.json()['response']))
        except Exception as e:
            logger.warning(f"Classify attempt {attempt + 1} failed: {e}")
    return None


def _classify_one(paper_id: str, abstract: str):
    """Worker function for concurrent classification."""
    result = classify_paper(abstract)
    return paper_id, result


def classify_all_papers(batch_size: int = 50, workers: int = 2):
    """Classify all unclassified papers using concurrent workers."""
    with get_session() as session:
        unclassified = (
            session.query(Paper)
            .filter(Paper.intervention_type == None)
            .all()
        )
        total = len(unclassified)
        logger.info(f"Found {total:,} unclassified papers (workers={workers})")

        if total == 0:
            logger.info("Nothing to classify")
            return

        # Build lookup for updating
        paper_map = {p.id: p for p in unclassified}
        work_items = [(p.id, p.abstract or "") for p in unclassified]

        classified, failed, done = 0, 0, 0
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {}
            idx = 0
            pbar = tqdm(total=total, desc="Classifying")

            # Submit initial batch
            for _ in range(min(workers * 2, total)):
                pid, abstract = work_items[idx]
                futures[executor.submit(_classify_one, pid, abstract)] = pid
                idx += 1

            while futures:
                for future in as_completed(futures):
                    pid = futures.pop(future)
                    paper = paper_map[pid]
                    try:
                        _, result = future.result()
                        if result:
                            paper.intervention_type = result.intervention_type
                            paper.species_group     = result.species_group
                            paper.outcome           = result.outcome
                            paper.geography         = result.geography
                            classified += 1
                        else:
                            paper.intervention_type = "other"
                            paper.species_group     = "general"
                            paper.outcome           = "unclear"
                            paper.geography         = "unknown"
                            failed += 1
                    except Exception as e:
                        logger.error(f"Worker error for {pid}: {e}")
                        paper.intervention_type = "other"
                        paper.species_group     = "general"
                        paper.outcome           = "unclear"
                        paper.geography         = "unknown"
                        failed += 1

                    done += 1
                    pbar.update(1)

                    # Commit periodically
                    if done % batch_size == 0:
                        session.commit()
                        logger.info(
                            f"Progress: {done}/{total} "
                            f"({classified} classified, {failed} failed)"
                        )

                    # Submit next item
                    if idx < total:
                        pid2, abstract2 = work_items[idx]
                        futures[executor.submit(_classify_one, pid2, abstract2)] = pid2
                        idx += 1

                    break  # process one at a time from as_completed

            pbar.close()

        # Final commit handled by context manager
        logger.info(
            f"Done: {classified:,} classified, {failed:,} failed "
            f"out of {total:,} papers"
        )


if __name__ == "__main__":
    classify_all_papers()
