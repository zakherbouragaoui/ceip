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
