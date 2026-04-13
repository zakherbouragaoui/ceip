# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/link_species.py
#
# Build species–intervention links by matching species taxonomy and habitat
# to CE intervention action text. The IUCN API (fetch_species_actions) is
# blocked by Cloudflare, so we use keyword + fuzzy matching instead.

from dotenv import load_dotenv
load_dotenv()

from rapidfuzz import fuzz
from tqdm import tqdm
from src.intelligence.db import (Species, Intervention,
                                  SpeciesInterventionLink, get_session, engine)
from sqlalchemy import text, func
from loguru import logger

# Map species taxonomic class → search terms for CE intervention matching.
# Each term is searched in the CE action text (case-insensitive).
CLASS_KEYWORDS = {
    "Aves":            ["bird", "avian", "nest", "raptor", "seabird", "wader",
                        "waterfowl", "vulture", "condor", "colony site",
                        "diclofenac", "fledge", "breeding bird"],
    "Mammalia":        ["mammal", "predator", "elephant", "wolf", "bat ",
                        "rhinoceros", "carnivore", "livestock", "beehive",
                        "roost", "hibernat", "large carnivore", "primate"],
    "Amphibia":        ["amphibian", "frog", "toad", "tadpole", "newt",
                        "salamander", "pond", "road-crossing", "road crossing"],
    "Squamata":        ["reptile", "turtle", "sea turtle", "basking",
                        "snake", "lizard", "hatchery", "excluder device",
                        "bycatch"],
    "Actinopterygii":  ["fish", "marine reserve", "fish pass", "dam ",
                        "barrier to fish", "freshwater", "river",
                        "bycatch", "spawning"],
    "Elasmobranchii":  ["shark", "ray ", "marine", "bycatch", "no-take",
                        "fishing"],
    "Insecta":         ["insect", "pollinator", "bee ", "butterfly",
                        "wildflower", "flower strip", "hedgerow",
                        "pesticide", "solitary bee"],
    "Gastropoda":      ["snail", "mollus", "invertebrate", "freshwater"],
    "Malacostraca":    ["crustacean", "crab", "lobster", "marine",
                        "freshwater", "invertebrate"],
    "Arachnida":       ["spider", "arachnid", "invertebrate", "arthropod"],
    "Magnoliopsida":   ["plant", "seed bank", "tree", "forest", "hedge",
                        "mangrove", "grazing", "grassland", "wildflower",
                        "weed", "flora", "vegetation", "replant"],
    "Liliopsida":      ["plant", "grass", "reed", "wetland", "vegetation",
                        "seed bank", "grazing", "flora"],
    "Agaricomycetes":  ["fungi", "fungus", "mushroom", "woodland", "forest",
                        "dead wood", "deadwood"],
    "Bryopsida":       ["moss", "bryophyte", "plant", "peatland", "wetland"],
    "Lecanoromycetes":  ["lichen", "fungi", "woodland", "forest", "air quality"],
}

# Habitat-based keywords (from GBIF habitat field)
HABITAT_KEYWORDS = {
    "MARINE":      ["marine", "reef", "ocean", "coastal", "sea ", "no-take",
                    "bycatch", "fishing", "mangrove"],
    "FRESHWATER":  ["freshwater", "river", "pond", "wetland", "stream",
                    "dam ", "fish pass", "riparian", "water level"],
    "TERRESTRIAL": ["forest", "farmland", "grassland", "heathland",
                    "peatland", "hedgerow", "field margin", "corridor",
                    "protected area"],
}

# General conservation actions that apply broadly
GENERAL_TERMS = ["invasive", "protected area", "translocat", "corridor",
                 "captive breed", "reintroduc", "monitor", "eradicat",
                 "removal", "fencing", "hunting", "poaching"]


def find_matching_interventions(keywords: list, interventions: list,
                                base_confidence: float) -> list:
    """Find interventions whose action text contains any of the keywords."""
    matches = []
    for ce in interventions:
        action_lower = (ce.action or "").lower()
        for kw in keywords:
            if kw.lower() in action_lower:
                matches.append((ce.id, base_confidence))
                break  # one match per intervention is enough
    return matches


def build_class_intervention_map(interventions: list) -> dict:
    """Precompute: class_name → list of (ce_id, confidence)."""
    mapping = {}

    # Class-specific matches (high confidence)
    for class_name, keywords in CLASS_KEYWORDS.items():
        matches = find_matching_interventions(
            keywords, interventions, base_confidence=0.80
        )
        mapping[class_name] = matches

    # General conservation matches (moderate confidence)
    general_matches = find_matching_interventions(
        GENERAL_TERMS, interventions, base_confidence=0.55
    )
    mapping["_general"] = general_matches

    return mapping


def build_habitat_intervention_map(interventions: list) -> dict:
    """Precompute: habitat → list of (ce_id, confidence)."""
    mapping = {}
    for habitat, keywords in HABITAT_KEYWORDS.items():
        matches = find_matching_interventions(
            keywords, interventions, base_confidence=0.65
        )
        mapping[habitat] = matches
    return mapping


def build_links(min_confidence: float = 0.5):
    """Build species-intervention links using taxonomy + habitat matching."""
    with get_session() as session:
        # Clear existing links
        session.execute(text("DELETE FROM species_intervention_links"))
        session.flush()
        logger.info("Cleared existing links")

        species_list = session.query(Species).all()
        ce_items = session.query(Intervention).all()
        logger.info(f"Linking {len(species_list):,} species to "
                    f"{len(ce_items):,} CE interventions")

        # Precompute mappings
        class_map = build_class_intervention_map(ce_items)
        habitat_map = build_habitat_intervention_map(ce_items)

        logger.info("Class matches: " + ", ".join(
            f"{k}={len(v)}" for k, v in class_map.items() if v
        ))
        logger.info("Habitat matches: " + ", ".join(
            f"{k}={len(v)}" for k, v in habitat_map.items() if v
        ))

        total_links = 0
        for sp in tqdm(species_list, desc="Building links"):
            links = {}  # ce_id → best confidence

            # 1. Class-based matches
            class_matches = class_map.get(sp.class_name, [])
            for ce_id, conf in class_matches:
                links[ce_id] = max(links.get(ce_id, 0), conf)

            # 2. Habitat-based matches
            habitats = (sp.habitat or "").split(",")
            for hab in habitats:
                hab = hab.strip()
                if hab in habitat_map:
                    for ce_id, conf in habitat_map[hab]:
                        links[ce_id] = max(links.get(ce_id, 0), conf)

            # 3. General conservation matches (for all species)
            for ce_id, conf in class_map.get("_general", []):
                links[ce_id] = max(links.get(ce_id, 0), conf)

            # Filter by min_confidence and insert
            for ce_id, conf in links.items():
                if conf >= min_confidence:
                    session.add(SpeciesInterventionLink(
                        species_id=sp.taxon_id,
                        ce_id=ce_id,
                        confidence=round(conf, 3),
                    ))
                    total_links += 1

            # Commit in batches (flush + commit to persist)
            if total_links % 50000 == 0 and total_links > 0:
                session.commit()
                logger.info(f"  Committed batch at {total_links:,} links")

        logger.info(f"Total links created: {total_links:,}")
        logger.info(f"Avg links per species: {total_links / max(len(species_list), 1):.1f}")


if __name__ == "__main__":
    build_links()
