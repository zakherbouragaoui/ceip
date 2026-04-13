# CEIP — Resources & Configuration Reference
# File: /Users/zakherfrogman/Documents/Conservation evidence/RESOURCES.md
#
# PURPOSE FOR CLAUDE CODE:
# This file is the single source of truth for every external service,
# library, model, path, and environment variable in the project.
# Before writing any code that references a URL, model name, library,
# or file path — read this file first.
# Never guess. Never hardcode. Always read from here or from .env.

---

## PROJECT ROOT

```
/Users/zakherfrogman/Documents/Conservation evidence/
```

All relative paths in this project are relative to `/Users/zakherfrogman/Documents/Conservation evidence/`.

---

## ENVIRONMENT VARIABLES

All secrets and configurable values live in `/Users/zakherfrogman/Documents/Conservation evidence/.env`.
Load in every Python file with:

```python
from dotenv import load_dotenv
import os
load_dotenv()
```

Then access with: `os.getenv("VARIABLE_NAME")`

### Complete .env variable list

| Variable | Used For | Example Value |
|----------|----------|---------------|
| CORE_API_KEY | CORE literature API authentication | Bearer token from core.ac.uk |
| OPENALEX_EMAIL | OpenAlex polite pool (no key needed) | your@email.com |
| S2_API_KEY | Semantic Scholar higher rate limits | key from semanticscholar.org |
| CROSSREF_EMAIL | CrossRef polite pool | your@email.com |
| IUCN_API_KEY | IUCN Red List API token | token from iucnredlist.org |
| GBIF_USER | GBIF username for bulk downloads | your_username |
| GBIF_PASSWORD | GBIF password for bulk downloads | your_password |
| PP_API_KEY | Protected Planet API token | key from protectedplanet.net |
| OLLAMA_BASE | Local Ollama server URL | http://localhost:11434 |
| GROQ_API_KEY | Groq cloud LLM (free tier) | key from console.groq.com |
| HF_TOKEN | Hugging Face access token | token from huggingface.co |
| LLM_BACKEND | Switch local vs cloud LLM | ollama (dev) or groq (deploy) |
| DB_PATH | SQLite database file path | data/ceip.db |
| CHROMA_PATH | ChromaDB persistent storage path | data/embeddings/ |
| CE_CSV_PATH | Conservation Evidence CSV path | data/raw/conservation_evidence.csv |
| API_BASE | FastAPI backend URL for Streamlit | http://localhost:8000 |
| SMTP_HOST | Email alert SMTP server | smtp.gmail.com |
| SMTP_PORT | Email alert SMTP port | 587 |
| SMTP_USER | Email alert sender address | your@gmail.com |
| SMTP_PASS | Email alert app password | gmail_app_password |

---

## APIs

### CORE API
- Base URL: `https://api.core.ac.uk/v3`
- Auth: Bearer token in Authorization header
- Key variable: `os.getenv("CORE_API_KEY")`
- Rate limit: 10,000 requests/day (free tier)
- Registration: core.ac.uk/services/api
- Key endpoints:
  - `GET /search/works` — search papers by query
  - `GET /works/{id}` — get single paper by ID
  - `GET /works/{id}/fulltext` — get full text if available
- Used in: `src/intelligence/fetch_papers.py`

### OpenAlex API
- Base URL: `https://api.openalex.org`
- Auth: No key needed. Add `?mailto=os.getenv("OPENALEX_EMAIL")` for polite pool
- Rate limit: 100K/day polite pool, 10 req/sec
- Registration: None required
- Key endpoints:
  - `GET /works` — search and filter works
  - `GET /works/{id}` — single work
  - `GET /concepts` — browse concept taxonomy
- Used in: `src/intelligence/fetch_papers.py`, `src/living/ingestion_agent.py`
- Conservation concept IDs to use:
  - `C149923435` — Conservation biology
  - `C2780878898` — Biodiversity
  - `C2993671` — Wildlife conservation
  - `C100360200` — Habitat conservation

### IUCN Red List API
- Base URL: `https://apiv3.iucnredlist.org/api/v3`
- Auth: `?token=os.getenv("IUCN_API_KEY")` as URL parameter
- Rate limit: Generous, reasonable use
- Registration: iucnredlist.org → Login → Generate Token (1–5 day approval)
- Key endpoints:
  - `GET /species/page/{page}` — paginated list of all species
  - `GET /species/id/{taxon_id}` — single species by ID
  - `GET /species/id/{taxon_id}/threats` — threats for a species
  - `GET /species/id/{taxon_id}/actions` — conservation actions for a species
  - `GET /species/id/{taxon_id}/habitats` — habitats for a species
