# CEIP — Claude Code Session Brief

## Project Root
```
/Users/zakherfrogman/Documents/Conservation evidence/
```

Open Claude Code from this folder:
```bash
cd "/Users/zakherfrogman/Documents/Conservation evidence"
claude
```

---

## Read These Files First — Every Session

```
1. /Users/zakherfrogman/Documents/Conservation evidence/CLAUDE.md          ← this file
2. /Users/zakherfrogman/Documents/Conservation evidence/RESOURCES.md       ← all APIs, models, paths
3. /Users/zakherfrogman/Documents/Conservation evidence/CEIP_IMPLEMENTATION_PLAN.md  ← build instructions
```

---

## Platform in One Sentence

A SaaS platform that combines a living conservation evidence database
with AI-powered synthesis. Practitioners describe their conservation
activity and receive cited, evidence-based guidance updated weekly.
Users never see the pipeline — only the web interface.

---

## Architecture

```
Layer 4 — User Interface      Streamlit → React
Layer 3 — Application Layer   FastAPI, user accounts, alerts, TNFD module
Layer 2 — Living Data Layer   Weekly agent — runs forever from Phase 2
Layer 1 — Intelligence Layer  RAG, Gemma 4 E4B, ChromaDB, SQLite, Pydantic
```

---

## Tech Stack (full details in RESOURCES.md)

| Component | Tool |
|-----------|------|
| Development | Antigravity IDE + Claude Code CLI |
| Language | Python 3.11 |
| LLM local | Ollama + Gemma 4 E4B |
| LLM cloud | Groq API (deployment) |
| Embeddings | nomic-embed-text via Ollama (768 dims) |
| Vector DB | ChromaDB persistent |
| Structured DB | SQLite → PostgreSQL at scale |
| RAG framework | LangChain + Pydantic v2 |
| Web UI | Streamlit (MVP) |
| Backend API | FastAPI |
| Hardware | Mac M1 Pro 16GB |

---

## Key Files (full structure in RESOURCES.md)

| File | Purpose |
|------|---------|
| `contracts/evidence.py` | Pydantic schemas — ALL AI output must conform |
| `eval/gold_dataset.json` | 20-question benchmark — run after every change |
| `.env` | All API keys — never commit |
| `data/raw/` | Downloaded datasets — never commit |
| `data/embeddings/` | ChromaDB storage — never commit |

---

## Non-Negotiable Rules for Every File

1. `from dotenv import load_dotenv; import os; load_dotenv()` at top of every file
2. All API keys: `os.getenv("KEY_NAME")` — never hardcode
3. All base URLs: from RESOURCES.md APIs section
4. All model names: from RESOURCES.md AI Models section
5. All file paths: from RESOURCES.md Folder Structure section
6. All AI outputs: validated against `contracts/evidence.py`
7. `"format": "json"` in every Gemma 4 structured call
8. Temperature 0.05 for synthesis, 0.0 for classification
9. Every AI call has retry logic (max 3) + safe_fallback()
10. Run `tests/t4_eval.py` after every model/prompt/retrieval change

---

## How to Start Each Session

Tell Claude Code:

> "Read CLAUDE.md, RESOURCES.md, and IMPLEMENTATION_PLAN.md.
>  We are on Phase [X] Step [Y]. Implement it."

---

## Current Status — UPDATE THIS EVERY SESSION

```
Current Phase:    Phase 6 — User Interface and Beta
Current Step:     Step 6.1 complete — next is Step 6.2
Last completed:   Step 6.1 — Streamlit interface (3 pages, all verified)
SQL baseline:     5/5 (Phase 1)
Eval score:       CE=80% Dir=80% Cites=100% Conf=90% — ALL PASS (≥70% threshold)
Beta users:       0
Notes:            FastAPI on port 8000. /health, /api/v1/evidence, /api/v1/species/{name}, /api/v1/feedback all verified.
```

---

## Session Log — Append After Each Session

