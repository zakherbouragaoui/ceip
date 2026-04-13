# CEIP — Implementation Plan
# Conservation Effectiveness Intelligence Platform

---

## INSTRUCTIONS FOR CLAUDE CODE

Before writing any code, read these three files in this order:

```
1. /Users/zakherfrogman/Documents/Conservation evidence/CLAUDE.md          — current session context and active phase
2. /Users/zakherfrogman/Documents/Conservation evidence/RESOURCES.md       — every API URL, library, model name, env variable, and path
3. /Users/zakherfrogman/Documents/Conservation evidence/IMPLEMENTATION_PLAN.md  — this file, the step-by-step build instructions
```

**Rules that apply to every single file you create:**

- Never hardcode an API key, base URL, model name, or file path as a string literal
- Every credential comes from: `os.getenv("VARIABLE_NAME")` — variable names are defined in `RESOURCES.md` and stored in `/Users/zakherfrogman/Documents/Conservation evidence/.env`
- Every file path comes from: `os.getenv("DB_PATH")`, `os.getenv("CHROMA_PATH")` etc.
- Every external service call uses the base URL from `.env`, not a hardcoded URL
- At the top of every Python file that needs config, write:

```python
from dotenv import load_dotenv
import os
load_dotenv()
```

- If you are unsure of a variable name, stop and check `RESOURCES.md` — it lists every variable
- If you are unsure which library to use, stop and check `RESOURCES.md` — it lists every library with its exact pip name and purpose
- If you are unsure of a file path, stop and check `RESOURCES.md` — it lists the full folder structure

---

## HOW TO START EACH SESSION

Tell Claude Code at the start of every session:

> "Read CLAUDE.md, RESOURCES.md, and IMPLEMENTATION_PLAN.md.
>  We are on Phase [X] Step [Y]. Implement it."

Claude Code will then have everything it needs — the context, the credentials map, and the instructions — without asking you to repeat yourself.

---

## PLATFORM ARCHITECTURE

```
Layer 4 — User Interface     (Phase 6)   Streamlit MVP → React production
Layer 3 — Application Layer  (Phase 5)   FastAPI, user accounts, alerts, TNFD module
Layer 2 — Living Data Layer  (Phase 2)   Weekly agent, runs forever from Phase 2 onward
Layer 1 — Intelligence Layer (Phase 0–4) RAG, Gemma 4, ChromaDB, SQLite, Pydantic
```

Users interact only with Layer 4.
The pipeline below is invisible to them.
Each layer calls the one below it via internal function calls or HTTP.

---

## PHASE 0 — Environment, Contracts & Evaluation Dataset
**Weeks 1–2 | 8 steps | 4 tests**

**Objective:** Set up the project, define all output contracts, and write the
evaluation dataset before touching any pipeline code.

**Harness rule:** The evaluation dataset and Pydantic contracts are written
FIRST. Every subsequent architectural decision is measured against them.

---

### Step 0.1 — Create the project folder structure

> Claude Code: run these commands from the /Users/zakherfrogman/Documents/Conservation evidence/ root.

```bash
cd "/Users/zakherfrogman/Documents/Conservation evidence"

mkdir -p contracts eval \
  data/raw data/processed data/embeddings \
  src/intelligence src/living src/application src/api \
  app tests logs notebooks

touch .env .gitignore README.md CLAUDE.md RESOURCES.md
```

Create `/Users/zakherfrogman/Documents/Conservation evidence/.gitignore` with this exact content:

```
.env
venv/
data/raw/
data/embeddings/
data/ceip.db
__pycache__/
*.pyc
*.pyo
.DS_Store
*.db
logs/
*.egg-info/
dist/
.pytest_cache/
```

---

### Step 0.2 — Define all Pydantic output contracts

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/contracts/evidence.py`.
> This file is the quality guarantee for the entire platform.
> Every AI output must conform to these schemas.
> If Gemma 4 returns output that does not match, it is rejected and retried.
> Do not change these schemas without updating the eval dataset too.

```python
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
```

---

### Step 0.3 — Create the database schema

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/db.py`.
> The DB path comes from os.getenv("DB_PATH") — see RESOURCES.md.

```python
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


Base.metadata.create_all(engine)
```

---

### Step 0.4 — Install Python environment

> Claude Code: run these commands from /Users/zakherfrogman/Documents/Conservation evidence/ root.
> Library names come from RESOURCES.md Python Libraries section.

```bash
python3.11 -m venv venv
source venv/bin/activate

pip install pydantic requests httpx python-dotenv sqlalchemy pandas \
  tqdm loguru beautifulsoup4 lxml openpyxl jupyter rapidfuzz chromadb \
  langchain langchain-community langchain-ollama langchain-groq \
  streamlit fastapi uvicorn sentence-transformers pymupdf geopandas

pip freeze > requirements.txt
```

---

### Step 0.5 — Install Ollama and pull models

> Claude Code: these commands run in macOS Terminal outside /Users/zakherfrogman/Documents/Conservation evidence/.
> Model names come from RESOURCES.md AI Models section.
> The Ollama base URL is stored in .env as OLLAMA_BASE.

```bash
# Install Ollama (macOS)
curl -fsSL https://ollama.com/install.sh | sh

# Pull both required models
# nomic-embed-text: embeddings only, 500MB, 768 dimensions
ollama pull nomic-embed-text

# gemma4:e4b: generation model, ~6GB, 128K context, native JSON mode
# Check exact tag at ollama.com/library/gemma4 if this fails
ollama pull gemma4:e4b

# Verify Metal GPU is active on M1 Pro
ollama list
```

---

### Step 0.6 — Write the master connectivity test

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/tests/t0_connectivity.py`.
> Every URL, key name, and model name comes from .env via os.getenv().
> Read RESOURCES.md APIs section for the full list of base URLs.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/tests/t0_connectivity.py

from dotenv import load_dotenv
import os, requests
load_dotenv()

# All values come from /Users/zakherfrogman/Documents/Conservation evidence/.env — never hardcode
CORE_KEY    = os.getenv("CORE_API_KEY")
IUCN_KEY    = os.getenv("IUCN_API_KEY")
OA_EMAIL    = os.getenv("OPENALEX_EMAIL")
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")

# Base URLs from RESOURCES.md
CORE_BASE   = "https://api.core.ac.uk/v3"
IUCN_BASE   = "https://apiv3.iucnredlist.org/api/v3"
OA_BASE     = "https://api.openalex.org"


def test_core():
    r = requests.get(
        f"{CORE_BASE}/search/works",
        headers={"Authorization": f"Bearer {CORE_KEY}"},
        params={"q": "conservation effectiveness", "limit": 1}
    )
    assert r.status_code == 200, f"CORE failed: {r.status_code}"
    print(f"✓ CORE API: {r.json()['totalHits']:,} papers available")


def test_iucn():
    r = requests.get(
        f"{IUCN_BASE}/species/panthera%20leo",
        params={"token": IUCN_KEY}
    )
    assert r.status_code == 200, f"IUCN failed: {r.status_code}"
    print("✓ IUCN Red List API: connected")


def test_openalex():
    r = requests.get(
        f"{OA_BASE}/works",
        params={"search": "conservation", "per-page": 1, "mailto": OA_EMAIL}
    )
    assert r.status_code == 200, f"OpenAlex failed: {r.status_code}"
    print(f"✓ OpenAlex: {r.json()['meta']['count']:,} works available")


def test_gemma4():
    # Model name from RESOURCES.md AI Models section
    r = requests.post(
        f"{OLLAMA_BASE}/api/generate",
        json={"model": "gemma4:e4b", "prompt": "Reply: OK", "stream": False}
    )
    assert r.status_code == 200, f"Gemma 4 failed: {r.status_code}"
    print("✓ Gemma 4 E4B: running on Ollama")


def test_nomic():
    # Model name from RESOURCES.md AI Models section
    r = requests.post(
        f"{OLLAMA_BASE}/api/embeddings",
        json={"model": "nomic-embed-text", "prompt": "test"}
    )
    assert r.status_code == 200
    emb = r.json()['embedding']
    assert len(emb) == 768, f"Expected 768 dims, got {len(emb)}"
    print(f"✓ nomic-embed-text: 768-dimensional embeddings working")


def test_groq():
    import os
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("⚠  GROQ_API_KEY not set — skip (needed for cloud deployment only)")
        return
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {groq_key}",
                 "Content-Type": "application/json"},
        json={"model": "gemma2-9b-it",
              "messages": [{"role": "user", "content": "Reply: OK"}],
              "max_tokens": 10}
    )
    assert r.status_code == 200, f"Groq failed: {r.status_code}"
    print("✓ Groq API: connected (cloud LLM backend ready)")


if __name__ == "__main__":
    print("=== Phase 0 Connectivity Tests ===\n")
    test_core()
    test_iucn()
    test_openalex()
    test_gemma4()
    test_nomic()
    test_groq()
    print("\n✅ All connectivity tests passed — ready for Phase 1")
```