- Used in: `src/intelligence/fetch_iucn.py`, `src/application/tnfd_report.py`

### GBIF API
- Base URL: `https://api.gbif.org/v1`
- Auth: No auth for reads. Username/password for downloads.
- Key variables: `os.getenv("GBIF_USER")`, `os.getenv("GBIF_PASSWORD")`
- Rate limit: Liberal
- Registration: gbif.org → Create account (free)
- Key endpoints:
  - `GET /species/search` — search species names
  - `GET /occurrence/search` — search occurrence records
  - `POST /occurrence/download/request` — request bulk download
- Used in: species location context, Phase 3+

### Semantic Scholar API
- Base URL: `https://api.semanticscholar.org/graph/v1`
- Auth: Optional. `x-api-key: os.getenv("S2_API_KEY")` header for higher limits
- Rate limit: 100 req/5min (no key), 1 req/sec (with key)
- Registration: api.semanticscholar.org/product/api
- Key endpoints:
  - `GET /paper/search` — search papers
  - `GET /paper/{paper_id}` — single paper with citations
- Used in: supplementary literature search

### Protected Planet API
- Base URL: `https://api.protectedplanet.net/v3`
- Auth: Bearer token header
- Key variable: `os.getenv("PP_API_KEY")`
- Registration: protectedplanet.net/api (1–3 day approval)
- Key endpoints:
  - `GET /protected_areas` — list protected areas
  - `GET /protected_areas/{id}` — single PA details
- Used in: `src/application/tnfd_report.py`

### CrossRef API
- Base URL: `https://api.crossref.org`
- Auth: No key needed. Add `?mailto=os.getenv("CROSSREF_EMAIL")`
- Rate limit: 50 req/sec polite pool
- Key endpoints:
  - `GET /works/{doi}` — resolve DOI to full metadata
- Used in: DOI resolution and citation metadata

### Ollama (local)
- Base URL: `os.getenv("OLLAMA_BASE")` — default `http://localhost:11434`
- Auth: None (localhost only)
- Key endpoints:
  - `POST /api/generate` — text generation
  - `POST /api/embeddings` — generate embeddings
  - `GET /api/tags` — list installed models
- Used in: all AI calls during local development

### Groq API (cloud — for deployment)
- Base URL: `https://api.groq.com/openai/v1`
- Auth: `Authorization: Bearer os.getenv("GROQ_API_KEY")`
- Key variable: `os.getenv("GROQ_API_KEY")`
- Used when: `os.getenv("LLM_BACKEND") == "groq"`
- Used in: `src/intelligence/llm_config.py`

---

## AI MODELS

### nomic-embed-text (embeddings)
- Ollama pull command: `ollama pull nomic-embed-text`
- Disk size: ~500 MB
- RAM usage: ~500 MB
- Output dimensions: 768
- Context window: 8,192 tokens
- Purpose: EMBEDDINGS ONLY — converts all text to vectors for ChromaDB
- Does NOT generate text
- Used in: `src/intelligence/embedder.py`, `src/intelligence/retriever.py`
- Reference in code: `model = "nomic-embed-text"`

### gemma4:e4b (generation)
- Ollama pull command: `ollama pull gemma4:e4b`
- Check exact tag at: ollama.com/library/gemma4
- Disk size: ~5–6 GB
- RAM usage: ~6–8 GB (fits M1 Pro 16GB — leaves ~8GB free)
- Context window: 128,000 tokens
- Temperature for synthesis: 0.05
- Temperature for classification: 0.0
- Native JSON mode: use `"format": "json"` in API call
- Multimodal: yes (text + image + audio)
- License: Apache 2.0
- Released: April 2026 (Google DeepMind)
- Purpose: PRIMARY generation — evidence synthesis, paper classification,
  TNFD reports, structured data extraction
- Replaces: llama3.2 + phi3:medium + llava
- Used in: `src/intelligence/synthesiser.py`, `src/intelligence/classify.py`
- Reference in code: `model = "gemma4:e4b"`

### gemma4:e2b (fallback — optional)
- Ollama pull command: `ollama pull gemma4:e2b`
- RAM usage: ~3–4 GB
- Purpose: Faster fallback for high-volume classification tasks
- Reference in code: `model = "gemma4:e2b"`

### Cloud models (for deployment only)
- Groq: `model = "gemma2-9b-it"` — fast, free tier
- Hugging Face: `repo_id = "google/gemma-3-4b-it"`
- Used when: `os.getenv("LLM_BACKEND") != "ollama"`

