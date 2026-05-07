# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/retriever.py

from dotenv import load_dotenv
import os
load_dotenv()

from langchain_chroma import Chroma
from langchain_core.documents import Document
from src.intelligence.vector_store import client
from loguru import logger

# From RESOURCES.md AI Models and APIs sections
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "ollama")
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_EMBED = "nomic-embed-text"  # from RESOURCES.md

if EMBEDDING_BACKEND == "huggingface":
    from langchain_huggingface import HuggingFaceEndpointEmbeddings
    embedding_fn = HuggingFaceEndpointEmbeddings(
        model="nomic-ai/nomic-embed-text-v1.5",
        huggingfacehub_api_token=os.getenv("HF_TOKEN", ""),
    )
    logger.info("Using HuggingFace Inference API for embeddings")
else:
    from langchain_ollama import OllamaEmbeddings
    embedding_fn = OllamaEmbeddings(
        model    = MODEL_EMBED,
        base_url = OLLAMA_BASE
    )
    logger.info("Using Ollama for embeddings")

# Lazy-init stores so no work happens at import time
_papers_store = None
_ce_store = None


def _get_papers_store() -> Chroma:
    global _papers_store
    if _papers_store is None:
        _papers_store = Chroma(
            client             = client,
            collection_name    = "papers",
            embedding_function = embedding_fn
        )
        logger.info("Papers vector store connected")
    return _papers_store


def _get_ce_store() -> Chroma:
    global _ce_store
    if _ce_store is None:
        _ce_store = Chroma(
            client             = client,
            collection_name    = "ce_interventions",
            embedding_function = embedding_fn
        )
        logger.info("CE interventions vector store connected")
    return _ce_store


def retrieve_papers(query: str, k: int = 8) -> list[Document]:
    """Retrieve relevant paper chunks using ChromaDB vector similarity search.

    BM25 hybrid layer removed — nomic-embed-text 768-dim vectors provide
    sufficient retrieval quality without the 2-4 GB RAM cost of an in-memory
    sparse index.
    """
    store = _get_papers_store()
    return store.similarity_search(query, k=k)


def retrieve_ce(query: str, k: int = 8) -> list[Document]:
    """Retrieve relevant CE interventions using ChromaDB vector similarity search."""
    store = _get_ce_store()
    return store.similarity_search(query, k=k)
