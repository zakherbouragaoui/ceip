# /Users/zakherfrogman/Documents/Conservation evidence/src/living/change_detector.py

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from src.intelligence.db import get_session, ConservationProject, AlertQueue
from contracts.evidence import PaperClassification
from loguru import logger


def compute_relevance(classification: PaperClassification, project: dict) -> float:
    """Score how relevant a paper is to a user's conservation project.

    Scoring:
      - species_group match:       +0.4
      - intervention_type match:   +0.4
      - geography overlap:         +0.2
    Max score: 1.0. Alert threshold: >= 0.7
    """
    score = 0.0
    sp_groups = [s.strip() for s in (project.get("species_groups") or "").split(",") if s.strip()]
    iv_types = [s.strip() for s in (project.get("intervention_types") or "").split(",") if s.strip()]
    geo = (project.get("geography") or "").lower()

    if classification.species_group in sp_groups:
        score += 0.4
    if classification.intervention_type in iv_types:
        score += 0.4
    if geo and geo in classification.geography.lower():
        score += 0.2

    return round(score, 2)


def check_paper_against_projects(paper_id: str, classification: PaperClassification):
    """Check a newly classified paper against all active user projects.
    Queue an alert if relevance >= 0.7.
    """
    with get_session() as session:
        projects = (
            session.query(ConservationProject)
            .filter(ConservationProject.is_active == 1)
            .all()
        )
        if not projects:
            return 0

        alerts_queued = 0
        for proj in projects:
            proj_dict = {
                "species_groups": proj.species_groups,
                "intervention_types": proj.intervention_types,
                "geography": proj.geography,
            }
            relevance = compute_relevance(classification, proj_dict)
            if relevance >= 0.7:
                # Check for duplicate alert
                existing = (
                    session.query(AlertQueue)
                    .filter_by(paper_id=paper_id, project_id=proj.id)
                    .first()
                )
                if not existing:
                    session.add(AlertQueue(
                        user_id=proj.user_id,
                        paper_id=paper_id,
                        project_id=proj.id,
                        score=relevance,
                        created_at=__import__("datetime").datetime.now().isoformat(),
                    ))
                    alerts_queued += 1
                    logger.info(f"Alert queued: paper {paper_id} → "
                                f"project {proj.id} (score={relevance})")

        return alerts_queued
