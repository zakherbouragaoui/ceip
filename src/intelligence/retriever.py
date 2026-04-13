# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/retriever.py

from dotenv import load_dotenv
import os
load_dotenv()

from langchain_chroma import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers import EnsembleRetriever
from langchain_ollama import OllamaEmbeddings
from langchain_core.documents import Document
from src.intelligence.vector_store import client, papers_col, ce_col
from loguru import logger

# From RESOURCES.md AI Models and APIs sections
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_EMBED = "nomic-embed-text"  # from RESOURCES.md

embedding_fn = OllamaEmbeddings(
    model    = MODEL_EMBED,
    base_url = OLLAMA_BASE
)

# Vector retrievers (connect to existing ChromaDB collections)
papers_store = Chroma(
    client             = client,
    collection_name    = "papers",
    embedding_function = embedding_fn
)

ce_store = Chroma(
    client             = client,
    collection_name    = "ce_interventions",
    embedding_function = embedding_fn
)

papers_vector_retriever = papers_store.as_retriever(search_kwargs={"k": 8})
ce_vector_retriever     = ce_store.as_retriever(search_kwargs={"k": 8})

# BM25 and hybrid retrievers are lazily initialized (loading 93K docs takes ~6s)
_hybrid_retriever = None
_ce_hybrid_retriever = None


def _load_docs_from_collection(collection, batch_size: int = 5000):
    """Load all documents from a ChromaDB collection in batches."""
    all_docs, all_metas = [], []
    total = collection.count()
    offset = 0
    while offset < total:
        result = collection.get(
            include=["documents", "metadatas"],
            limit=batch_size, offset=offset
        )
        all_docs.extend(result["documents"])
        all_metas.extend(result["metadatas"])
        offset += batch_size
    return [Document(page_content=d, metadata=m)
            for d, m in zip(all_docs, all_metas)]


def get_hybrid_retriever() -> EnsembleRetriever:
    """Get or build the hybrid (vector + BM25) retriever for papers."""
    global _hybrid_retriever
    if _hybrid_retriever is None:
        logger.info("Building BM25 index for papers (one-time)...")
        lc_docs = _load_docs_from_collection(papers_col)
        bm25 = BM25Retriever.from_documents(lc_docs, k=8)
        _hybrid_retriever = EnsembleRetriever(
            retrievers=[papers_vector_retriever, bm25],
            weights=[0.6, 0.4]
        )
        logger.info(f"Hybrid retriever ready ({len(lc_docs):,} docs)")
    return _hybrid_retriever


def get_ce_hybrid_retriever() -> EnsembleRetriever:
    """Get or build the hybrid retriever for CE interventions."""
    global _ce_hybrid_retriever
    if _ce_hybrid_retriever is None:
        logger.info("Building BM25 index for CE interventions...")
        lc_docs = _load_docs_from_collection(ce_col)
        bm25 = BM25Retriever.from_documents(lc_docs, k=8)
        _ce_hybrid_retriever = EnsembleRetriever(
            retrievers=[ce_vector_retriever, bm25],
            weights=[0.6, 0.4]
        )
        logger.info(f"CE hybrid retriever ready ({len(lc_docs):,} docs)")
    return _ce_hybrid_retriever


def retrieve_papers(query: str, k: int = 8) -> list[Document]:
    """Retrieve relevant paper chunks using hybrid search."""
    retriever = get_hybrid_retriever()
    return retriever.invoke(query)[:k]


def retrieve_ce(query: str, k: int = 8) -> list[Document]:
    """Retrieve relevant CE interventions using hybrid search."""
    retriever = get_ce_hybrid_retriever()
    return retriever.invoke(query)[:k]
