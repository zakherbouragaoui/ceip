# CEIP Backend — Hugging Face Spaces (Docker SDK)
# Runs FastAPI on port 7860 (HF Spaces default)

FROM python:3.11-slim

WORKDIR /app

# System deps for psycopg2-binary and chromadb
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (production only — no torch/jupyter)
COPY requirements-render.txt .
RUN pip install --no-cache-dir -r requirements-render.txt

# Copy application code
COPY src/ src/
COPY contracts/ contracts/

# Ensure Python can find modules from project root
ENV PYTHONPATH=/app

# Create data directories (will use persistent storage if mounted)
RUN mkdir -p /data/embeddings

# HF Spaces runs on port 7860
ENV PORT=7860
ENV PYTHONUNBUFFERED=1

# Data paths — point to /data for HF persistent storage
ENV DB_PATH=/data/ceip.db
ENV CHROMA_PATH=/data/embeddings

# Default to cloud backends (no local Ollama on HF Spaces)
ENV LLM_BACKEND=groq
ENV EMBEDDING_BACKEND=huggingface

EXPOSE 7860

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "7860"]
