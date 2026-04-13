# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/router.py

from dotenv import load_dotenv
load_dotenv()

from enum import Enum


class QueryType(Enum):
    FACTUAL   = "factual"    # IUCN status, species facts → SQL
    LOOKUP    = "lookup"     # CE ratings, intervention scores → DB direct
    SYNTHESIS = "synthesis"  # Complex evidence questions → full RAG


FACTUAL_TRIGGERS = [
    "iucn status", "red list", "extinct", "endemic", "what category",
    "threat status", "conservation status", "how many species",
    "is it endangered", "is it threatened", "what class",
]

LOOKUP_TRIGGERS = [
    "ce rating", "effectiveness score", "what score",
    "conservation evidence rating", "how effective is",
    "effectiveness of", "how many studies", "ce category",
    "what does conservation evidence say about",
]


def classify_query(question: str) -> QueryType:
    """Route a user question to the appropriate handler."""
    q = question.lower()
    if any(trigger in q for trigger in FACTUAL_TRIGGERS):
        return QueryType.FACTUAL
    if any(trigger in q for trigger in LOOKUP_TRIGGERS):
        return QueryType.LOOKUP
    return QueryType.SYNTHESIS
