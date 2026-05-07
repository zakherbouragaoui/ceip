# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/synthesiser.py

from dotenv import load_dotenv
import os, requests, json
load_dotenv()

from contracts.evidence import (EvidenceSynthesis, Citation,
                                 Intervention, EvidenceStrength)
from loguru import logger

# From RESOURCES.md AI Models section
LLM_BACKEND      = os.getenv("LLM_BACKEND", "ollama")
OLLAMA_BASE      = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_GENERATION = "gemma4:e4b"   # generation model from RESOURCES.md
GROQ_API_KEY     = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL       = "gemma2-9b-it"  # Groq cloud model

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
  "answer": "2-4 sentences directly answering the question, citing evidence by [N]. Must be at least 20 words.",
  "confidence": "strong|moderate|weak|none",
  "interventions": [
    {{
      "name": "intervention name",
      "ce_category": "Beneficial|Trade-off|Unknown Effectiveness|Unlikely to be beneficial|Likely to be beneficial|No evidence found|Harmful|null",
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
- Acknowledge uncertainty explicitly
- The answer MUST be at least 20 words long
- Include at least one citation [N] in the answer
- Each citation index must match a provided evidence chunk"""


def safe_fallback(question: str, chunks: list) -> EvidenceSynthesis:
    """Return a valid EvidenceSynthesis when generation fails."""
    return EvidenceSynthesis(
        answer        = ("Evidence synthesis temporarily unavailable for this query. "
                         "The source documents listed in citations below were retrieved "
                         "and may contain relevant information for your question about "
                         "conservation interventions and their effectiveness."),
        confidence    = EvidenceStrength.NONE,
        interventions = [],
        evidence_gaps = ["Generation failed — please retry"],
        citations     = [
            Citation(
                index    = i + 1,
                paper_id = c.metadata.get("paper_id", ""),
                title    = c.metadata.get("title", "Unknown"),
                year     = c.metadata.get("year") or None,
                source   = "OpenAlex"
            )
            for i, c in enumerate(chunks[:5])
        ],
        geo_limits  = None,
        taxa_limits = None
    )


def format_ce_rows(ce_rows: list) -> str:
    """Format CE database rows for the prompt."""
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
    """Generate an evidence synthesis using Gemma 4 E4B.

    Args:
        question: The user's conservation question
        context: Species or habitat context
        location: Geographic location
        chunks: Retrieved langchain Document objects
        ce_rows: CE database rows (dicts with action, ce_category, etc.)
        max_retries: Number of generation attempts
    """
    used_chunks = chunks[:8]
    evidence_text = "\n\n".join(
        f"[{i+1}] {c.page_content} "
        f"(paper_id: {c.metadata.get('paper_id', 'unknown')}, "
        f"title: {c.metadata.get('title', 'Unknown')}, "
        f"year: {c.metadata.get('year', '?')})"
        for i, c in enumerate(used_chunks)
    )
    prompt = SYNTHESIS_PROMPT.format(
        question        = question,
        context         = context or "Not specified",
        location        = location or "Not specified",
        evidence_chunks = evidence_text or "No evidence retrieved.",
        ce_ratings      = format_ce_rows(ce_rows)
    )

    # Pre-build citation objects from retrieved chunks
    # (don't rely on LLM to populate these correctly)
    prebuilt_citations = [
        Citation(
            index    = i + 1,
            paper_id = c.metadata.get("paper_id", ""),
            title    = c.metadata.get("title", "Unknown"),
            year     = int(c.metadata["year"]) if c.metadata.get("year") else None,
            source   = "OpenAlex"
        )
        for i, c in enumerate(used_chunks)
    ]

    for attempt in range(max_retries):
        try:
            raw = _call_llm(prompt)

            # Normalize confidence field to match EvidenceStrength enum
            conf = raw.get("confidence", "none").lower()
            if conf not in ("strong", "moderate", "weak", "none"):
                raw["confidence"] = "none"

            # Override citations with prebuilt ones from actual metadata
            raw["citations"] = [c.model_dump() for c in prebuilt_citations]

            return EvidenceSynthesis(**raw)
        except Exception as e:
            logger.warning(f"Synthesis attempt {attempt + 1} failed: {e}")

    logger.error("All synthesis attempts failed — returning fallback")
    return safe_fallback(question, chunks)


def _call_llm(prompt: str) -> dict:
    """Call the configured LLM backend and return parsed JSON dict."""
    if LLM_BACKEND == "groq":
        return _call_groq(prompt)
    return _call_ollama(prompt)


def _call_ollama(prompt: str) -> dict:
    """Call local Ollama for generation."""
    r = requests.post(
        f"{OLLAMA_BASE}/api/generate",
        json={
            "model":   MODEL_GENERATION,
            "prompt":  prompt,
            "stream":  False,
            "format":  "json",
            "options": {"temperature": 0.05}
        },
        timeout=180
    )
    return json.loads(r.json()["response"])


def _call_groq(prompt: str) -> dict:
    """Call Groq cloud API for generation."""
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.05,
            "response_format": {"type": "json_object"},
        },
        timeout=60,
    )
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    return json.loads(content)