---

## PYTHON LIBRARIES

Install all with:

```bash
pip install pydantic requests httpx python-dotenv sqlalchemy pandas \
  tqdm loguru beautifulsoup4 lxml openpyxl jupyter rapidfuzz chromadb \
  langchain langchain-community langchain-ollama langchain-groq \
  streamlit fastapi uvicorn sentence-transformers pymupdf geopandas
```

### Phase 0 — Foundation
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| pydantic | pydantic | Output contracts — EvidenceSynthesis, PaperClassification schemas |
| python-dotenv | python-dotenv | Load .env into os.getenv() |
| sqlalchemy | sqlalchemy | ORM for SQLite — all structured data |
| requests | requests | Sync HTTP calls to all APIs and Ollama |
| loguru | loguru | Structured logging across all pipeline steps |

### Phase 1 — Data
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| pandas | pandas | Load and clean CSV datasets (CE, IUCN, WDPA) |
| tqdm | tqdm | Progress bars for long ingestion and embedding jobs |
| rapidfuzz | rapidfuzz | Fuzzy string matching for species–intervention linking |
| beautifulsoup4 | beautifulsoup4 | HTML parsing for web data when needed |

### Phase 2 — Living Agent
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| httpx | httpx | Async HTTP for parallel paper fetching in ingestion agent |

### Phase 3 — Embeddings
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| chromadb | chromadb | Vector database — stores 40,000+ embedded document chunks |
| langchain | langchain | RAG framework — chunking, retrieval chains, ensemble retriever |
| langchain-community | langchain-community | BM25Retriever, Chroma vectorstore integration |
| langchain-ollama | langchain-ollama | OllamaLLM and OllamaEmbeddings classes |
| sentence-transformers | sentence-transformers | SPECTER2 scientific embeddings (alternative to nomic) |

### Phase 4 — RAG Engine
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| langchain-groq | langchain-groq | ChatGroq — cloud LLM backend for deployment |

### Phase 5–6 — Application & UI
| Library | pip name | Purpose in CEIP |
|---------|----------|-----------------|
| fastapi | fastapi | REST API backend — all platform endpoints |
| uvicorn | uvicorn | ASGI server to run FastAPI |
| streamlit | streamlit | Web interface — the entire user-facing UI |
| pymupdf | pymupdf | Extract text from conservation PDF papers |
| geopandas | geopandas | Work with WDPA shapefiles for TNFD location module |

---

## DATASETS

All datasets stored in `/Users/zakherfrogman/Documents/Conservation evidence/data/raw/`. Never commit to Git.

### Conservation Evidence Database
- File path: `data/raw/conservation_evidence.csv`
- Env variable: `os.getenv("CE_CSV_PATH", "data/raw/conservation_evidence.csv")`
- Download URL: conservationevidence.com → About → Download
- Contains: 3,891 interventions with CE effectiveness scores (0–100%)
- CE categories: Beneficial, Likely Beneficial, Trade-off,
  Unknown Effectiveness, Unlikely Beneficial, Likely Ineffective or Harmful
- Used in: `src/intelligence/load_ce.py`
- Phase needed: Phase 1

### IUCN Red List (bulk)
- File path: `data/raw/iucn/`
- Download URL: iucnredlist.org/resources/grid → request download
- Note: 1–2 day wait for download link by email
- Contains: 172,600+ species assessments, threats, conservation actions
- Used in: `src/intelligence/fetch_iucn.py`
- Phase needed: Phase 1

### WDPA Protected Areas
- File path: `data/raw/wdpa/`
- Download URL: protectedplanet.net/en/thematic-areas/wdpa → Download
- Start with CSV version (smaller than GeoPackage)
- Contains: 312,000+ protected areas globally
- Used in: `src/application/tnfd_report.py`
- Phase needed: Phase 5

### PREDICTS Database
- File path: `data/raw/predicts.csv`
- Download URL: nhm.ac.uk → Data Portal → search "PREDICTS"
- Contains: 4.3M biodiversity measurements, 35K sites, 101 countries
- Used in: biodiversity baseline calibration
- Phase needed: Phase 3

---

## FOLDER STRUCTURE (complete)

