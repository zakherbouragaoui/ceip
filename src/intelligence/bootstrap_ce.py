# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/bootstrap_ce.py
#
# Bootstrap the interventions table with known Conservation Evidence
# interventions and their published effectiveness categories.
# Source: "What Works in Conservation" (2020, 2024 editions) — freely
# available from conservationevidence.com/content/page/79
#
# This is a TEMPORARY seed dataset for development. Replace with the
# full CSV from conservationevidence.com once downloaded manually.

from dotenv import load_dotenv
import os
load_dotenv()

from src.intelligence.db import Intervention, get_session, engine
from sqlalchemy import text
from loguru import logger

# Known CE interventions with published effectiveness categories.
# Each tuple: (action, synopsis, ce_category, effectiveness_estimate, n_studies)
# Effectiveness estimates are approximate midpoints for the category.
CE_SEED_DATA = [
    # === Bird Conservation ===
    ("Remove or control introduced mammalian predators on islands",
     "Bird Conservation", "Beneficial", 85, 62),
    ("Provide artificial nesting sites for raptors",
     "Bird Conservation", "Likely Beneficial", 65, 28),
    ("Use nest guards or baffles to reduce predation",
     "Bird Conservation", "Likely Beneficial", 60, 18),
    ("Ban or regulate hunting of declining species",
     "Bird Conservation", "Beneficial", 80, 35),
    ("Manage water levels at wetlands for breeding waders",
     "Bird Conservation", "Likely Beneficial", 62, 22),
    ("Translocate threatened bird populations",
     "Bird Conservation", "Trade-off", 50, 40),
    ("Use playback to attract seabirds to new colony sites",
     "Bird Conservation", "Likely Beneficial", 68, 15),
    ("Ban veterinary use of diclofenac to protect vultures",
     "Bird Conservation", "Beneficial", 90, 12),
    ("Captive breed and release California condors",
     "Bird Conservation", "Likely Beneficial", 65, 8),
    ("Create artificial floating islands for nesting waterbirds",
     "Bird Conservation", "Unknown Effectiveness", 45, 6),

    # === Terrestrial Mammal Conservation ===
    ("Use beehive fences to deter elephants from crops",
     "Terrestrial Mammal Conservation", "Likely Beneficial", 62, 10),
    ("Reintroduce wolves to restore ecosystem function",
     "Terrestrial Mammal Conservation", "Likely Beneficial", 60, 15),
    ("Compensate farmers for livestock losses to predators",
     "Terrestrial Mammal Conservation", "Likely Beneficial", 55, 25),
    ("Dehorn rhinoceroses to reduce poaching incentive",
     "Terrestrial Mammal Conservation", "Unknown Effectiveness", 35, 5),
    ("Create wildlife corridors between protected areas",
     "Terrestrial Mammal Conservation", "Likely Beneficial", 60, 30),
    ("Use fencing to separate livestock from wildlife",
     "Terrestrial Mammal Conservation", "Trade-off", 50, 20),
    ("Provide supplementary feeding during harsh winters",
     "Terrestrial Mammal Conservation", "Trade-off", 48, 18),
    ("Use GPS collars to monitor and manage large carnivores",
     "Terrestrial Mammal Conservation", "Likely Beneficial", 58, 12),

    # === Bat Conservation ===
    ("Provide artificial roost sites (bat boxes) in managed forests",
     "Bat Conservation", "Likely Beneficial", 60, 35),
    ("Protect bat hibernation sites from disturbance",
     "Bat Conservation", "Beneficial", 75, 20),
    ("Modify building renovations to maintain bat roosts",
     "Bat Conservation", "Likely Beneficial", 55, 12),

    # === Amphibian Conservation ===
    ("Create or restore ponds for amphibians",
     "Amphibian Conservation", "Beneficial", 82, 45),
    ("Install road-crossing structures for amphibians",
     "Amphibian Conservation", "Likely Beneficial", 60, 22),
    ("Remove invasive fish from amphibian breeding ponds",
     "Amphibian Conservation", "Beneficial", 78, 15),
    ("Translocate amphibians to new sites",
     "Amphibian Conservation", "Trade-off", 45, 30),
    ("Head-start tadpoles in captivity before release",
     "Amphibian Conservation", "Unknown Effectiveness", 40, 8),

    # === Reptile Conservation ===
    ("Protect sea turtle nesting beaches from disturbance",
     "Reptile Conservation", "Beneficial", 80, 50),
    ("Relocate sea turtle nests to hatcheries",
     "Reptile Conservation", "Trade-off", 55, 35),
    ("Reduce bycatch with turtle excluder devices in fishing nets",
     "Reptile Conservation", "Beneficial", 85, 25),
    ("Create artificial basking sites for reptiles",
     "Reptile Conservation", "Unknown Effectiveness", 40, 8),

    # === Marine and Freshwater Conservation ===
    ("Designate no-take marine reserves",
     "Marine and Freshwater Conservation", "Beneficial", 88, 120),
    ("Remove dams or barriers to fish migration",
     "Marine and Freshwater Conservation", "Beneficial", 80, 40),
    ("Install fish passes at existing barriers",
     "Marine and Freshwater Conservation", "Likely Beneficial", 60, 55),
    ("Establish community-managed freshwater protected areas",
     "Marine and Freshwater Conservation", "Likely Beneficial", 58, 18),
    ("Restore riparian vegetation along rivers",
     "Marine and Freshwater Conservation", "Likely Beneficial", 65, 35),
    ("Use artificial reefs to supplement natural habitat",
     "Marine and Freshwater Conservation", "Unknown Effectiveness", 42, 30),
    ("Reduce nutrient runoff into freshwater systems",
     "Marine and Freshwater Conservation", "Beneficial", 75, 45),

    # === Invertebrate / Bee Conservation ===
    ("Plant wildflower strips on farmland for pollinators",
     "Bee Conservation", "Beneficial", 85, 60),
    ("Reduce pesticide use near pollinator habitats",
     "Bee Conservation", "Beneficial", 78, 35),
    ("Provide artificial nesting sites for solitary bees",
     "Bee Conservation", "Likely Beneficial", 58, 15),
    ("Manage hedgerows to benefit pollinating insects",
     "Bee Conservation", "Likely Beneficial", 62, 20),
    ("Transplant coral fragments onto degraded reefs",
     "Subtidal Benthic Invertebrate Conservation", "Unknown Effectiveness", 40, 25),

    # === Invasive Species Management ===
    ("Eradicate invasive rats from islands",
     "Invasive Species Management", "Beneficial", 88, 50),
    ("Use biological control agents for invasive plants",
     "Invasive Species Management", "Trade-off", 52, 40),
    ("Remove invasive goats from islands",
     "Invasive Species Management", "Beneficial", 85, 20),
    ("Manually remove invasive aquatic plants",
     "Invasive Species Management", "Likely Beneficial", 55, 15),

    # === Forest Conservation ===
    ("Replant mangroves to restore coastal habitat",
     "Forest Conservation", "Likely Beneficial", 62, 30),
    ("Use reduced-impact logging techniques",
     "Forest Conservation", "Likely Beneficial", 58, 25),
    ("Establish payment for ecosystem services schemes",
     "Forest Conservation", "Unknown Effectiveness", 45, 35),
    ("Restore native tree species on degraded land",
     "Forest Conservation", "Likely Beneficial", 65, 40),

    # === Farmland Conservation ===
    ("Plant or restore hedgerows on farmland",
     "Farmland Conservation", "Likely Beneficial", 62, 28),
    ("Leave field margins unsprayed for wildlife",
     "Farmland Conservation", "Beneficial", 75, 40),
    ("Delay mowing to allow ground-nesting birds to fledge",
     "Farmland Conservation", "Likely Beneficial", 60, 20),
    ("Maintain stubble fields over winter for seed-eating birds",
     "Farmland Conservation", "Beneficial", 72, 22),

    # === Shrubland and Heathland Conservation ===
    ("Use prescribed burning to manage habitat",
     "Shrubland and Heathland Conservation", "Trade-off", 50, 35),
    ("Graze heathland with livestock to maintain open habitat",
     "Shrubland and Heathland Conservation", "Likely Beneficial", 58, 18),

    # === Peatland Conservation ===
    ("Block drainage ditches to rewet peatlands",
     "Peatland Conservation", "Beneficial", 78, 30),
    ("Remove trees from previously afforested peatland",
     "Peatland Conservation", "Likely Beneficial", 60, 12),

    # === Plant Conservation ===
    ("Collect and store seeds in ex-situ seed banks",
     "Plant Conservation", "Likely Beneficial", 65, 40),
    ("Translocate threatened plant populations",
     "Plant Conservation", "Trade-off", 48, 25),
    ("Control grazing pressure on threatened plant sites",
     "Plant Conservation", "Likely Beneficial", 58, 20),
]


def bootstrap_interventions():
    with get_session() as session:
        existing = session.execute(text("SELECT COUNT(*) FROM interventions")).scalar()
        if existing > 0:
            logger.info(f"Interventions table already has {existing} rows — skipping bootstrap")
            return

        for action, synopsis, category, effectiveness, n_studies in CE_SEED_DATA:
            session.add(Intervention(
                action        = action,
                synopsis      = synopsis,
                ce_category   = category,
                effectiveness = effectiveness,
                certainty     = None,
                n_studies     = n_studies,
            ))

        logger.info(f"Bootstrapped {len(CE_SEED_DATA)} CE interventions into database")


if __name__ == "__main__":
    bootstrap_interventions()
