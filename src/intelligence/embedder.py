# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/embedder.py

from dotenv import load_dotenv
import os, requests
load_dotenv()

from langchain_text_splitters import RecursiveCharacterTextSplitter
from tqdm import tqdm
from src.intelligence.db import Paper, Intervention, get_session
from src.intelligence.vector_store import papers_col, ce_col
from loguru import logger

# From RESOURCES.md AI Models section
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL_EMBED = "nomic-embed-text"

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


def embed_all_papers(batch_size: int = 50):
    """Embed all unembedded papers. Resumable — skips papers with embedded=1."""
    with get_session() as session:
        papers = session.query(Paper).filter_by(embedded=0).all()
        total = len(papers)
        logger.info(f"Embedding {total:,} papers (~{total * 4.8:.0f} chunks)")

        if total == 0:
            logger.info("No papers to embed")
            return

        done = 0
        for paper in tqdm(papers, desc="Embedding papers"):
            if not paper.abstract:
                paper.embedded = 1
                done += 1
                continue

            chunks = splitter.split_text(paper.abstract)
            ids = []
            documents = []
            embeddings = []
            metadatas = []

            for i, chunk in enumerate(chunks):
                ids.append(f"{paper.id}_c{i}")
                documents.append(chunk)
                embeddings.append(get_embedding(chunk))
                metadatas.append({
                    "paper_id":          paper.id,
                    "year":              paper.year or 0,
                    "intervention_type": paper.intervention_type or "",
                    "species_group":     paper.species_group or "",
                    "title":             (paper.title or "")[:200],
                })

            # Batch upsert to ChromaDB (handles duplicates on resume)
            papers_col.upsert(
                documents  = documents,
                embeddings = embeddings,
                ids        = ids,
                metadatas  = metadatas,
            )

            paper.embedded = 1
            done += 1

            # Commit to SQLite in batches
            if done % batch_size == 0:
                session.commit()
                logger.info(f"  Progress: {done:,}/{total:,} papers embedded, "
                            f"ChromaDB: {papers_col.count():,} chunks")

    logger.info(f"Paper embedding complete: {papers_col.count():,} chunks in ChromaDB")


def embed_ce_interventions():
    """Embed all CE interventions into the ce_interventions collection."""
    with get_session() as session:
        items = session.query(Intervention).all()
        total = len(items)
        logger.info(f"Embedding {total:,} CE interventions")

        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for item in tqdm(items, desc="Embedding CE"):
            text = f"{item.action} [{item.ce_category}] {item.synopsis}"
            ids.append(f"ce_{item.id}")
            documents.append(text)
            embeddings.append(get_embedding(text))
            metadatas.append({
                "ce_id":         item.id,
                "ce_category":   item.ce_category or "",
                "effectiveness": item.effectiveness or 0,
                "n_studies":     item.n_studies or 0,
            })

            # Batch upsert every 200 items
            if len(ids) >= 200:
                ce_col.upsert(
                    documents=documents, embeddings=embeddings,
                    ids=ids, metadatas=metadatas,
                )
                ids, documents, embeddings, metadatas = [], [], [], []

        # Final batch
        if ids:
            ce_col.upsert(
                documents=documents, embeddings=embeddings,
                ids=ids, metadatas=metadatas,
            )

    logger.info(f"CE embedding complete: {ce_col.count():,} items in ChromaDB")


if __name__ == "__main__":
    embed_ce_interventions()
    embed_all_papers()
