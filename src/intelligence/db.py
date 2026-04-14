# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/db.py

from dotenv import load_dotenv
import os
load_dotenv()

from sqlalchemy import (create_engine, Column, String, Float,
                         Integer, Text, Boolean)
from sqlalchemy.orm import declarative_base, sessionmaker
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "data/ceip.db")
engine  = create_engine(f"sqlite:///{DB_PATH}")
Base    = declarative_base()


@contextmanager
def get_session():
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True)
    email         = Column(String, unique=True)
    name          = Column(String)
    password_hash = Column(String)
    created_at    = Column(String)


class Paper(Base):
    __tablename__     = "papers"
    id                = Column(String, primary_key=True)   # DOI
    title             = Column(Text)
    abstract          = Column(Text)
    year              = Column(Integer)
    journal           = Column(String)
    pdf_url           = Column(String)
    source            = Column(String)   # "CORE" | "OpenAlex"
    intervention_type = Column(String)
    species_group     = Column(String)
    outcome           = Column(String)
    geography         = Column(String)
    embedded          = Column(Integer, default=0)   # 0=pending, 1=done


class Intervention(Base):
    __tablename__  = "interventions"
    id             = Column(Integer, primary_key=True)
    action         = Column(Text)
    synopsis       = Column(String)
    effectiveness  = Column(Float)
    certainty      = Column(Float)
    ce_category    = Column(String)
    n_studies      = Column(Integer)


class Species(Base):
    __tablename__ = "species"
    taxon_id      = Column(Integer, primary_key=True)
    name          = Column(String)
    category      = Column(String)   # IUCN Red List category
    class_name    = Column(String)
    habitat       = Column(Text)


class SpeciesInterventionLink(Base):
    __tablename__ = "species_intervention_links"
    id            = Column(Integer, primary_key=True)
    species_id    = Column(Integer)
    ce_id         = Column(Integer)
    confidence    = Column(Float)


class QueryLog(Base):
    __tablename__      = "query_log"
    id                 = Column(Integer, primary_key=True)
    question           = Column(Text)
    query_type         = Column(String)
    n_chunks           = Column(Integer)
    confidence         = Column(String)
    validation_passed  = Column(Boolean)
    orphan_cites       = Column(Integer)
    user_id            = Column(Integer)
    user_feedback      = Column(String)
    latency_ms         = Column(Integer)
    model              = Column(String)
    timestamp          = Column(String)


class IngestionRun(Base):
    __tablename__      = "ingestion_runs"
    id                 = Column(Integer, primary_key=True)
    run_date           = Column(String)
    papers_fetched     = Column(Integer)
    papers_relevant    = Column(Integer)
    papers_embedded    = Column(Integer)
    duration_seconds   = Column(Integer)


class ConservationProject(Base):
    __tablename__        = "conservation_projects"
    id                   = Column(Integer, primary_key=True)
    user_id              = Column(String)
    name                 = Column(String)
    description          = Column(Text)
    species_groups       = Column(String)   # comma-separated: "mammals,birds"
    intervention_types   = Column(String)   # comma-separated: "habitat_restoration,invasive_control"
    geography            = Column(String)
    alert_frequency      = Column(String, default="weekly")
    is_active            = Column(Integer, default=1)
    created_at           = Column(String)


class AlertQueue(Base):
    __tablename__  = "alert_queue"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(String)
    paper_id       = Column(String)
    project_id     = Column(Integer)
    score          = Column(Float)
    created_at     = Column(String)
    sent           = Column(Integer, default=0)


class QueryCache(Base):
    __tablename__ = "query_cache"
    cache_key     = Column(String, primary_key=True)
    result_json   = Column(Text)
    created_at    = Column(String)


Base.metadata.create_all(engine)