Run with: `python tests/t0_connectivity.py`

---

### Step 0.7 — Build the 20-question gold evaluation dataset

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/eval/gold_dataset.json`.
> This must be done by hand — it requires domain knowledge.
> Go to conservationevidence.com, browse synopses, pick 20 interventions
> with known CE ratings. See RESOURCES.md Eval Dataset section for
> the required taxa and habitat coverage.

```json
[
  {
    "id": "E001",
    "question": "Does removing introduced predators from islands benefit nesting seabirds?",
    "expected_intervention": "Remove or control introduced predators",
    "expected_ce_category": "Beneficial",
    "expected_direction": "positive",
    "expected_confidence": "strong",
    "species_group": "birds",
    "geography": "global islands",
    "ce_synopsis": "Bird Conservation"
  }
]
```

Add 19 more entries. Requirements:
- At least 6 different taxa groups
- At least 4 different habitat types
- At least 5 different intervention categories
- At least 6 different countries or regions
- Have one conservation colleague verify all 20 answers before proceeding

---

### Phase 0 Tests

Run: `python tests/t0_connectivity.py`

| Test | Pass Threshold | Fail Action |
|------|----------------|-------------|
| T0.1 CORE API | 200 OK | Check CORE_API_KEY in .env |
| T0.1 IUCN API | 200 OK | Token may need 1-5 days approval |
| T0.1 OpenAlex | 200 OK | Check OPENALEX_EMAIL in .env |
| T0.1 Gemma 4 E4B | 200 OK | Run `ollama pull gemma4:e4b` |
| T0.1 nomic-embed-text | 768 dimensions | Run `ollama pull nomic-embed-text` |
| T0.2 Pydantic contracts | Import with no errors | Fix schema definition |
| T0.3 Eval dataset | 20 entries, colleague verified | Spend more time on this |
| T0.4 .env security | Not in `git status` | Add .env to .gitignore |

---

## PHASE 1 — Data Foundation
**Weeks 2–5 | 6 steps | 5 tests**

**Objective:** Load all core datasets into SQLite. By end of phase,
a SQL query answers "what interventions exist for lions in Kenya?" — no AI yet.
Do not use AI synthesis until SQL queries return reliable results.

---

### Step 1.1 — Load Conservation Evidence dataset

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/load_ce.py`.
> The CSV path comes from RESOURCES.md Datasets section.
> Dataset file: /Users/zakherfrogman/Documents/Conservation evidence/data/raw/conservation_evidence.csv
> Download from: conservationevidence.com → About → Download

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/load_ce.py

from dotenv import load_dotenv
import os
load_dotenv()

import pandas as pd
from src.intelligence.db import Intervention, get_session
from loguru import logger

# Path from RESOURCES.md Datasets section
CE_CSV_PATH = os.getenv("CE_CSV_PATH", "data/raw/conservation_evidence.csv")


def load_conservation_evidence():
    logger.info(f"Loading Conservation Evidence from {CE_CSV_PATH}")
    df = pd.read_csv(CE_CSV_PATH)

    # Print columns first to confirm names before mapping
    logger.info(f"Columns found: {df.columns.tolist()}")
    logger.info(f"Rows: {len(df)}")

    with get_session() as session:
        count = 0
        for _, row in df.iterrows():
            session.add(Intervention(
                # Column names may vary — inspect df.columns first
                action        = row.get('action_description')
                               or row.get('action') or row.get('Action'),
                synopsis      = row.get('synopsis_title')
                               or row.get('synopsis') or row.get('Synopsis'),
                effectiveness = row.get('effectiveness_score')
                               or row.get('effectiveness'),
                certainty     = row.get('certainty_score')
                               or row.get('certainty'),
                ce_category   = row.get('effectiveness_category')
                               or row.get('category'),
                n_studies     = row.get('number_of_studies')
                               or row.get('n_studies') or 0
            ))
            count += 1

    logger.info(f"Loaded {count:,} Conservation Evidence interventions")


if __name__ == "__main__":
    load_conservation_evidence()
```

---

### Step 1.2 — Fetch IUCN species data

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_iucn.py`.
> API base URL and token come from .env.
> IUCN_BASE = "https://apiv3.iucnredlist.org/api/v3"
> Token variable: IUCN_API_KEY

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_iucn.py

from dotenv import load_dotenv
import os, requests, time
load_dotenv()

from tqdm import tqdm
from src.intelligence.db import Species, SpeciesInterventionLink, get_session
from loguru import logger

# From RESOURCES.md APIs section
IUCN_BASE = "https://apiv3.iucnredlist.org/api/v3"
IUCN_KEY  = os.getenv("IUCN_API_KEY")


def fetch_all_species():
    page = 0
    while True:
        r = requests.get(
            f"{IUCN_BASE}/species/page/{page}",
            params={"token": IUCN_KEY}
        ).json()
        batch = r.get('result', [])
        if not batch:
            break
        logger.info(f"Page {page}: {len(batch)} species")
        yield from batch
        page += 1
        time.sleep(0.5)  # rate limit respect


def fetch_species_actions(taxon_id: int) -> list:
    r = requests.get(
        f"{IUCN_BASE}/species/id/{taxon_id}/actions",
        params={"token": IUCN_KEY}
    )
    return r.json().get('result', [])


def load_species_to_db():
    with get_session() as session:
        count = 0
        for sp in tqdm(fetch_all_species(), desc="Loading IUCN species"):
            existing = session.query(Species).filter_by(
                taxon_id=sp['taxonid']
            ).first()
            if existing:
                continue
            session.add(Species(
                taxon_id   = sp['taxonid'],
                name       = sp['scientific_name'],
                category   = sp['category'],
                class_name = sp.get('class_name', ''),
                habitat    = ''
            ))
            count += 1
        logger.info(f"Loaded {count:,} species")


if __name__ == "__main__":
    load_species_to_db()
```

---

### Step 1.3 — Fetch papers from CORE and OpenAlex

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_papers.py`.
> CORE base URL: https://api.core.ac.uk/v3
> OpenAlex base URL: https://api.openalex.org
> Both come from RESOURCES.md APIs section.
> Keys: CORE_API_KEY and OPENALEX_EMAIL from .env.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/fetch_papers.py

from dotenv import load_dotenv
import os, requests, time
load_dotenv()

from tqdm import tqdm
from src.intelligence.db import Paper, get_session
from loguru import logger

# From RESOURCES.md APIs section
CORE_BASE    = "https://api.core.ac.uk/v3"
OA_BASE      = "https://api.openalex.org"
CORE_KEY     = os.getenv("CORE_API_KEY")
OA_EMAIL     = os.getenv("OPENALEX_EMAIL")

