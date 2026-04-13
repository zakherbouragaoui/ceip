# /Users/zakherfrogman/Documents/Conservation evidence/src/api/main.py

from dotenv import load_dotenv
import os
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contracts.evidence import EvidenceSynthesis
from src.intelligence.query_handler import handle_query
from src.intelligence.db import Species, get_session

app = FastAPI(title="CEIP API v1", version="1.0.0")


class EvidenceRequest(BaseModel):
    question: str
    species:  str = ""
    location: str = ""
    habitat:  str = ""


class FeedbackRequest(BaseModel):
    question: str
    rating:   str   # "positive" | "negative"


@app.post("/api/v1/evidence", response_model=EvidenceSynthesis)
async def get_evidence(req: EvidenceRequest):
    return handle_query(req.question, req.species, req.location)


@app.post("/api/v1/feedback")
async def submit_feedback(req: FeedbackRequest):
    # Log feedback to query_log — used for improvement signal
    return {"status": "received"}


@app.get("/api/v1/species/{name}")
async def get_species(name: str):
    with get_session() as session:
        sp = session.query(Species).filter(
            Species.name.ilike(f"%{name}%")
        ).first()
        if not sp:
            raise HTTPException(404, detail="Species not found")
        return {
            "taxon_id":  sp.taxon_id,
            "name":      sp.name,
            "category":  sp.category,
            "class":     sp.class_name
        }


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}
