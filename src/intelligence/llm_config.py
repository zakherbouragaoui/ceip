# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/llm_config.py

from dotenv import load_dotenv
import os
load_dotenv()


def get_llm():
    """Get the LLM instance based on LLM_BACKEND env var.

    Set LLM_BACKEND in .env to switch between local and cloud:
      LLM_BACKEND=ollama      → local development (default)
      LLM_BACKEND=groq        → cloud deployment (Streamlit Cloud etc.)
    """
    backend = os.getenv("LLM_BACKEND", "ollama")

    if backend == "ollama":
        from langchain_ollama import OllamaLLM
        return OllamaLLM(
            model       = "gemma4:e4b",
            base_url    = os.getenv("OLLAMA_BASE", "http://localhost:11434"),
            temperature = 0.05
        )

    if backend == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model       = "gemma2-9b-it",
            api_key     = os.getenv("GROQ_API_KEY"),
            temperature = 0.05
        )

    raise ValueError(
        f"Unknown LLM_BACKEND: {backend}. "
        f"Set LLM_BACKEND=ollama or groq in .env"
    )
