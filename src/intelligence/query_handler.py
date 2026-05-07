# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/query_handler.py

from dotenv import load_dotenv
import hashlib
import json
import time
load_dotenv()

from datetime import datetime, timedelta
from src.intelligence.router import classify_query, QueryType
from src.intelligence.synthesiser import synthesise, safe_fallback
from src.intelligence.validator import validate_synthesis
from src.intelligence.retriever import retrieve_papers, retrieve_ce
from src.intelligence.db import QueryLog, QueryCache, get_session
from contracts.evidence import EvidenceSynthesis
from loguru import logger

# Production swap: replace with Redis (CACHE_BACKEND=redis, REDIS_URL in .env)
# and use a TTL-aware Redis client instead of SQL queries below.
CACHE_TTL_DAYS = 7


def _cache_key(question: str, species: str, location: str) -> str:
    """MD5 hash of normalised query params — deterministic, fixed-length."""
    raw = f"{question.strip().lower()}|{species.strip().lower()}|{location.strip().lower()}"
    return hashlib.md5(raw.encode()).hexdigest()


def _cache_get(key: str) -> EvidenceSynthesis | None:
    """Return cached result if it exists and is within TTL, else None."""
    with get_session() as session:
        row = session.query(QueryCache).filter(QueryCache.cache_key == key).first()
        if row is None:
            return None
        created = datetime.fromisoformat(row.created_at)
        if datetime.utcnow() - created > timedelta(days=CACHE_TTL_DAYS):
            session.delete(row)
            return None
        row.hit_count = (row.hit_count or 0) + 1
        row.last_accessed = datetime.utcnow().isoformat()
        return EvidenceSynthesis.model_validate_json(row.result_json)


def _cache_put(key: str, result: EvidenceSynthesis) -> None:
    """Store a synthesis result in the cache."""
    with get_session() as session:
        existing = session.query(QueryCache).filter(QueryCache.cache_key == key).first()
        if existing:
            existing.result_json = result.model_dump_json()
            existing.created_at = datetime.utcnow().isoformat()
            existing.hit_count = 0
            existing.last_accessed = datetime.utcnow().isoformat()
        else:
            session.add(QueryCache(
                cache_key     = key,
                result_json   = result.model_dump_json(),
                created_at    = datetime.utcnow().isoformat(),
                last_accessed = datetime.utcnow().isoformat(),
                hit_count     = 0,
            ))


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
                 user_id:  str = None) -> dict:
    """Full pipeline: cache check → route → retrieve → synthesise → validate → log.

    Returns a dict with the EvidenceSynthesis fields plus cache_hit: bool.
    """

    start = time.time()

    # --- Cache lookup ---
    key = _cache_key(question, species, location)
    cached = _cache_get(key)
    if cached is not None:
        latency_ms = int((time.time() - start) * 1000)
        logger.info(f"Cache HIT for '{question[:50]}...' ({latency_ms}ms)")
        out = cached.model_dump()
        out["cache_hit"] = True
        return out

    # --- Full pipeline on cache miss ---
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

    # --- Store in cache ---
    _cache_put(key, result)

    # --- Log query to database ---
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
        f"Cache MISS [{qtype.value}] '{question[:50]}...' → "
        f"confidence={result.confidence.value}, "
        f"valid={validation['valid']}, "
        f"{latency_ms}ms"
    )

    out = result.model_dump()
    out["cache_hit"] = False
    return out
