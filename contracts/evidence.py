# /Users/zakherfrogman/Documents/Conservation evidence/contracts/evidence.py

from dotenv import load_dotenv
import os
load_dotenv()

from pydantic import BaseModel, Field, field_validator
from typing import Literal
from enum import Enum


class EvidenceStrength(str, Enum):
    STRONG   = "strong"    # 5+ RCT-quality studies
    MODERATE = "moderate"  # 2-4 studies, reasonable design
    WEAK     = "weak"      # 1 study or poor design
    NONE     = "none"      # No studies found


class Citation(BaseModel):
    index:    int
    paper_id: str
    title:    str
    year:     int | None
    source:   str  # "Conservation Evidence" | "CORE" | "OpenAlex"


class Intervention(BaseModel):
    name:              str
    ce_category:       str | None   # "Beneficial", "Trade-off", "Unknown", etc.
    effectiveness_pct: float | None # 0-100 from Conservation Evidence database
    n_studies:         int
    outcome_direction: Literal["positive", "negative", "mixed", "unclear"]


class EvidenceSynthesis(BaseModel):
    answer:          str
    confidence:      EvidenceStrength
    interventions:   list[Intervention]
    evidence_gaps:   list[str]
    citations:       list[Citation]
    geo_limits:      str | None
    taxa_limits:     str | None

    @field_validator('answer')
    def answer_not_empty(cls, v):
        if len(v.split()) < 20:
            raise ValueError("Answer too short — likely a generation failure")
        return v


class PaperClassification(BaseModel):
    intervention_type: Literal[
        "habitat_restoration", "species_reintro", "protected_area",
        "invasive_control", "captive_breeding", "community_mgmt",
        "policy", "monitoring", "other"
    ]
    species_group: Literal[
        "mammals", "birds", "reptiles", "fish",
        "invertebrates", "plants", "fungi", "general"
    ]
    outcome:                  Literal["positive", "negative", "mixed", "unclear"]
    geography:                str
    has_quantitative_result:  bool
    is_conservation_relevant: bool