# Six targeted search queries covering all major intervention types
QUERIES = [
    "conservation effectiveness intervention outcome",
    "species recovery conservation action evidence",
    "protected area management effectiveness",
    "habitat restoration biodiversity outcome",
    "invasive species removal control effectiveness",
    "community conservation human wildlife coexistence",
]


def fetch_core_papers(query: str, limit: int = 3000) -> list:
    results, offset = [], 0
    while offset < limit:
        r = requests.get(
            f"{CORE_BASE}/search/works",
            headers={"Authorization": f"Bearer {CORE_KEY}"},
            params={
                "q":      query,
                "limit":  100,
                "offset": offset,
                "fields": "id,title,abstract,doi,yearPublished,downloadUrl"
            }
        )
        if r.status_code != 200:
            logger.warning(f"CORE error {r.status_code} at offset {offset}")
            break
        batch = r.json().get('results', [])
        if not batch:
            break
        results.extend(batch)
        offset += 100
        time.sleep(0.2)
    return results


def fetch_openalex_papers(query: str, limit: int = 2000) -> list:
    results, cursor = [], "*"
    while len(results) < limit:
        r = requests.get(
            f"{OA_BASE}/works",
            params={
                "search":   query,
                "per-page": 200,
                "cursor":   cursor,
                "select":   "id,title,abstract_inverted_index,doi,publication_year",
                "mailto":   OA_EMAIL
            }
        )
        if r.status_code != 200:
            break
        data   = r.json()
        batch  = data.get('results', [])
        if not batch:
            break
        results.extend(batch)
        cursor = data.get('meta', {}).get('next_cursor')
        if not cursor:
            break
        time.sleep(0.1)
    return results


def reconstruct_abstract(work: dict) -> str:
    inv = work.get('abstract_inverted_index') or {}
    if not inv:
        return work.get('title', '')
    pairs = [(w, p) for w, positions in inv.items() for p in positions]
    return " ".join(w for w, _ in sorted(pairs, key=lambda x: x[1]))


def save_papers(papers: list, source: str):
    with get_session() as session:
        saved = 0
        for p in papers:
            doi = p.get('doi') or p.get('id', '')
            if not doi:
                continue
            if session.query(Paper).filter_by(id=doi).first():
                continue
            abstract = (p.get('abstract', '')
                       or reconstruct_abstract(p) or '')
            session.add(Paper(
                id       = doi,
                title    = p.get('title', ''),
                abstract = abstract,
                year     = p.get('yearPublished') or p.get('publication_year'),
                pdf_url  = p.get('downloadUrl'),
                source   = source,
                embedded = 0
            ))
            saved += 1
        logger.info(f"Saved {saved:,} new papers from {source}")


def run_all_queries():
    for query in tqdm(QUERIES, desc="Running queries"):
        logger.info(f"CORE query: {query}")
        core_papers = fetch_core_papers(query)
        save_papers(core_papers, "CORE")

        logger.info(f"OpenAlex query: {query}")
        oa_papers = fetch_openalex_papers(query)
        save_papers(oa_papers, "OpenAlex")


if __name__ == "__main__":
    run_all_queries()
```

---

### Step 1.4 — Classify papers with Gemma 4

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/classify.py`.
> Model name: gemma4:e4b — from RESOURCES.md AI Models section.
> Ollama base URL: os.getenv("OLLAMA_BASE")
> Output must conform to PaperClassification from contracts/evidence.py.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/classify.py

from dotenv import load_dotenv
import os, requests, json
load_dotenv()

from contracts.evidence import PaperClassification
from loguru import logger

# From RESOURCES.md AI Models section
OLLAMA_BASE  = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_GENERATION = "gemma4:e4b"  # from RESOURCES.md

PROMPT = """Extract structured metadata from this conservation paper abstract.
Return ONLY valid JSON — no other text, no markdown, no explanation:
{{
  "intervention_type": "habitat_restoration|species_reintro|protected_area|invasive_control|captive_breeding|community_mgmt|policy|monitoring|other",
  "species_group": "mammals|birds|reptiles|fish|invertebrates|plants|fungi|general",
  "outcome": "positive|negative|mixed|unclear",
  "geography": "country or region or global",
  "has_quantitative_result": true or false,
  "is_conservation_relevant": true or false
}}

Abstract: {abstract}"""


def classify_paper(abstract: str,
                   max_retries: int = 3) -> PaperClassification | None:
    for attempt in range(max_retries):
        try:
            r = requests.post(
                f"{OLLAMA_BASE}/api/generate",
                json={
                    "model":   MODEL_GENERATION,
                    "prompt":  PROMPT.format(abstract=abstract[:1500]),
                    "stream":  False,
                    "format":  "json",      # Gemma 4 native JSON mode
                    "options": {"temperature": 0.0}
                },
                timeout=30
            )
            return PaperClassification(**json.loads(r.json()['response']))
        except Exception as e:
            logger.warning(f"Classify attempt {attempt + 1} failed: {e}")
    return None
```

---

### Step 1.5 — Build species–intervention links

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/link_species.py`.
> Uses rapidfuzz library — from RESOURCES.md Python Libraries section.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/link_species.py

from dotenv import load_dotenv
load_dotenv()

from rapidfuzz import fuzz
from tqdm import tqdm
from src.intelligence.db import (Species, Intervention,
                                  SpeciesInterventionLink, get_session)
from src.intelligence.fetch_iucn import fetch_species_actions
from loguru import logger


def match_iucn_to_ce(iucn_action: str,
                     ce_items: list,
                     top_k: int = 3) -> list:
    scores = [
        (ce.id, fuzz.token_sort_ratio(
            iucn_action.lower(), ce.action.lower()) / 100)
        for ce in ce_items
    ]
    return sorted(scores, key=lambda x: x[1], reverse=True)[:top_k]


def build_links(min_confidence: float = 0.5):
    with get_session() as session:
        species_list = session.query(Species).all()
        ce_items     = session.query(Intervention).all()
        logger.info(f"Linking {len(species_list)} species to "
                    f"{len(ce_items)} CE interventions")

        for sp in tqdm(species_list, desc="Building links"):
            actions = fetch_species_actions(sp.taxon_id)
            for action in actions:
                matches = match_iucn_to_ce(
                    action.get('name', ''), ce_items
                )
                for ce_id, confidence in matches:
                    if confidence >= min_confidence:
                        existing = session.query(SpeciesInterventionLink).filter_by(
                            species_id=sp.taxon_id, ce_id=ce_id
                        ).first()
                        if not existing:
                            session.add(SpeciesInterventionLink(
                                species_id = sp.taxon_id,
                                ce_id      = ce_id,
                                confidence = confidence
                            ))


if __name__ == "__main__":
    build_links()
```

---

### Step 1.6 — SQL baseline test

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/tests/t1_sql_baseline.py`.
> Record the baseline score — the RAG system in Phase 4 must beat it.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/tests/t1_sql_baseline.py

from dotenv import load_dotenv
load_dotenv()

from sqlalchemy import text
from src.intelligence.db import engine
from loguru import logger


