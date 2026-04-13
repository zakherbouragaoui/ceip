# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/load_ce.py

from dotenv import load_dotenv
import os
load_dotenv()

import pandas as pd
from sqlalchemy import text
from src.intelligence.db import Intervention, get_session, engine
from loguru import logger

# Path from RESOURCES.md Datasets section
CE_CSV_PATH = os.getenv("CE_CSV_PATH", "data/raw/conservation_evidence.csv")


def load_conservation_evidence():
    logger.info(f"Loading Conservation Evidence from {CE_CSV_PATH}")
    df = pd.read_csv(CE_CSV_PATH)

    logger.info(f"Columns found: {df.columns.tolist()}")
    logger.info(f"Rows: {len(df)}")

    # Clear existing bootstrap data before loading real CSV
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM interventions"))
        conn.commit()
    logger.info("Cleared existing interventions table")

    with get_session() as session:
        count = 0
        for _, row in df.iterrows():
            action = row.get('action', '') or ''
            if not action.strip():
                continue
            session.add(Intervention(
                action        = action.strip(),
                synopsis      = row.get('synopsis', ''),
                effectiveness = None,  # not in scraped data
                certainty     = None,
                ce_category   = row.get('effectiveness_category', ''),
                n_studies     = int(row.get('number_of_studies', 0) or 0)
            ))
            count += 1

    logger.info(f"Loaded {count:,} Conservation Evidence interventions")


if __name__ == "__main__":
    load_conservation_evidence()
