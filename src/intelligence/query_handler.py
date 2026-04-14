# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/query_handler.py

from dotenv import load_dotenv
import time
load_dotenv()

from datetime import datetime
from src.intelligence.router import classify_query, QueryType
from src.intelligence.synthesiser import synthesise, safe_fallback
from src.intelligence.validator import validate_synthesis
from src.intelligence.retriever import retrieve_papers, retrieve_ce
from src.intelligence.db import QueryLog, get_session
from contracts.evidence import EvidenceSynthesis
from loguru import logger


def get_ce_for_context(question: str) -> list:
    """Retrieve CE intervention rows relevant to the question."""
    docs = retrieve_ce(question, k=5)
    return [
        {
            "action":        d.page_content,
            "ce_category":   d.metadata.get("ce_category", "Unknown"),
            "effectiveness": d.metadata.get("effectiveness", "N/A"),
            "n_studies":     d.metadata.get("n_studies", 0),
        }
        for d in docs
    ]


def handle_query(question: str,
                 species:  str = "",
                 location: str = "",
                 user_id:  str = None) -> EvidenceSynthesis:
    """Full pipeline: route → retrieve → synthesise → validate → log."""

    start = time.time()
    qtype = classify_query(question)
    chunks = []

    try:
        if qtype == QueryType.SYNTHESIS:
            chunks  = retrieve_papers(question, k=8)
            ce_rows = get_ce_for_context(question)
            result  = synthesise(question, species, location, chunks, ce_rows)
        elif qtype == QueryType.LOOKUP:
            ce_rows = get_ce_for_context(question)
            result  = synthesise(question, species, location, [], ce_rows)
        else:
            # FACTUAL — direct DB lookup (placeholder for now)
            result = safe_fallback(question, [])
    except Exception as e:
        logger.error(f"Query handler error: {e}")
        result = safe_fallback(question, chunks)

    validation = validate_synthesis(result, chunks)
    latency_ms = int((time.time() - start) * 1000)

    # Log query to database
    with get_session() as session:
        session.add(QueryLog(
            question          = question,
            query_type        = qtype.value,
            n_chunks          = len(chunks),
            confidence        = result.confidence.value,
            validation_passed = validation["valid"],
            orphan_cites      = len(validation["orphan_cites"]),
            user_id           = int(user_id) if user_id else None,
            latency_ms        = latency_ms,
            model             = "gemma4:e4b",
            timestamp         = datetime.utcnow().isoformat()
        ))

    logger.info(
        f"Query [{qtype.value}] '{question[:50]}...' → "
        f"confidence={result.confidence.value}, "
        f"valid={validation['valid']}, "
        f"{latency_ms}ms"
    )

    return result
