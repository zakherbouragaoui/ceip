# /Users/zakherfrogman/Documents/Conservation evidence/src/living/ingestion_agent.py

from dotenv import load_dotenv
import os, asyncio
load_dotenv()

import httpx
from datetime import datetime, timedelta
from tqdm import tqdm
from src.intelligence.db import Paper, IngestionRun, get_session
from src.intelligence.classify import classify_paper
from src.intelligence.fetch_papers import reconstruct_abstract, normalize_doi
from src.living.change_detector import check_paper_against_projects
from src.intelligence.embedder import embed_all_papers
from loguru import logger

# From RESOURCES.md APIs section
OA_BASE  = "https://api.openalex.org"
OA_EMAIL = os.getenv("OPENALEX_EMAIL")

# OpenAlex concept ID that still returns results (others deprecated)
CONSERVATION_CONCEPT = "C149923435"  # Conservation biology

# Search queries for broader coverage (same as Phase 1 fetch_papers.py)
WEEKLY_QUERIES = [
    "conservation effectiveness intervention outcome",
    "species recovery conservation action evidence",
    "habitat restoration biodiversity outcome",
    "invasive species removal control effectiveness",
]

MUST_HAVE_KEYWORDS = {
    "conservation", "biodiversity", "species", "habitat",
    "wildlife", "ecosystem", "restoration", "protected",
    "intervention", "endangered", "threatened", "recovery",
    "population", "management", "ecology", "monitoring", "decline",
}


def keyword_prefilter(text: str) -> bool:
    """Require at least one conservation keyword in abstract."""
    return bool(MUST_HAVE_KEYWORDS & set(text.lower().split()))


async def fetch_by_concept(client: httpx.AsyncClient,
                           since: str) -> list:
    """Fetch recent papers using OpenAlex concept filter."""
    results = []
    cursor = "*"
    while True:
        try:
            r = await client.get(f"{OA_BASE}/works", params={
                "filter":   f"concepts.id:{CONSERVATION_CONCEPT},"
                            f"from_publication_date:{since}",
                "per-page": 200,
                "cursor":   cursor,
                "select":   "id,title,abstract_inverted_index,"
                            "doi,publication_year",
                "mailto":   OA_EMAIL,
            })
            if r.status_code != 200:
                logger.warning(f"Concept fetch error: {r.status_code}")
                break
        except httpx.RequestError as e:
            logger.warning(f"Concept fetch request error: {e}")
            break
        data = r.json()
        batch = data.get("results", [])
        if not batch:
            break
        results.extend(batch)
        cursor = data.get("meta", {}).get("next_cursor")
        if not cursor:
            break
    logger.info(f"Concept filter returned {len(results):,} papers")
    return results


async def fetch_by_search(client: httpx.AsyncClient,
                          query: str, since: str,
                          limit: int = 200) -> list:
    """Fetch recent papers using OpenAlex search + date filter."""
    results = []
    cursor = "*"
    while len(results) < limit:
        try:
            r = await client.get(f"{OA_BASE}/works", params={
                "search":   query,
                "filter":   f"from_publication_date:{since}",
                "per-page": 200,
                "cursor":   cursor,
                "select":   "id,title,abstract_inverted_index,"
                            "doi,publication_year",
                "mailto":   OA_EMAIL,
            })
            if r.status_code != 200:
                logger.warning(f"Search error for '{query}': {r.status_code}")
                break
        except httpx.RequestError as e:
            logger.warning(f"Search request error for '{query}': {e}")
            break
        data = r.json()
        batch = data.get("results", [])
        if not batch:
            break
        results.extend(batch)
        cursor = data.get("meta", {}).get("next_cursor")
        if not cursor:
            break
    return results


async def fetch_new_papers(days_ago: int = 7) -> list:
    """Fetch recent conservation papers from OpenAlex."""
    since = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
    seen_ids = set()
    all_papers = []

    async with httpx.AsyncClient(timeout=30) as client:
        # 1. Concept-based fetch (broadest coverage)
        concept_papers = await fetch_by_concept(client, since)
        for p in concept_papers:
            pid = p.get("id", "")
            if pid not in seen_ids:
                seen_ids.add(pid)
                all_papers.append(p)

        # 2. Search-based fetch (targeted queries)
        for query in WEEKLY_QUERIES:
            search_papers = await fetch_by_search(client, query, since)
            added = 0
            for p in search_papers:
                pid = p.get("id", "")
                if pid not in seen_ids:
                    seen_ids.add(pid)
                    all_papers.append(p)
                    added += 1
            logger.info(f"Search '{query[:40]}...': +{added} new")

    logger.info(f"Total unique papers fetched: {len(all_papers):,}")
    return all_papers


async def run_weekly_ingestion(days_ago: int = 7):
    start = datetime.now()
    logger.info("=== Weekly ingestion started ===")
    papers = await fetch_new_papers(days_ago=days_ago)
    new, skipped, irrelevant, no_doi, no_abstract = 0, 0, 0, 0, 0

    with get_session() as session:
        for paper in tqdm(papers, desc="Processing papers"):
            doi = normalize_doi(paper.get("doi") or "")
            if not doi:
                no_doi += 1
                continue
            if session.query(Paper).filter_by(id=doi).first():
                skipped += 1
                continue

            abstract = reconstruct_abstract(paper)
            if not abstract.strip():
                no_abstract += 1
                continue

            if not keyword_prefilter(abstract):
                irrelevant += 1
                continue

            classification = classify_paper(abstract)
            if classification and classification.is_conservation_relevant:
                session.add(Paper(
                    id                = doi,
                    title             = paper.get("title", ""),
                    abstract          = abstract,
                    year              = paper.get("publication_year"),
                    source            = "OpenAlex",
                    intervention_type = classification.intervention_type,
                    species_group     = classification.species_group,
                    outcome           = classification.outcome,
                    geography         = classification.geography,
                    embedded          = 0,
                ))
                new += 1

                # Check against user projects for alerts
                try:
                    check_paper_against_projects(doi, classification)
                except Exception as e:
                    logger.warning(f"Alert check failed for {doi}: {e}")

                # Commit every 20 papers (classification is slow)
                if new % 20 == 0:
                    session.commit()
                    logger.info(f"  Progress: {new} new papers saved")
            else:
                irrelevant += 1

        duration = int((datetime.now() - start).total_seconds())
        session.add(IngestionRun(
            run_date         = start.isoformat(),
            papers_fetched   = len(papers),
            papers_relevant  = new,
            papers_embedded  = 0,
            duration_seconds = duration,
        ))

    logger.info(
        f"Done: {new} new | {skipped} duplicate | {irrelevant} irrelevant | "
        f"{no_doi} no DOI | {no_abstract} no abstract | {duration}s"
    )

    # Embed newly ingested papers so they're queryable immediately
    if new > 0:
        logger.info("Embedding newly ingested papers")
        embed_all_papers()
        logger.info("New papers are now queryable")


if __name__ == "__main__":
    asyncio.run(run_weekly_ingestion())