def query_interventions(species_name: str) -> list:
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT i.action, i.ce_category, i.effectiveness, i.n_studies
            FROM interventions i
            JOIN species_intervention_links l ON i.id = l.ce_id
            JOIN species s ON s.taxon_id = l.species_id
            WHERE s.name LIKE :name
            ORDER BY i.effectiveness DESC
        """), {"name": f"%{species_name}%"})
        return [dict(r._mapping) for r in rows]


TEST_CASES = [
    ("Panthera leo",      ["predator", "habitat", "protection"]),
    ("Puffinus puffinus", ["predator removal", "translocation"]),
    ("Chelonia mydas",    ["nesting", "protection"]),
    ("Salmo salar",       ["habitat", "restoration"]),
    ("Elephas maximus",   ["corridor", "protection"]),
]

if __name__ == "__main__":
    baseline = 0
    for species, keywords in TEST_CASES:
        results = query_interventions(species)
        found   = " ".join(r['action'] or '' for r in results).lower()
        hits    = sum(1 for kw in keywords if kw in found)
        if hits >= len(keywords) // 2:
            baseline += 1
        logger.info(f"{species}: {len(results)} interventions, "
                    f"{hits}/{len(keywords)} keywords matched")

    print(f"\n=== SQL BASELINE: {baseline}/{len(TEST_CASES)} ===")
    print("Save this number in CLAUDE.md.")
    print("Phase 4 RAG system MUST beat this score.")
```

---

### Phase 1 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T1.1 CE interventions | > 3,000 rows | Inspect CSV column names |
| T1.1 IUCN species | > 40,000 rows | Check pagination loop |
| T1.1 Papers loaded | > 15,000 with abstracts | Add more query terms |
| T1.1 Duplicate DOIs | 0 | Confirm unique filter works |
| T1.2 Classification accuracy | > 80% on 50 manual checks | Add examples to prompt |
| T1.3 Species links | > 3 per known species | Lower min_confidence to 0.4 |
| T1.4 SQL latency | < 200ms | Add database indexes |
| T1.5 SQL baseline score | Record exact number | This is your benchmark |

---

## PHASE 2 — Living Data Infrastructure
**Weeks 5–7 | 4 steps | 4 tests**

**Objective:** Build the weekly ingestion agent. This runs from now on forever.
The entire platform is designed around continuous data flow — not snapshots.

---

### Step 2.1 — Weekly ingestion agent

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/living/ingestion_agent.py`.
> OpenAlex base URL: https://api.openalex.org — from RESOURCES.md.
> Email param: os.getenv("OPENALEX_EMAIL")
> Model for classification: gemma4:e4b from RESOURCES.md.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/living/ingestion_agent.py

from dotenv import load_dotenv
import os, asyncio
load_dotenv()

import httpx
from datetime import datetime, timedelta
from tqdm import tqdm
from src.intelligence.db import Paper, IngestionRun, get_session
from src.intelligence.classify import classify_paper
from loguru import logger

# From RESOURCES.md APIs section
OA_BASE   = "https://api.openalex.org"
OA_EMAIL  = os.getenv("OPENALEX_EMAIL")

# OpenAlex concept IDs for conservation biology
CONSERVATION_CONCEPTS = [
    "C149923435",   # Conservation biology
    "C2780878898",  # Biodiversity
    "C2993671",     # Wildlife conservation
    "C100360200",   # Habitat conservation
]

MUST_HAVE_KEYWORDS = {
    "conservation", "biodiversity", "species", "habitat",
    "wildlife", "ecosystem", "restoration", "protected"
}


def reconstruct_abstract(work: dict) -> str:
    inv = work.get('abstract_inverted_index') or {}
    if not inv:
        return work.get('title', '')
    pairs = [(w, p) for w, pos_list in inv.items() for p in pos_list]
    return " ".join(w for w, _ in sorted(pairs, key=lambda x: x[1]))


def keyword_prefilter(text: str) -> bool:
    return bool(MUST_HAVE_KEYWORDS & set(text.lower().split()))


async def fetch_new_papers(days_ago: int = 7) -> list:
    since   = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
    results = []
    async with httpx.AsyncClient(timeout=30) as client:
        for concept_id in CONSERVATION_CONCEPTS:
            r = await client.get(f"{OA_BASE}/works", params={
                "filter":   f"concepts.id:{concept_id},"
                            f"from_publication_date:{since}",
                "per-page": 200,
                "select":   "id,title,abstract_inverted_index,"
                            "doi,publication_year",
                "mailto":   OA_EMAIL
            })
            if r.status_code == 200:
                results.extend(r.json().get('results', []))
    return results


async def run_weekly_ingestion():
    start = datetime.now()
    logger.info("=== Weekly ingestion started ===")
    papers = await fetch_new_papers(days_ago=7)
    new, skipped, irrelevant = 0, 0, 0

    with get_session() as session:
        for paper in tqdm(papers, desc="Processing papers"):
            doi = paper.get('doi')
            if not doi:
                continue
            if session.query(Paper).filter_by(id=doi).first():
                skipped += 1
                continue
            abstract = reconstruct_abstract(paper)
            if not keyword_prefilter(abstract):
                irrelevant += 1
                continue
            classification = classify_paper(abstract)
            if classification and classification.is_conservation_relevant:
                session.add(Paper(
                    id                = doi,
                    title             = paper.get('title', ''),
                    abstract          = abstract,
                    year              = paper.get('publication_year'),
                    source            = "OpenAlex",
                    intervention_type = classification.intervention_type,
                    species_group     = classification.species_group,
                    outcome           = classification.outcome,
                    geography         = classification.geography,
                    embedded          = 0
                ))
                new += 1

        duration = int((datetime.now() - start).total_seconds())
        session.add(IngestionRun(
            run_date         = start.isoformat(),
            papers_fetched   = len(papers),
            papers_relevant  = new,
            papers_embedded  = 0,
            duration_seconds = duration
        ))

    logger.info(f"Done: {new} new | {skipped} duplicate | "
                f"{irrelevant} irrelevant | {duration}s")


if __name__ == "__main__":
    asyncio.run(run_weekly_ingestion())
```

Schedule with cron (run in macOS Terminal):

```bash
crontab -e
# Add this line — runs every Monday 6am:
0 6 * * 1 cd "/Users/zakherfrogman/Documents/Conservation evidence" && source venv/bin/activate && python -m src.living.ingestion_agent >> logs/ingestion.log 2>&1
```

---

### Step 2.2 — Change detector for user alerts

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/living/change_detector.py`.
> Called after each paper is embedded to check user project matches.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/living/change_detector.py

from dotenv import load_dotenv
load_dotenv()

from src.intelligence.db import get_session
from loguru import logger


def compute_relevance(classification, project) -> float:
    score    = 0.0
    sp_groups = (project.get('species_groups') or '').split(',')
    iv_types  = (project.get('intervention_types') or '').split(',')
    if classification.species_group in sp_groups:
        score += 0.5
    if classification.intervention_type in iv_types:
        score += 0.5
    return score


def check_paper_against_projects(paper_id: str, classification):
    with get_session() as session:
        projects = session.execute(
            "SELECT id, user_id, species_groups, intervention_types "
            "FROM conservation_projects WHERE is_active = 1"
        ).fetchall()
        for project in projects:
            proj_dict = dict(project._mapping)
            relevance = compute_relevance(classification, proj_dict)
            if relevance >= 0.7:
                session.execute(
                    "INSERT OR IGNORE INTO alert_queue "
                    "(user_id, paper_id, project_id, score, created_at) "
                    "VALUES (?, ?, ?, ?, datetime('now'))",
                    (proj_dict['user_id'], paper_id,
                     proj_dict['id'], relevance)
                )
                logger.info(f"Alert queued: paper {paper_id} → "
                            f"project {proj_dict['id']}")
```

---

### Phase 2 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T2.1 Papers fetched per run | > 50 | Expand concept ID list |
| T2.1 Relevance filter rate | 15–40% | Adjust keyword set |
| T2.1 Run completes | < 10 minutes | Add async batching |
| T2.2 Precision (manual check) | > 85% relevant | Tighten keywords |
| T2.3 Duplicate prevention | 0 new on re-run | DOI constraint working |
| T2.4 Cron entry visible | `crontab -l` | Re-add cron line |

---

## PHASE 3 — Embedding and Semantic Search
**Weeks 7–9 | 4 steps | 4 tests**

**Objective:** Convert all documents to vectors in ChromaDB.
The living agent from Phase 2 feeds new papers here automatically.

---

### Step 3.1 — Initialise ChromaDB

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/vector_store.py`.
> Storage path: os.getenv("CHROMA_PATH") — from RESOURCES.md.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/vector_store.py

from dotenv import load_dotenv
import os
load_dotenv()

import chromadb
from chromadb.config import Settings

# Path from RESOURCES.md Storage section
CHROMA_PATH = os.getenv("CHROMA_PATH", "data/embeddings/")

client = chromadb.PersistentClient(
    path     = CHROMA_PATH,
    settings = Settings(anonymized_telemetry=False)
)

# Two collections — one per document type
papers_col = client.get_or_create_collection(
    "papers",
    metadata={"hnsw:space": "cosine"}
)

ce_col = client.get_or_create_collection(
    "ce_interventions",
    metadata={"hnsw:space": "cosine"}
)
```

---

### Step 3.2 — Batch embedding pipeline

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/embedder.py`.
> Embedding model: nomic-embed-text — from RESOURCES.md AI Models section.
> Ollama base URL: os.getenv("OLLAMA_BASE").
> This job takes 3–6 hours on M1 Pro. Run overnight. It is resumable.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/embedder.py

from dotenv import load_dotenv
import os, requests
load_dotenv()

from langchain.text_splitter import RecursiveCharacterTextSplitter
from tqdm import tqdm
from src.intelligence.db import Paper, Intervention, get_session
from src.intelligence.vector_store import papers_col, ce_col
from loguru import logger

# From RESOURCES.md AI Models section
OLLAMA_BASE    = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_EMBED    = "nomic-embed-text"   # embeddings model

splitter = RecursiveCharacterTextSplitter(
    chunk_size    = 400,
    chunk_overlap = 50
)


def get_embedding(text: str) -> list[float]:
    r = requests.post(
        f"{OLLAMA_BASE}/api/embeddings",
        json={"model": MODEL_EMBED, "prompt": text},
        timeout=30
    )
    return r.json()['embedding']


def embed_all_papers():
    with get_session() as session:
        papers = session.query(Paper).filter_by(embedded=0).all()
        logger.info(f"Embedding {len(papers):,} papers")

        for paper in tqdm(papers, desc="Embedding papers"):
            if not paper.abstract:
                session.query(Paper).filter_by(id=paper.id).update(
                    {"embedded": 1}
                )
                continue
            chunks = splitter.split_text(paper.abstract)
            for i, chunk in enumerate(chunks):
                papers_col.add(
                    documents  = [chunk],
                    embeddings = [get_embedding(chunk)],
                    ids        = [f"{paper.id}_c{i}"],
                    metadatas  = [{
                        "paper_id":          paper.id,
                        "year":              paper.year or 0,
                        "intervention_type": paper.intervention_type or "",
                        "species_group":     paper.species_group or "",
                        "title":             paper.title or ""
                    }]
                )
            session.query(Paper).filter_by(id=paper.id).update(
                {"embedded": 1}
            )
    logger.info("Paper embedding complete")


def embed_ce_interventions():
    with get_session() as session:
        items = session.query(Intervention).all()
        logger.info(f"Embedding {len(items):,} CE interventions")
        for item in tqdm(items, desc="Embedding CE"):
            # Combine fields for richer semantic representation
            text = (f"{item.action} [{item.ce_category}] {item.synopsis}")
            ce_col.add(
                documents  = [text],
                embeddings = [get_embedding(text)],
                ids        = [f"ce_{item.id}"],
                metadatas  = [{
                    "ce_id":         item.id,
                    "ce_category":   item.ce_category or "",
                    "effectiveness": item.effectiveness or 0,
                    "n_studies":     item.n_studies or 0
                }]
            )
    logger.info("CE intervention embedding complete")


if __name__ == "__main__":
    embed_ce_interventions()
    embed_all_papers()
```

---

### Step 3.3 — Build hybrid retriever

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/retriever.py`.
> Uses langchain-ollama and langchain-community — from RESOURCES.md Python Libraries.
> Embedding model: nomic-embed-text from RESOURCES.md.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/retriever.py

from dotenv import load_dotenv
import os
load_dotenv()

from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_ollama import OllamaEmbeddings
from src.intelligence.vector_store import client

# From RESOURCES.md AI Models and APIs sections
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_EMBED = "nomic-embed-text"  # from RESOURCES.md

embedding_fn = OllamaEmbeddings(
    model    = MODEL_EMBED,
    base_url = OLLAMA_BASE
)

chroma_store = Chroma(
    client             = client,
    collection_name    = "papers",
    embedding_function = embedding_fn
)

vector_retriever = chroma_store.as_retriever(search_kwargs={"k": 8})


def build_hybrid_retriever(all_chunks: list[str]) -> EnsembleRetriever:
    bm25   = BM25Retriever.from_texts(all_chunks)
    bm25.k = 8
    return EnsembleRetriever(
        retrievers = [vector_retriever, bm25],
        weights    = [0.6, 0.4]   # favour semantic slightly
    )
```

---

### Step 3.4 — Connect living agent to embedder

> Claude Code: update `/Users/zakherfrogman/Documents/Conservation evidence/src/living/ingestion_agent.py`.
> Add a call to embed_all_papers() after each ingestion run.
> This ensures new papers are queryable within 24 hours of ingestion.

```python
# Add to the end of run_weekly_ingestion() in ingestion_agent.py
from src.intelligence.embedder import embed_all_papers

async def run_weekly_ingestion():
    # ... existing code ...
    # After saving new papers, embed them immediately
    logger.info("Embedding newly ingested papers")
    embed_all_papers()
    logger.info("New papers are now queryable")
```

---

### Phase 3 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T3.1 Papers chunks in ChromaDB | > 40,000 | Check embed_all_papers log |
| T3.1 CE items in ChromaDB | > 3,000 | Run embed_ce_interventions() |
| T3.2 Top-5 relevance on 20 queries | > 80% topically relevant | Adjust chunk size |
| T3.2 Off-topic in top-3 | 0 | Adjust hybrid weights |
| T3.3 CE retrieval sanity | 3 specific queries pass | Re-embed with richer text |
| T3.4 Single query latency | < 2 seconds | Check ChromaDB index |
| T3.4 New paper queryable | < 24 hours after ingestion | Fix agent → embedder link |

---

## PHASE 4 — Harness-First RAG Engine
**Weeks 9–12 | 6 steps | 6 tests**

**Objective:** Full question → route → retrieve → synthesise → validate → log pipeline.
The LLM is one swappable component. Pydantic contracts enforce quality at every output.

---

### Step 4.1 — Query router

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/router.py`.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/router.py

from enum import Enum


class QueryType(Enum):
    FACTUAL   = "factual"    # IUCN status, species facts → SQL
    LOOKUP    = "lookup"     # CE ratings, intervention scores → DB direct
    SYNTHESIS = "synthesis"  # Complex evidence questions → full RAG


def classify_query(question: str) -> QueryType:
    q = question.lower()
    if any(w in q for w in ["iucn status", "red list", "extinct",
                             "endemic", "what category"]):
        return QueryType.FACTUAL
    if any(w in q for w in ["ce rating", "effectiveness score",
                             "what score", "conservation evidence rating",
                             "how effective is"]):
        return QueryType.LOOKUP
    return QueryType.SYNTHESIS
```

---

### Step 4.2 — Evidence synthesiser

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/synthesiser.py`.
> Generation model: gemma4:e4b from RESOURCES.md AI Models section.
> Ollama base URL: os.getenv("OLLAMA_BASE").
> All outputs validated against EvidenceSynthesis from contracts/evidence.py.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/synthesiser.py

from dotenv import load_dotenv
import os, requests, json
load_dotenv()

from contracts.evidence import (EvidenceSynthesis, Citation,
                                 Intervention, EvidenceStrength)
from loguru import logger

# From RESOURCES.md AI Models section
OLLAMA_BASE      = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_GENERATION = "gemma4:e4b"   # generation model from RESOURCES.md

SYNTHESIS_PROMPT = """You are an expert conservation scientist.
Synthesise the evidence and answer the practitioner's question directly.

