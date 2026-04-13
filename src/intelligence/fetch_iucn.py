# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_iucn.py
#
# Fetch species with IUCN threat status via GBIF Backbone Taxonomy API.
# The IUCN API v3 is blocked by Cloudflare; GBIF mirrors the Red List
# threat status data and is freely accessible.
#
# GBIF caps species/search at 10,000 results per query, so we split by
# threat category and collect up to 10K per category.

from dotenv import load_dotenv
import os, requests, time
load_dotenv()

from tqdm import tqdm
from src.intelligence.db import Species, get_session, engine
from sqlalchemy import text
from loguru import logger

GBIF_BASE = "https://api.gbif.org/v1"
MAX_OFFSET = 9999  # GBIF returns 404 at offset >= 10000

# Threat categories to fetch, in severity order (most severe first).
# When a species appears under multiple categories, we keep the most severe.
THREAT_CATEGORIES = [
    "CRITICALLY_ENDANGERED",
    "ENDANGERED",
    "VULNERABLE",
    "NEAR_THREATENED",
    "LEAST_CONCERN",
    "DATA_DEFICIENT",
]

# Map GBIF threat status strings to short IUCN codes
STATUS_MAP = {
    "EXTINCT":                 "EX",
    "EXTINCT_IN_THE_WILD":     "EW",
    "CRITICALLY_ENDANGERED":   "CR",
    "ENDANGERED":              "EN",
    "VULNERABLE":              "VU",
    "NEAR_THREATENED":         "NT",
    "CONSERVATION_DEPENDENT":  "CD",
    "LEAST_CONCERN":           "LC",
    "DATA_DEFICIENT":          "DD",
    "NOT_EVALUATED":           "NE",
}

SEVERITY_ORDER = ["EX", "EW", "CR", "EN", "VU", "NT", "CD", "LC", "DD", "NE"]


def most_severe_status(threat_statuses: list) -> str:
    """Pick the most severe IUCN category from a list of threat statuses."""
    codes = [STATUS_MAP.get(s, "NE") for s in threat_statuses]
    for sev in SEVERITY_ORDER:
        if sev in codes:
            return sev
    return "NE"


def fetch_species_by_threat(threat: str, limit: int = 1000):
    """Yield species dicts from GBIF for a given IUCN threat status.
    Stops at GBIF's 10K result cap."""
    offset = 0
    while offset <= MAX_OFFSET:
        actual_limit = min(limit, MAX_OFFSET - offset + 1)
        try:
            r = requests.get(
                f"{GBIF_BASE}/species/search",
                params={
                    "rank": "SPECIES",
                    "threat": threat,
                    "limit": actual_limit,
                    "offset": offset,
                },
                timeout=30,
            )
            if r.status_code == 404:
                break  # hit GBIF offset cap
            r.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.warning(f"Request error at offset {offset}: {e}")
            break
        data = r.json()
        results = data.get("results", [])
        if not results:
            break
        yield from results
        if data.get("endOfRecords", False):
            break
        offset += actual_limit
        time.sleep(0.3)


def fetch_all_species() -> dict:
    """Fetch threatened species from GBIF, deduplicated by nubKey.
    Returns dict keyed by nubKey with species data."""
    species = {}  # nubKey -> record
    for threat in THREAT_CATEGORIES:
        count_before = len(species)
        for sp in tqdm(
            fetch_species_by_threat(threat),
            desc=f"GBIF {threat}",
        ):
            nub = sp.get("nubKey") or sp.get("key")
            if nub in species:
                continue  # already seen with more severe status
            species[nub] = {
                "taxon_id":   nub,
                "name":       sp.get("canonicalName") or sp.get("scientificName", ""),
                "category":   most_severe_status(sp.get("threatStatuses", [threat])),
                "class_name": sp.get("class", ""),
                "habitat":    ",".join(sp.get("habitats", [])),
            }
        added = len(species) - count_before
        logger.info(f"{threat}: +{added:,} new (total unique: {len(species):,})")
    return species


def load_species_to_db():
    """Download threatened species from GBIF and load into SQLite."""
    logger.info("Fetching species with IUCN threat status via GBIF...")
    species = fetch_all_species()
    logger.info(f"Total unique species: {len(species):,}")

    # Clear existing species data
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM species"))
        conn.commit()
    logger.info("Cleared existing species table")

    with get_session() as session:
        count = 0
        for rec in tqdm(species.values(), desc="Loading species to DB"):
            session.add(Species(
                taxon_id   = rec["taxon_id"],
                name       = rec["name"],
                category   = rec["category"],
                class_name = rec["class_name"],
                habitat    = rec["habitat"],
            ))
            count += 1

    logger.info(f"Loaded {count:,} species into database")
    return count


if __name__ == "__main__":
    load_species_to_db()