```
/Users/zakherfrogman/Documents/Conservation evidence/
├── CLAUDE.md                         ← Update every session
├── IMPLEMENTATION_PLAN.md            ← Full build instructions
├── RESOURCES.md                      ← This file
├── requirements.txt                  ← pip freeze output
├── .env                              ← All secrets (never commit)
├── .gitignore                        ← Must include .env, data/, embeddings/
│
├── contracts/
│   └── evidence.py                   ← Pydantic schemas (EvidenceSynthesis etc.)
│
├── eval/
│   └── gold_dataset.json             ← 20-question benchmark
│
├── data/
│   ├── raw/
│   │   ├── conservation_evidence.csv ← CE_CSV_PATH
│   │   ├── iucn/                     ← IUCN bulk download
│   │   ├── wdpa/                     ← Protected Planet download
│   │   └── predicts.csv              ← PREDICTS database
│   ├── processed/
│   │   └── ce_taxonomy_map.json      ← CE synopsis → taxa mapping
│   └── embeddings/                   ← CHROMA_PATH — ChromaDB storage
│
├── src/
│   ├── intelligence/
│   │   ├── db.py                     ← SQLAlchemy models + get_session()
│   │   ├── load_ce.py                ← Load CE_CSV_PATH into DB
│   │   ├── fetch_iucn.py             ← Fetch from IUCN_BASE using IUCN_KEY
│   │   ├── fetch_papers.py           ← Fetch from CORE_BASE + OA_BASE
│   │   ├── classify.py               ← gemma4:e4b via OLLAMA_BASE
│   │   ├── link_species.py           ← rapidfuzz IUCN → CE matching
│   │   ├── vector_store.py           ← ChromaDB init at CHROMA_PATH
│   │   ├── embedder.py               ← nomic-embed-text via OLLAMA_BASE
│   │   ├── retriever.py              ← Hybrid vector + BM25
│   │   ├── router.py                 ← FACTUAL / LOOKUP / SYNTHESIS
│   │   ├── synthesiser.py            ← gemma4:e4b synthesis + fallback
│   │   ├── validator.py              ← Citation integrity check
│   │   ├── query_handler.py          ← Full pipeline orchestrator
│   │   └── llm_config.py             ← LLM_BACKEND switcher
│   │
│   ├── living/
│   │   ├── ingestion_agent.py        ← Weekly OpenAlex fetch + classify
│   │   └── change_detector.py        ← Alert queue trigger
│   │
│   ├── application/
│   │   ├── notifier.py               ← SMTP alert sender
│   │   └── tnfd_report.py            ← TNFD/CSRD report generator
│   │
│   └── api/
│       ├── main.py                   ← FastAPI app (port 8000)
│       └── cache.py                  ← Query result cache
│
├── app/
│   └── main.py                       ← Streamlit UI (calls API_BASE)
│
├── tests/
│   ├── t0_connectivity.py            ← Phase 0: all APIs + models
│   ├── t1_sql_baseline.py            ← Phase 1: record SQL score
│   ├── t2_ingestion.py               ← Phase 2: agent tests
│   ├── t3_retrieval.py               ← Phase 3: ChromaDB search
│   └── t4_eval.py                    ← Phase 4: gold dataset eval
│
└── logs/
    └── ingestion.log                 ← Weekly agent output
```

---

## ACCOUNTS & PLATFORMS

| Platform | Purpose | URL |
|----------|---------|-----|
| GitHub (ceip repo) | Code versioning and Streamlit deployment | github.com |
| Streamlit Community Cloud | Free public hosting for Streamlit MVP | share.streamlit.io |
| Groq Console | Free cloud LLM API for deployment | console.groq.com |
| Hugging Face | Model weights and backup inference | huggingface.co |
| Render.com | FastAPI backend cloud hosting (free tier) | render.com |
| WILDLABS.NET | Beta user recruitment (Phase 6) | wildlabs.net |

---

## HOW CLAUDE CODE USES THIS FILE

When Claude Code needs to:

- **Call an API** → find the base URL and auth method in the APIs section.
  Use `os.getenv("KEY_VARIABLE")` for the key.

- **Use an AI model** → find the model name in the AI Models section.
  For local: use `os.getenv("OLLAMA_BASE")` as the base URL.
  For cloud: check `os.getenv("LLM_BACKEND")` and use llm_config.py.

- **Read a dataset** → find the file path in the Datasets section.
  Use `os.getenv("CE_CSV_PATH")` etc. for configurable paths.

- **Write to the database** → import `get_session` from `src/intelligence/db.py`.
  DB path comes from `os.getenv("DB_PATH")`.

- **Store or query embeddings** → import from `src/intelligence/vector_store.py`.
  ChromaDB path comes from `os.getenv("CHROMA_PATH")`.

- **Install a library** → find it in the Python Libraries section.
  Use the exact pip name shown.

- **Create a new file** → check the Folder Structure section for the correct path.