QUESTION: {question}
SPECIES / HABITAT: {context}
LOCATION: {location}

RETRIEVED EVIDENCE — cite every factual claim by [N]:
{evidence_chunks}

CE DATABASE RATINGS:
{ce_ratings}

Return ONLY this JSON structure — no other text:
{{
  "answer": "2-4 sentences directly answering the question, citing evidence by [N]",
  "confidence": "strong|moderate|weak|none",
  "interventions": [
    {{
      "name": "intervention name",
      "ce_category": "Beneficial|Trade-off|Unknown|Unlikely|Harmful or null",
      "effectiveness_pct": 75.0,
      "n_studies": 12,
      "outcome_direction": "positive|negative|mixed|unclear"
    }}
  ],
  "evidence_gaps": ["gap 1", "gap 2"],
  "citations": [
    {{"index": 1, "paper_id": "doi_here", "title": "paper title",
      "year": 2023, "source": "CORE"}}
  ],
  "geo_limits": "describe geographic limits or null",
  "taxa_limits": "describe taxonomic limits or null"
}}

RULES:
- Only use information from the provided evidence
- If evidence is absent, set confidence to none
- Never invent facts, studies, or statistics
- Acknowledge uncertainty explicitly"""


def safe_fallback(question: str, chunks: list) -> EvidenceSynthesis:
    return EvidenceSynthesis(
        answer        = ("Evidence synthesis temporarily unavailable. "
                         "Source documents are listed in citations."),
        confidence    = EvidenceStrength.NONE,
        interventions = [],
        evidence_gaps = ["Generation failed — please retry"],
        citations     = [
            Citation(
                index    = i + 1,
                paper_id = c.metadata.get('paper_id', ''),
                title    = c.metadata.get('title', 'Unknown'),
                year     = c.metadata.get('year'),
                source   = 'CORE'
            )
            for i, c in enumerate(chunks[:5])
        ],
        geo_limits  = None,
        taxa_limits = None
    )


def format_ce_rows(ce_rows: list) -> str:
    if not ce_rows:
        return "No Conservation Evidence ratings found for this query."
    return "\n".join(
        f"- {r.get('action', '')}: {r.get('ce_category', 'Unknown')} "
        f"(score: {r.get('effectiveness', 'N/A')}, "
        f"studies: {r.get('n_studies', 0)})"
        for r in ce_rows[:5]
    )


def synthesise(question: str,
               context: str,
               location: str,
               chunks: list,
               ce_rows: list,
               max_retries: int = 3) -> EvidenceSynthesis:

    evidence_text = "\n\n".join(
        f"[{i+1}] {c.page_content} (year: {c.metadata.get('year','?')})"
        for i, c in enumerate(chunks[:8])
    )
    prompt = SYNTHESIS_PROMPT.format(
        question       = question,
        context        = context or "Not specified",
        location       = location or "Not specified",
        evidence_chunks = evidence_text or "No evidence retrieved.",
        ce_ratings     = format_ce_rows(ce_rows)
    )

    for attempt in range(max_retries):
        try:
            r = requests.post(
                f"{OLLAMA_BASE}/api/generate",
                json={
                    "model":   MODEL_GENERATION,
                    "prompt":  prompt,
                    "stream":  False,
                    "format":  "json",        # Gemma 4 native JSON mode
                    "options": {"temperature": 0.05}
                },
                timeout=90
            )
            raw = json.loads(r.json()['response'])
            return EvidenceSynthesis(**raw)   # Pydantic validates here
        except Exception as e:
            logger.warning(f"Synthesis attempt {attempt + 1} failed: {e}")

    logger.error("All synthesis attempts failed — returning fallback")
    return safe_fallback(question, chunks)
```

---

### Step 4.3 — Citation validator

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/validator.py`.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/validator.py

import re
from contracts.evidence import EvidenceSynthesis


def validate_synthesis(result: EvidenceSynthesis,
                       source_chunks: list) -> dict:
    cited_in_text = {
        int(n) for n in re.findall(r'\[(\d+)\]', result.answer)
    }
    citation_objs = {c.index for c in result.citations}
    available     = set(range(1, len(source_chunks) + 1))

    orphan_cites  = cited_in_text - available
    missing_objs  = cited_in_text - citation_objs

    return {
        "valid":           len(orphan_cites) == 0 and len(missing_objs) == 0,
        "orphan_cites":    list(orphan_cites),
        "missing_objects": list(missing_objs),
        "confidence_ok":   not (
            result.confidence == "strong"
            and len(result.interventions) < 2
        )
    }
```

---

### Step 4.4 — LLM backend switcher

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/llm_config.py`.
> Switching LLM_BACKEND in .env is all that is needed to move
> from local Ollama to cloud Groq for deployment.
> All model names and API keys come from .env and RESOURCES.md.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/llm_config.py

from dotenv import load_dotenv
import os
load_dotenv()


def get_llm():
    # Set LLM_BACKEND in .env to switch between local and cloud
    # LLM_BACKEND=ollama    → local development (default)
    # LLM_BACKEND=groq      → cloud deployment (Streamlit Cloud etc.)
    # LLM_BACKEND=huggingface → alternative cloud
    backend = os.getenv("LLM_BACKEND", "ollama")

    if backend == "ollama":
        from langchain_ollama import OllamaLLM
        # Model name and base URL from RESOURCES.md and .env
        return OllamaLLM(
            model    = "gemma4:e4b",
            base_url = os.getenv("OLLAMA_BASE", "http://localhost:11434"),
            temperature = 0.05
        )

    if backend == "groq":
        from langchain_groq import ChatGroq
        # API key from .env, model from RESOURCES.md Cloud Models section
        return ChatGroq(
            model   = "gemma2-9b-it",
            api_key = os.getenv("GROQ_API_KEY"),
            temperature = 0.05
        )

    if backend == "huggingface":
        from langchain_huggingface import HuggingFaceEndpoint
        return HuggingFaceEndpoint(
            repo_id                  = "google/gemma-3-4b-it",
            huggingfacehub_api_token = os.getenv("HF_TOKEN")
        )

    raise ValueError(
        f"Unknown LLM_BACKEND: {backend}. "
        f"Set LLM_BACKEND=ollama or groq in .env"
    )
```

---

### Step 4.5 — Full query handler with logging

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/query_handler.py`.
> This orchestrates the full pipeline: route → retrieve → synthesise → validate → log.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/query_handler.py

from dotenv import load_dotenv
import time
load_dotenv()

from datetime import datetime
from src.intelligence.router import classify_query, QueryType
from src.intelligence.synthesiser import synthesise, safe_fallback
from src.intelligence.validator import validate_synthesis
from src.intelligence.db import QueryLog, Intervention, get_session
from contracts.evidence import EvidenceSynthesis
from loguru import logger


def get_ce_for_context(species: str, question: str) -> list:
    with get_session() as session:
        items = session.query(Intervention).limit(20).all()
        return [
            {
                "action":        i.action,
                "ce_category":   i.ce_category,
                "effectiveness": i.effectiveness,
                "n_studies":     i.n_studies
            }
            for i in items
            if i.action and (
                species.lower() in (i.synopsis or '').lower()
                or question.lower() in (i.action or '').lower()
            )
        ]


def handle_query(question: str,
                 species:  str = "",
                 location: str = "",
                 user_id:  str = None) -> EvidenceSynthesis:

    start = time.time()
    qtype = classify_query(question)
    chunks = []

    try:
        if qtype == QueryType.SYNTHESIS:
            from src.intelligence.retriever import vector_retriever
            chunks  = vector_retriever.get_relevant_documents(question)
            ce_rows = get_ce_for_context(species, question)
            result  = synthesise(question, species, location, chunks, ce_rows)
        else:
            result = safe_fallback(question, [])
    except Exception as e:
        logger.error(f"Query handler error: {e}")
        result = safe_fallback(question, chunks)

    validation = validate_synthesis(result, chunks)
    latency_ms = int((time.time() - start) * 1000)

    with get_session() as session:
        session.add(QueryLog(
            question          = question,
            query_type        = qtype.value,
            n_chunks          = len(chunks),
            confidence        = result.confidence,
            validation_passed = validation['valid'],
            orphan_cites      = len(validation['orphan_cites']),
            latency_ms        = latency_ms,
            model             = "gemma4:e4b",
            timestamp         = datetime.utcnow().isoformat()
        ))

    return result
```

---

### Step 4.6 — Run the full evaluation

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/tests/t4_eval.py`.
> Reads gold_dataset.json from eval/ folder.
> Run this after every model, prompt, or retrieval change.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/tests/t4_eval.py

from dotenv import load_dotenv
load_dotenv()

import json
from src.intelligence.query_handler import handle_query
from loguru import logger

EVAL_PATH = "eval/gold_dataset.json"


def run_eval():
    gold   = json.load(open(EVAL_PATH))
    scores = {
        "ce_present":        0,
        "direction_correct": 0,
        "has_citations":     0,
        "confidence_nonzero": 0
    }

    for item in gold:
        result   = handle_query(
            item['question'],
            species  = item.get('species_group', ''),
            location = item.get('geography', '')
        )
        all_text = str([i.name for i in result.interventions]).lower()

        scores["ce_present"]        += (
            item['expected_intervention'].lower() in all_text
        )
        scores["has_citations"]     += len(result.citations) > 0
        scores["confidence_nonzero"] += result.confidence != "none"

        if result.interventions:
            scores["direction_correct"] += (
                result.interventions[0].outcome_direction
                == item['expected_direction']
            )

    print("\n=== EVAL RESULTS ===")
    for k, v in scores.items():
        pct = v * 100 // len(gold)
        status = "✅" if pct >= 70 else "⚠️"
        print(f"{status} {k}: {v}/{len(gold)} ({pct}%)")

    print("\nSave results in CLAUDE.md.")
    print("CE accuracy must beat Phase 1 SQL baseline.")


if __name__ == "__main__":
    run_eval()
```

---

### Phase 4 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T4.1 CE accuracy on eval set | > 70%, beats SQL baseline | Fix retrieval or prompt |
| T4.1 Outcome direction correct | > 75% | Adjust synthesis prompt |
| T4.1 Every answer has citation | 20/20 | Force citation in prompt |
| T4.2 Unsupported factual claims | < 10% on 30 manual checks | Add "ONLY use provided evidence" |
| T4.2 Fabricated citations | 0 — zero tolerated | Lower temperature to 0.01 |
| T4.3 Obscure taxa gap acknowledgement | 5/5 return confidence=none | Uncertainty language in prompt |
| T4.4 Citation validator pass rate | > 95% on 50 responses | Fix orphan citation logic |
| T4.5 Practitioner blind review | > 3.5/5 accuracy, > 50% would act | Most important test |

---

## PHASE 5 — Application Backend
**Weeks 12–15 | 5 steps | 4 tests**

**Objective:** User accounts, project registry, alert pipeline,
TNFD report module, and the FastAPI backend the UI calls.

---

### Step 5.1 — FastAPI backend

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/api/main.py`.
> All endpoints return Pydantic schemas from contracts/evidence.py.
> Run with: uvicorn src.api.main:app --reload --port 8000

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/api/main.py

from dotenv import load_dotenv
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
```

---

### Step 5.2 — Project registry and alert tables

> Claude Code: add these tables to `/Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/db.py`.

```python
# Add to db.py after existing table definitions

class ConservationProject(Base):
    __tablename__      = "conservation_projects"
    id                 = Column(Integer, primary_key=True)
    user_id            = Column(String)
    name               = Column(String)
    description        = Column(Text)
    species_groups     = Column(String)      # comma-separated
    intervention_types = Column(String)      # comma-separated
    geography          = Column(String)
    alert_frequency    = Column(String, default="weekly")
    is_active          = Column(Integer, default=1)


class AlertQueue(Base):
    __tablename__  = "alert_queue"
    id             = Column(Integer, primary_key=True)
    user_id        = Column(String)
    paper_id       = Column(String)
    project_id     = Column(Integer)
    score          = Column(Float)
    sent           = Column(Integer, default=0)
    created_at     = Column(String)


class QueryCache(Base):
    __tablename__ = "query_cache"
    cache_key     = Column(String, primary_key=True)
    result_json   = Column(Text)
    created_at    = Column(String)
```

---

### Step 5.3 — Notification sender

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/src/application/notifier.py`.
> Uses Python stdlib smtplib — no extra library needed.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/src/application/notifier.py

from dotenv import load_dotenv
import os, smtplib
load_dotenv()

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.intelligence.db import AlertQueue, get_session
from loguru import logger

# SMTP config from .env
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")  # Use App Password for Gmail


def send_alert(user_email: str, paper_title: str,
               paper_id: str, project_name: str):
    if not SMTP_USER:
        logger.warning("SMTP not configured — alert not sent")
        return

    body = (
        f"New evidence relevant to your project: {project_name}\n\n"
        f"Title: {paper_title}\n"
        f"View synthesis: https://ceip.io/evidence/{paper_id}\n"
    )
    msg            = MIMEMultipart()
    msg['From']    = SMTP_USER
    msg['To']      = user_email
    msg['Subject'] = f"New conservation evidence: {project_name}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        logger.info(f"Alert sent to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send alert: {e}")


def process_alert_queue():
    with get_session() as session:
        pending = session.query(AlertQueue).filter_by(sent=0).all()
        for alert in pending:
            send_alert(
                user_email   = alert.user_id,
                paper_title  = alert.paper_id,
                paper_id     = alert.paper_id,
                project_name = str(alert.project_id)
            )
            session.query(AlertQueue).filter_by(
                id=alert.id
            ).update({"sent": 1})
        logger.info(f"Processed {len(pending)} alerts")
```

Add to `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

---

### Phase 5 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T5.1 All endpoints return correct schema | 100% | Fix Pydantic response_model |
| T5.1 Invalid input returns 422 not 500 | Confirmed | Add input validation |
| T5.2 Alert queued after new paper | Within 24h | Fix change_detector.py |
| T5.3 Groq backend swap eval score | Within 10% of Ollama | Check llm_config.py |

---

## PHASE 6 — User Interface and Beta
**Weeks 15–18 | 4 steps | 4 tests**

**Objective:** Build the Streamlit interface. Deploy publicly.
Get first 10 real users giving feedback.

---

### Step 6.1 — Streamlit interface

> Claude Code: create `/Users/zakherfrogman/Documents/Conservation evidence/app/main.py`.
> Calls FastAPI backend at http://localhost:8000.
> Uses streamlit library from RESOURCES.md Python Libraries.

```python
# /Users/zakherfrogman/Documents/Conservation evidence/app/main.py

from dotenv import load_dotenv
import os
load_dotenv()

import streamlit as st
import requests

# FastAPI backend URL — from .env for flexibility
API_BASE = os.getenv("API_BASE", "http://localhost:8000")

CONFIDENCE_ICONS = {
    "strong":   "🟢 Strong evidence",
    "moderate": "🟡 Moderate evidence",
    "weak":     "🟠 Weak evidence",
    "none":     "🔴 No evidence found"
}

st.set_page_config(
    page_title = "CEIP — Conservation Evidence",
    page_icon  = "🌿",
    layout     = "wide"
)

page = st.sidebar.radio(
    "Navigate",
    ["🔍 Evidence Search", "📋 My Projects", "📊 Species Explorer"]
)

if page == "🔍 Evidence Search":
    st.title("🌿 Conservation Evidence Intelligence")
    st.caption(
        "Ask what conservation interventions work. "
        "Get cited, evidence-based answers updated weekly."
    )

    question = st.text_area(
        "Your conservation question",
        placeholder=(
            "e.g. What works for reducing human-elephant conflict "
            "in East Africa?"
        ),
        height=80
    )
    col1, col2 = st.columns(2)
    species  = col1.text_input("Species or taxon group (optional)")
    location = col2.text_input("Location (optional)")

    if st.button("Search Evidence", type="primary") and question:
        with st.spinner("Synthesising evidence from the literature..."):
            try:
                r = requests.post(
                    f"{API_BASE}/api/v1/evidence",
                    json={"question": question,
                          "species":  species,
                          "location": location},
                    timeout=90
                )
                result = r.json()
            except Exception as e:
                st.error(f"Could not reach the evidence engine: {e}")
                st.stop()

        # Evidence strength
        conf = result.get('confidence', 'none')
        st.info(CONFIDENCE_ICONS.get(conf, conf))

        # Answer
        st.markdown("### Evidence Summary")
        st.write(result.get('answer', ''))

        # CE intervention ratings
        interventions = result.get('interventions', [])
        if interventions:
            st.markdown("### Conservation Evidence Ratings")
            for iv in interventions:
                c1, c2, c3 = st.columns([3, 1, 1])
                c1.write(iv.get('name', ''))
                score = iv.get('effectiveness_pct')
                c2.metric("CE Score", f"{score:.0f}%" if score else "N/A")
                c3.write(iv.get('ce_category') or "—")

        # Evidence gaps
        gaps = result.get('evidence_gaps', [])
        if gaps:
            with st.expander("Evidence Gaps"):
                for gap in gaps:
                    st.write(f"• {gap}")

        # Citations
        citations = result.get('citations', [])
        if citations:
            st.markdown("### Sources")
            for c in citations:
                st.caption(
                    f"[{c['index']}] {c['title']} "
                    f"({c.get('year', '?')})"
                )

        # Feedback
        st.divider()
        f1, f2 = st.columns(2)
        if f1.button("👍 Helpful"):
            requests.post(f"{API_BASE}/api/v1/feedback",
                json={"question": question, "rating": "positive"})
        if f2.button("👎 Not helpful"):
            requests.post(f"{API_BASE}/api/v1/feedback",
                json={"question": question, "rating": "negative"})
```

Run: `streamlit run app/main.py`

---

### Step 6.2 — Deploy to Streamlit Community Cloud

1. Push to GitHub: `git push origin main`
   (`.env`, `data/`, `embeddings/` are excluded by `.gitignore`)
2. Go to share.streamlit.io → New app → connect ceip repo
3. Set main file: `app/main.py`
4. Add Secrets (same as `.env` but in the Streamlit dashboard):
   - `LLM_BACKEND = groq`
   - `GROQ_API_KEY = your_key`
   - `API_BASE = your_fastapi_url`
5. Deploy → public URL

---

### Phase 6 Tests

| Test | Threshold | Fail Action |
|------|-----------|-------------|
| T6.1 Task completion without help | > 4/5 users | Improve UI labels |
| T6.1 Time to first result | < 45 seconds | Check Groq latency |
| T6.2 Positive feedback rate | > 60% | Review low-scoring queries |
| T6.3 Error/crash rate | < 2% | Check API error handling |
| T6.4 New papers queryable | < 24h after ingestion | Fix agent→embedder pipeline |

---

## PHASE 7 — Scale, Partnerships and Revenue
**Weeks 18–22+**

---

### Step 7.1 — Grant applications

Submit now — you have a live platform and user feedback scores as evidence.

| Funder | URL | Deadline | Amount |
|--------|-----|----------|--------|
| Bezos Earth Fund AI Grand Challenge | bezosearthfund.org | Rolling | Up to $2M |
| Google.org Impact Challenge | google.org/climate | Rolling | $1M+ |
| Moore Foundation Conservation Science | moore.org | Year-round | Variable |
| UKRI NERC Knowledge Exchange | ukri.org/nerc | Quarterly | £50K–250K |

Evidence to include: eval scores, practitioner blind review ratings,
beta user count, positive feedback rate, live demo link.

---

### Step 7.2 — Cambridge Conservation Evidence partnership

Contact Professor Bill Sutherland's group via conservationevidence.com.

Offer: commercial product execution + AI engineering.
They provide: scientific credibility, full database access,
600+ Evidence Champions as distribution channel.

---

### Step 7.3 — Monthly eval — permanent fixture

```bash
# Add to crontab — runs first Monday of every month
0 7 1-7 * 1 cd "/Users/zakherfrogman/Documents/Conservation evidence" && source venv/bin/activate && python tests/t4_eval.py >> logs/eval.log 2>&1
```

Score must not regress more than 5% from Phase 4 baseline.

---

## EVAL DATASET — 20 Standard Retrieval Queries

Use these in `tests/t3_retrieval.py` to test ChromaDB search quality.

```python
RETRIEVAL_TEST_QUERIES = [
    "lion conservation Kenya community",
    "coral reef restoration fish biomass outcomes",
    "invasive rats island removal nesting seabirds",
    "wolf reintroduction trophic cascade recovery",
    "mangrove restoration coastal fish nursery",
    "elephant human conflict mitigation East Africa",
    "predator control New Zealand bird breeding",
    "sea turtle nesting beach protection outcomes",
    "freshwater fish dam removal migration",
    "pollinators agricultural landscape management",
    "payment ecosystem services forest conservation",
    "fire management savanna biodiversity",
    "captive breeding reintroduction success",
    "marine protected area no-take zone biomass",
    "community-based rhino conservation outcomes",
    "habitat corridor jaguar connectivity",
    "wetland restoration waterfowl breeding",
    "goat eradication island species recovery",
    "snow leopard herder coexistence programme",
    "whale shark ecotourism conservation impact",
]
```

---

## CORE PRINCIPLES — READ BEFORE EVERY SESSION

### Credential rules
- All API keys come from `os.getenv("KEY_NAME")` — see `.env`
- All base URLs come from `RESOURCES.md` APIs section
- All model names come from `RESOURCES.md` AI Models section
- All file paths come from `RESOURCES.md` Folder Structure section
- Never hardcode any of these as string literals in code

### Harness rules
- All AI outputs validated by Pydantic contracts in `contracts/evidence.py`
- Always use `"format": "json"` with Gemma 4 for structured outputs
- Temperature = 0.05 for synthesis, 0.0 for classification
- Every AI call has retry logic (max 3) + safe_fallback that never crashes
- Run `tests/t4_eval.py` after every model, prompt, or retrieval change

### Living data rules
- Ingestion agent runs every Monday via cron from Phase 2 onward
- New papers must be queryable within 24 hours of ingestion
- Never allow duplicate DOIs — Paper.id is the unique key
- Log every run to `ingestion_runs` table

### Platform rules
- Users never interact with the pipeline — only with Streamlit / FastAPI
- `LLM_BACKEND=ollama` for local dev, `LLM_BACKEND=groq` for cloud
- Monthly eval re-run is permanent — never skip after Phase 4
- SQL baseline from Phase 1 must be beaten by Phase 4 RAG system
