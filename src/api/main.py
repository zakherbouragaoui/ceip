# /Users/zakherfrogman/Documents/Conservation evidence/src/api/main.py

from dotenv import load_dotenv
import os
load_dotenv()

from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contracts.evidence import EvidenceSynthesis
from src.intelligence.query_handler import handle_query
from src.intelligence.db import (
    Species, QueryLog, ConservationProject, AlertQueue, Paper,
    Intervention as DBIntervention, User, get_session,
)
from src.api.auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, get_current_user,
)
from sqlalchemy import func

app = FastAPI(title="CEIP API v1", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────── Request / Response Models ────────────────────────

class EvidenceRequest(BaseModel):
    question: str
    species:  str = ""
    location: str = ""
    habitat:  str = ""

class FeedbackRequest(BaseModel):
    question: str
    rating:   str

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

class LoginRequest(BaseModel):
    email:    str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class UpdateProfileRequest(BaseModel):
    name:  str = ""
    email: str = ""

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str

class ProjectCreate(BaseModel):
    name:               str
    description:        str = ""
    species_groups:     str = ""
    intervention_types: str = ""
    geography:          str = ""
    alert_frequency:    str = "weekly"

class ProjectUpdate(BaseModel):
    name:               str | None = None
    description:        str | None = None
    species_groups:     str | None = None
    intervention_types: str | None = None
    geography:          str | None = None
    alert_frequency:    str | None = None


# ──────────────────────── Health ────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


# ──────────────────────── Auth ────────────────────────

@app.post("/api/v1/auth/register")
async def register(req: RegisterRequest):
    with get_session() as session:
        existing = session.query(User).filter(User.email == req.email).first()
        if existing:
            raise HTTPException(400, detail="Email already registered")
        user = User(
            email=req.email,
            name=req.name,
            password_hash=hash_password(req.password),
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        session.add(user)
        session.flush()
        return {
            "access_token":  create_access_token(user.id),
            "refresh_token": create_refresh_token(user.id),
            "token_type":    "bearer",
        }


@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    with get_session() as session:
        user = session.query(User).filter(User.email == req.email).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(401, detail="Invalid email or password")
        return {
            "access_token":  create_access_token(user.id),
            "refresh_token": create_refresh_token(user.id),
            "token_type":    "bearer",
        }


@app.get("/api/v1/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.post("/api/v1/auth/refresh")
async def refresh_token(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(401, detail="Not a refresh token")
    user_id = int(payload["sub"])
    return {
        "access_token": create_access_token(user_id),
        "token_type":   "bearer",
    }


@app.put("/api/v1/auth/me")
async def update_profile(
    req: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        user = session.query(User).filter(User.id == current_user["id"]).first()
        if req.name:
            user.name = req.name
        if req.email:
            user.email = req.email
        session.flush()
        return {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "created_at": user.created_at,
        }


@app.put("/api/v1/auth/password")
async def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        user = session.query(User).filter(User.id == current_user["id"]).first()
        if not verify_password(req.current_password, user.password_hash):
            raise HTTPException(400, detail="Current password is incorrect")
        user.password_hash = hash_password(req.new_password)
        return {"status": "password_changed"}


# ──────────────────────── Evidence ────────────────────────

@app.post("/api/v1/evidence", response_model=EvidenceSynthesis)
async def get_evidence(
    req: EvidenceRequest,
    current_user: dict = Depends(get_current_user),
):
    result = handle_query(
        req.question, req.species, req.location,
        user_id=str(current_user["id"]),
    )
    return result


@app.post("/api/v1/feedback")
async def submit_feedback(
    req: FeedbackRequest,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        log = (
            session.query(QueryLog)
            .filter(QueryLog.question == req.question)
            .order_by(QueryLog.id.desc())
            .first()
        )
        if log:
            log.user_feedback = req.rating
    return {"status": "received"}


# ──────────────────────── Dashboard ────────────────────────

@app.get("/api/v1/dashboard/stats")
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    with get_session() as session:
        uid = current_user["id"]
        total_queries = session.query(func.count(QueryLog.id)).filter(
            QueryLog.user_id == uid
        ).scalar() or 0
        total_projects = session.query(func.count(ConservationProject.id)).filter(
            ConservationProject.user_id == str(uid),
            ConservationProject.is_active == 1,
        ).scalar() or 0
        total_species = session.query(func.count(Species.taxon_id)).scalar() or 0
        total_papers = session.query(func.count(Paper.id)).scalar() or 0
        unread_alerts = session.query(func.count(AlertQueue.id)).filter(
            AlertQueue.user_id == str(uid),
            AlertQueue.sent == 0,
        ).scalar() or 0
        return {
            "total_queries":  total_queries,
            "total_projects": total_projects,
            "total_species":  total_species,
            "total_papers":   total_papers,
            "unread_alerts":  unread_alerts,
        }


# ──────────────────────── Query History ────────────────────────

@app.get("/api/v1/queries/history")
async def query_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        rows = (
            session.query(QueryLog)
            .filter(QueryLog.user_id == current_user["id"])
            .order_by(QueryLog.id.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id":         r.id,
                "question":   r.question,
                "query_type": r.query_type,
                "confidence": r.confidence,
                "latency_ms": r.latency_ms,
                "timestamp":  r.timestamp,
            }
            for r in rows
        ]


# ──────────────────────── Species (paginated search) ────────────────────────

@app.get("/api/v1/species/{name}")
async def get_species_by_name(name: str):
    with get_session() as session:
        sp = session.query(Species).filter(
            Species.name.ilike(f"%{name}%")
        ).first()
        if not sp:
            raise HTTPException(404, detail="Species not found")
        return {
            "taxon_id":   sp.taxon_id,
            "name":       sp.name,
            "category":   sp.category,
            "class_name": sp.class_name,
        }


@app.get("/api/v1/species")
async def search_species(
    q: str = "",
    category: str = "",
    limit: int = 50,
):
    with get_session() as session:
        query = session.query(Species)
        if q:
            query = query.filter(Species.name.ilike(f"%{q}%"))
        if category:
            query = query.filter(Species.category == category)
        rows = query.limit(limit).all()
        return [
            {
                "taxon_id":   s.taxon_id,
                "name":       s.name,
                "category":   s.category,
                "class_name": s.class_name,
            }
            for s in rows
        ]


# ──────────────────────── Projects CRUD ────────────────────────

@app.post("/api/v1/projects")
async def create_project(
    req: ProjectCreate,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        project = ConservationProject(
            user_id=str(current_user["id"]),
            name=req.name,
            description=req.description,
            species_groups=req.species_groups,
            intervention_types=req.intervention_types,
            geography=req.geography,
            alert_frequency=req.alert_frequency,
            is_active=1,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        session.add(project)
        session.flush()
        return _project_dict(project)


@app.get("/api/v1/projects")
async def list_projects(current_user: dict = Depends(get_current_user)):
    with get_session() as session:
        rows = (
            session.query(ConservationProject)
            .filter(ConservationProject.user_id == str(current_user["id"]))
            .order_by(ConservationProject.id.desc())
            .all()
        )
        return [_project_dict(p) for p in rows]


@app.get("/api/v1/projects/{project_id}")
async def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        p = session.query(ConservationProject).filter(
            ConservationProject.id == project_id,
            ConservationProject.user_id == str(current_user["id"]),
        ).first()
        if not p:
            raise HTTPException(404, detail="Project not found")
        return _project_dict(p)


@app.put("/api/v1/projects/{project_id}")
async def update_project(
    project_id: int,
    req: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        p = session.query(ConservationProject).filter(
            ConservationProject.id == project_id,
            ConservationProject.user_id == str(current_user["id"]),
        ).first()
        if not p:
            raise HTTPException(404, detail="Project not found")
        for field in ["name", "description", "species_groups",
                       "intervention_types", "geography", "alert_frequency"]:
            val = getattr(req, field)
            if val is not None:
                setattr(p, field, val)
        return _project_dict(p)


@app.delete("/api/v1/projects/{project_id}")
async def delete_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        p = session.query(ConservationProject).filter(
            ConservationProject.id == project_id,
            ConservationProject.user_id == str(current_user["id"]),
        ).first()
        if not p:
            raise HTTPException(404, detail="Project not found")
        p.is_active = 0
        return {"status": "archived"}


def _project_dict(p: ConservationProject) -> dict:
    return {
        "id":                 p.id,
        "user_id":            p.user_id,
        "name":               p.name,
        "description":        p.description,
        "species_groups":     p.species_groups,
        "intervention_types": p.intervention_types,
        "geography":          p.geography,
        "alert_frequency":    p.alert_frequency,
        "is_active":          p.is_active,
        "created_at":         p.created_at,
    }


# ──────────────────────── Alerts ────────────────────────

@app.get("/api/v1/alerts")
async def list_alerts(
    project_id: int | None = None,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        query = session.query(AlertQueue).filter(
            AlertQueue.user_id == str(current_user["id"])
        )
        if project_id is not None:
            query = query.filter(AlertQueue.project_id == project_id)
        rows = query.order_by(AlertQueue.id.desc()).limit(100).all()

        result = []
        for a in rows:
            paper = session.query(Paper).filter(Paper.id == a.paper_id).first()
            project = session.query(ConservationProject).filter(
                ConservationProject.id == a.project_id
            ).first()
            result.append({
                "id":           a.id,
                "user_id":      a.user_id,
                "paper_id":     a.paper_id,
                "project_id":   a.project_id,
                "score":        a.score,
                "created_at":   a.created_at,
                "sent":         a.sent,
                "paper_title":  paper.title if paper else None,
                "project_name": project.name if project else None,
            })
        return result


@app.get("/api/v1/alerts/unread/count")
async def unread_alert_count(current_user: dict = Depends(get_current_user)):
    with get_session() as session:
        count = session.query(func.count(AlertQueue.id)).filter(
            AlertQueue.user_id == str(current_user["id"]),
            AlertQueue.sent == 0,
        ).scalar() or 0
        return {"count": count}


@app.put("/api/v1/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: int,
    current_user: dict = Depends(get_current_user),
):
    with get_session() as session:
        a = session.query(AlertQueue).filter(
            AlertQueue.id == alert_id,
            AlertQueue.user_id == str(current_user["id"]),
        ).first()
        if not a:
            raise HTTPException(404, detail="Alert not found")
        a.sent = 1
        return {"status": "read"}
