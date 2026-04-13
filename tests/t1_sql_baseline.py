# /Users/zakherfrogman/Documents/Conservation evidence/tests/t1_sql_baseline.py

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from src.intelligence.db import engine
from loguru import logger


def query_interventions(species_name: str) -> list:
    """Two-step query: find species IDs first, then look up links via index."""
    with engine.connect() as conn:
        # Step 1: find matching species IDs (small table, fast scan)
        sp_rows = conn.execute(text(
            "SELECT taxon_id FROM species WHERE name LIKE :name"
        ), {"name": f"%{species_name}%"})
        sp_ids = [r[0] for r in sp_rows]
        if not sp_ids:
            return []

        # Step 2: fetch interventions using indexed species_id lookup
        placeholders = ",".join(str(sid) for sid in sp_ids)
        rows = conn.execute(text(f"""
            SELECT DISTINCT i.action, i.ce_category, i.effectiveness, i.n_studies
            FROM interventions i
            JOIN species_intervention_links l ON i.id = l.ce_id
            WHERE l.species_id IN ({placeholders})
            ORDER BY i.effectiveness DESC
        """))
        return [dict(r._mapping) for r in rows]


# Test cases using species confirmed in our GBIF-sourced database.
# Keywords are conservation actions expected to appear in linked CE interventions.
TEST_CASES = [
    ("Panthera onca",           ["predator", "habitat", "corridor"]),      # Mammalia, jaguar
    ("Haliaeetus albicilla",    ["raptor", "nest", "bird"]),               # Aves, white-tailed eagle
    ("Chelonia mydas",          ["turtle", "marine", "bycatch"]),          # Testudines, green turtle
    ("Salmo",                   ["fish", "river", "freshwater"]),          # Actinopterygii, salmon
    ("Gorilla",                 ["mammal", "protected area", "habitat"]),  # Mammalia, gorilla
]

if __name__ == "__main__":
    import time
    print("=== Phase 1 SQL Baseline Test ===\n")
    baseline = 0
    max_latency = 0
    for species, keywords in TEST_CASES:
        start = time.time()
        results = query_interventions(species)
        latency_ms = (time.time() - start) * 1000
        max_latency = max(max_latency, latency_ms)

        found   = " ".join(r['action'] or '' for r in results).lower()
        hits    = sum(1 for kw in keywords if kw in found)
        passed  = hits >= len(keywords) // 2
        if passed:
            baseline += 1
        status = "PASS" if passed else "FAIL"
        logger.info(f"[{status}] {species}: {len(results)} interventions, "
                    f"{hits}/{len(keywords)} keywords matched ({latency_ms:.0f}ms)")

    print(f"\n=== SQL BASELINE: {baseline}/{len(TEST_CASES)} ===")
    print(f"Max query latency: {max_latency:.0f}ms "
          f"({'PASS' if max_latency < 200 else 'FAIL'} — threshold: <200ms)")
    print("Save this number in CLAUDE.md.")
    print("Phase 4 RAG system MUST beat this score.")
