# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_papers.py

from dotenv import load_dotenv
import os, requests, time
load_dotenv()

from tqdm import tqdm
from src.intelligence.db import Paper, get_session
from loguru import logger

# From RESOURCES.md APIs section
CORE_BASE = "https://api.core.ac.uk/v3"
OA_BASE   = "https://api.openalex.org"
CORE_KEY  = os.getenv("CORE_API_KEY")
OA_EMAIL  = os.getenv("OPENALEX_EMAIL")

# Six targeted search queries covering all major intervention types
QUERIES = [
    "conservation effectiveness intervention outcome",
    "species recovery conservation action evidence",
    "protected area management effectiveness",
    "habitat restoration biodiversity outcome",
    "invasive species removal control effectiveness",
    "community conservation human wildlife coexistence",
]


def fetch_core_papers(query: str, limit: int = 3000) -> list:
    results, offset = [], 0
    while offset < limit:
        try:
            r = requests.get(
                f"{CORE_BASE}/search/works",
                headers={"Authorization": f"Bearer {CORE_KEY}"},
                params={
                    "q":      query,
                    "limit":  100,
                    "offset": offset,
                    "fields": "id,title,abstract,doi,yearPublished,downloadUrl"
                },
                timeout=30,
            )
            if r.status_code != 200:
                logger.warning(f"CORE error {r.status_code} at offset {offset}")
                break
        except requests.exceptions.RequestException as e:
            logger.warning(f"CORE request error at offset {offset}: {e}")
            break
        batch = r.json().get('results', [])
        if not batch:
            break
        results.extend(batch)
        offset += 100
        time.sleep(0.2)
    return results


def fetch_openalex_papers(query: str, limit: int = 2000) -> list:
    results, cursor = [], "*"
    while len(results) < limit:
        try:
            r = requests.get(
                f"{OA_BASE}/works",
                params={
                    "search":   query,
                    "per-page": 200,
                    "cursor":   cursor,
                    "select":   "id,title,abstract_inverted_index,doi,publication_year",
                    "mailto":   OA_EMAIL
                },
                timeout=30,
            )
            if r.status_code != 200:
                logger.warning(f"OpenAlex error {r.status_code}")
                break
        except requests.exceptions.RequestException as e:
            logger.warning(f"OpenAlex request error: {e}")
            break
        data  = r.json()
        batch = data.get('results', [])
        if not batch:
            break
        results.extend(batch)
        cursor = data.get('meta', {}).get('next_cursor')
        if not cursor:
            break
        time.sleep(0.1)
    return results


def reconstruct_abstract(work: dict) -> str:
    """Reconstruct abstract from OpenAlex inverted index format."""
    inv = work.get('abstract_inverted_index') or {}
    if not inv:
        return ""
    pairs = [(w, p) for w, positions in inv.items() for p in positions]
    return " ".join(w for w, _ in sorted(pairs, key=lambda x: x[1]))


def normalize_doi(doi_str: str) -> str:
    """Strip URL prefix from OpenAlex DOIs to get bare DOI."""
    if not doi_str:
        return ""
    return doi_str.replace("https://doi.org/", "").replace("http://doi.org/", "")


def save_papers(papers: list, source: str):
    with get_session() as session:
        saved = 0
        for p in papers:
            if source == "CORE":
                doi = normalize_doi(p.get('doi') or '')
                paper_id = doi or f"core:{p.get('id', '')}"
                abstract = p.get('abstract') or ''
                year = p.get('yearPublished')
                pdf_url = p.get('downloadUrl')
                title = p.get('title') or ''
            else:  # OpenAlex
                doi = normalize_doi(p.get('doi') or '')
                paper_id = doi or p.get('id', '')
                abstract = reconstruct_abstract(p)
                year = p.get('publication_year')
                pdf_url = None
                title = p.get('title') or ''

            if not paper_id:
                continue
            # Skip papers without abstracts (plan requires papers with abstracts)
            if not abstract.strip():
                continue
            if session.query(Paper).filter_by(id=paper_id).first():
                continue
            session.add(Paper(
                id       = paper_id,
                title    = title,
                abstract = abstract,
                year     = year,
                pdf_url  = pdf_url,
                source   = source,
                embedded = 0,
            ))
            saved += 1
        logger.info(f"Saved {saved:,} new papers from {source}")


def run_all_queries():
    for query in tqdm(QUERIES, desc="Running queries"):
        logger.info(f"CORE query: {query}")
        core_papers = fetch_core_papers(query)
        logger.info(f"  CORE returned {len(core_papers):,} papers")
        save_papers(core_papers, "CORE")

        logger.info(f"OpenAlex query: {query}")
        oa_papers = fetch_openalex_papers(query)
        logger.info(f"  OpenAlex returned {len(oa_papers):,} papers")
        save_papers(oa_papers, "OpenAlex")

    # Report totals
    with get_session() as session:
        total = session.query(Paper).count()
        with_abs = session.query(Paper).filter(Paper.abstract != '').count()
        core_n = session.query(Paper).filter_by(source="CORE").count()
        oa_n = session.query(Paper).filter_by(source="OpenAlex").count()
        logger.info(f"TOTAL: {total:,} papers ({core_n:,} CORE + {oa_n:,} OpenAlex), {with_abs:,} with abstracts")


if __name__ == "__main__":
    run_all_queries()
