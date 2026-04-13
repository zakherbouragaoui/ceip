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
    tests = [
        ("CORE API",        test_core),
        ("IUCN Red List",   test_iucn),
        ("OpenAlex",        test_openalex),
        ("Gemma 4 E4B",     test_gemma4),
        ("nomic-embed-text", test_nomic),
        ("Groq Cloud LLM",  test_groq),
    ]
    passed, failed = 0, 0
    for name, fn in tests:
        try:
            fn()
            passed += 1
        except Exception as e:
            print(f"✗ {name}: {e}")
            failed += 1

    print(f"\n{'✅' if failed == 0 else '⚠️ '} {passed} passed, {failed} failed")
    if failed == 0:
        print("Ready for Phase 1")
    else:
        print("Fix failures above before proceeding")