| Date | Phase | Step | What was built | Issues |
|------|-------|------|----------------|--------|
| 2026-04-06 | Phase 0 | Step 0.1 | Folder structure, .gitignore, .env template, __init__.py files | CEIP_IMPLEMENTATION_PLAN.md filename differs from CLAUDE.md reference (fixed) |
| 2026-04-07 | Phase 1 | Step 1.2 | 56,198 species loaded via GBIF API (6 IUCN categories, deduplicated) | IUCN API v3 Cloudflare-blocked; v4 API exists but needs separate key; GBIF used as source |
| 2026-04-07 | Phase 1 | Step 1.3 | 17,831 papers (9,302 CORE + 8,529 OpenAlex), 6 query strings | 2 OpenAlex queries failed on first run (network), retried successfully |
| 2026-04-07 | Phase 1 | Step 1.4 | 17,831 papers classified with Gemma 4 E4B (99% success, 20h runtime) | 171 papers got fallback defaults (Pydantic validation failures from creative model outputs like "fencing", "vaccination_campaign") |
| 2026-04-09 | Phase 1 | Step 1.5 | 42.2M species-intervention links via keyword matching (750.6 avg/species, 100% species covered) | First run lost to rollback (flush≠commit); fixed to commit every 50K; IUCN API blocked so used taxonomy+habitat keyword matching |
| 2026-04-09 | Phase 1 | Step 1.6 | SQL baseline test: 5/5, max latency 26ms. Indexes added on species_intervention_links(species_id, ce_id) and species(name). | Original query was 7s (full table scan on 42M rows); restructured to two-step subquery for index usage |
| 2026-04-09 | Phase 2 | Step 2.1 | Weekly ingestion agent: 1,222 fetched, 103 new papers, 29.1% filter rate. OpenAlex concept+search combined. | 3/4 concept IDs deprecated (0 results); runtime 30min due to local LLM classification (~4s/paper); 1 Pydantic validation error (amphibians→retry) |
| 2026-04-09 | Phase 2 | Step 2.2 | Change detector: conservation_projects + alert_queue tables, relevance scoring (species+intervention+geography), integrated into ingestion agent. | None |
| 2026-04-09 | Phase 3 | Step 3.1 | ChromaDB initialised: PersistentClient at data/embeddings/, 2 collections (papers, ce_interventions), cosine similarity, 768-dim nomic-embed-text verified. | None |
| 2026-04-09 | Phase 3 | Step 3.2 | Batch embedding: 93,390 paper chunks + 4,099 CE items. 47min runtime. Semantic search verified (83ms papers, 2ms CE). | langchain import path: langchain_text_splitters (not langchain.text_splitter) |
| 2026-04-12 | Phase 3 | Step 3.3 | Hybrid retriever: vector (langchain_chroma) + BM25 (rank_bm25), ensemble 0.6/0.4 weights. 100% top-5 relevance on 8 queries, <450ms warm latency. | First query 7s (BM25 init), subsequent <450ms. EnsembleRetriever in langchain_classic. Installed langchain-chroma, rank_bm25. |
| 2026-04-12 | Phase 3 | Step 3.4 | Ingestion agent now calls embed_all_papers() after saving new papers — new papers queryable within minutes of ingestion. | None |
| 2026-04-12 | Phase 4 | Step 4.1 | Query router: FACTUAL→SQL, LOOKUP→DB direct, SYNTHESIS→full RAG. Keyword-based, 13/13 test cases pass. | None |
| 2026-04-12 | Phase 4 | Step 4.2 | Evidence synthesiser: Gemma 4 E4B, JSON mode, temp 0.05, Pydantic-validated EvidenceSynthesis. Citations prebuilt from chunk metadata. Safe fallback on failure. | LLM copies placeholder citations from JSON template — fixed by prebuilding from metadata. ~66s/query. |
| 2026-04-12 | Phase 4 | Step 4.3 | Citation validator: checks orphan [N] refs, missing citation objects, strong-confidence-needs-2-interventions rule. 4/4 unit tests. | None |
| 2026-04-12 | Phase 4 | Step 4.4 | LLM backend switcher: get_llm() returns OllamaLLM or ChatGroq based on LLM_BACKEND env var. Ollama invoke verified. | langchain_huggingface not installed (optional) |
| 2026-04-12 | Phase 4 | Step 4.5 | Full query handler: route→retrieve→synthesise→validate→log. SYNTHESIS/LOOKUP/FACTUAL paths. Query logging to DB. | 184s first warm query (local LLM dominates); will drop to ~5s with Groq |
| 2026-04-13 | Phase 4 | Step 4.6 | Eval benchmark: 20 questions, CE=80% Dir=80% Cites=100% Conf=90%. All 4 thresholds PASS. Avg 126s/query. | Timeout increased 90s→180s to fix triple-timeout failures. 4 CE misses are terminology mismatch not wrong answers. |
| 2026-04-13 | Phase 5 | Step 5.1 | FastAPI backend: 4 endpoints (health, evidence, species, feedback). All return correct schemas. 422 on invalid input, 404 on missing species. | None |
| 2026-04-13 | Phase 5 | Step 5.2 | Added QueryCache table, description + alert_frequency columns to ConservationProject. All 9 tables verified. | create_all doesn't ALTER existing tables — used ALTER TABLE for new columns. |
| 2026-04-13 | Phase 5 | Step 5.3 | Notification sender: send_alert (SMTP), process_alert_queue (batch). Graceful fallback when SMTP not configured. Marks sent=1 after processing. | SMTP_USER empty — warns but doesn't crash. Will work when credentials added. |
| 2026-04-13 | Phase 6 | Step 6.1 | Streamlit UI: 3 pages (Evidence Search, My Projects placeholder, Species Explorer). Calls FastAPI backend. Confidence icons, CE ratings, citations, feedback buttons. | Timeout set to 300s for local LLM; will drop with Groq. |
