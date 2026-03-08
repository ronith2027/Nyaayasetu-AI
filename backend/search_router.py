import os
import random
from datetime import datetime
from typing import Optional, Any, List

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Query, Path
from pydantic import BaseModel
from opensearchpy import OpenSearch, RequestsHttpConnection
import jwt

load_dotenv()

router = APIRouter(prefix="/search", tags=["search"])


JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret")


class AuthedUser(BaseModel):
    userId: int
    email: str


def get_current_user(authorization: str = Depends(lambda: "")) -> AuthedUser:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token required")
    token = authorization.split(" ")[1]
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return AuthedUser(userId=int(decoded.get("userId")), email=str(decoded.get("email")))


# --- OpenSearch client setup + memory fallback ---

open_search_client: Optional[OpenSearch] = None
use_memory_search: bool = False
memory_docs: list[dict[str, Any]] = []

OPENSEARCH_ENDPOINT = os.getenv("OPENSEARCH_ENDPOINT", "https://localhost:9200")
OPENSEARCH_USERNAME = os.getenv("OPENSEARCH_USERNAME", "admin")
OPENSEARCH_PASSWORD = os.getenv("OPENSEARCH_PASSWORD", "admin")
INDEX_NAME = os.getenv("OPENSEARCH_INDEX", "user-data-vectors")
EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIMENSION", "1536"))

try:
    open_search_client = OpenSearch(
        hosts=[OPENSEARCH_ENDPOINT],
        http_auth=(OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD),
        use_ssl=True,
        verify_certs=False,
        connection_class=RequestsHttpConnection,
    )
except Exception as e:  # pragma: no cover
    print("Failed to create OpenSearch client, using memory mode:", e)
    use_memory_search = True


def init_index() -> None:
    global use_memory_search
    if not open_search_client:
        use_memory_search = True
        return
    try:
        exists = open_search_client.indices.exists(INDEX_NAME)
        if not exists:
            body = {
                "settings": {
                    "index": {
                        "knn": True,
                        "knn.algo_param.ef_search": 512,
                    }
                },
                "mappings": {
                    "properties": {
                        "user_id": {"type": "keyword"},
                        "data_type": {"type": "keyword"},
                        "text": {"type": "text"},
                        "embedding": {
                            "type": "knn_vector",
                            "dimension": EMBEDDING_DIM,
                            "method": {
                                "name": "hnsw",
                                "space_type": "cosinesimil",
                                "engine": "nmslib",
                                "parameters": {
                                    "ef_construction": 512,
                                    "m": 16,
                                },
                            },
                        },
                        "created_at": {"type": "date"},
                        "metadata": {"type": "object"},
                    }
                },
            }
            open_search_client.indices.create(INDEX_NAME, body=body)
            print("OpenSearch index created successfully")
    except Exception as e:  # pragma: no cover
        print("Error initializing OpenSearch index, switching to memory mode:", e)
        use_memory_search = True


if not use_memory_search:
    init_index()


def generate_embedding(text: str) -> List[float]:
    # Placeholder: random normalized vector, same as TS version
    import math
    import random as rnd

    vec = [rnd.random() - 0.5 for _ in range(EMBEDDING_DIM)]
    mag = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / mag for v in vec]


class StoreRequest(BaseModel):
    text: str
    data_type: str
    metadata: Optional[dict[str, Any]] = None


class QueryRequest(BaseModel):
    query_text: str
    data_type: Optional[str] = None
    size: int = 10
    min_score: float = 0.5


@router.post("/store")
def store(
    body: StoreRequest,
    current_user: AuthedUser = Depends(get_current_user),
):
    if not body.text or not isinstance(body.text, str):
        raise HTTPException(
            status_code=400,
            detail="Text is required and must be a string",
        )

    if use_memory_search:
        doc_id = f"mem_{int(datetime.utcnow().timestamp() * 1000)}"
        doc = {
            "id": doc_id,
            "user_id": current_user.userId,
            "data_type": body.data_type,
            "text": body.text,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": body.metadata or {},
        }
        memory_docs.append(doc)
        return {
            "message": "Data stored (Memory mode)",
            "document_id": doc_id,
            "user_id": current_user.userId,
            "data_type": body.data_type,
        }

    try:
        emb = generate_embedding(body.text)
        doc_body = {
            "user_id": current_user.userId,
            "data_type": body.data_type,
            "text": body.text,
            "embedding": emb,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": body.metadata or {},
        }
        resp = open_search_client.index(index=INDEX_NAME, body=doc_body, refresh=True)
        doc_id = resp["_id"]
    except Exception as e:  # pragma: no cover
        print("Store data error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "message": "Data stored successfully in OpenSearch",
        "document_id": doc_id,
        "user_id": current_user.userId,
        "data_type": body.data_type,
    }


@router.post("/query")
def query(
    body: QueryRequest,
    current_user: AuthedUser = Depends(get_current_user),
):
    if not body.query_text or not isinstance(body.query_text, str):
        raise HTTPException(
            status_code=400,
            detail="query_text is required and must be a string",
        )

    if use_memory_search:
        docs = [d for d in memory_docs if d["user_id"] == current_user.userId]
        if body.data_type:
            docs = [d for d in docs if d["data_type"] == body.data_type]
        q = body.query_text.lower()
        hits = [
            {
                "document_id": d["id"],
                "score": 1.0,
                **d,
            }
            for d in docs
            if q in d["text"].lower()
        ][: body.size]
        return {
            "query": body.query_text,
            "results": hits,
            "total": len(hits),
            "note": "Using memory-based text search",
        }

    try:
        query_emb = generate_embedding(body.query_text)
        search_body: dict[str, Any] = {
            "query": {
                "bool": {
                    "must": [{"term": {"user_id": current_user.userId}}],
                    "should": [
                        {
                            "knn": {
                                "embedding": {
                                    "vector": query_emb,
                                    "k": body.size,
                                }
                            }
                        }
                    ],
                    "minimum_should_match": 1,
                }
            },
            "size": body.size,
            "min_score": body.min_score,
        }
        if body.data_type:
            search_body.setdefault("query", {}).setdefault("bool", {}).setdefault(
                "filter", []
            ).append({"term": {"data_type": body.data_type}})

        resp = open_search_client.search(index=INDEX_NAME, body=search_body)
        hits = [
            {
                "document_id": h["_id"],
                "score": h["_score"],
                "user_id": h["_source"]["user_id"],
                "data_type": h["_source"]["data_type"],
                "text": h["_source"]["text"],
                "created_at": h["_source"]["created_at"],
                "metadata": h["_source"].get("metadata", {}),
            }
            for h in resp["hits"]["hits"]
        ]
        total_raw = resp["hits"]["total"]
        total = total_raw if isinstance(total_raw, int) else total_raw.get("value", 0)
    except Exception as e:  # pragma: no cover
        print("Search query error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "query": body.query_text,
        "results": hits,
        "total": total,
    }


@router.get("/user/{user_id}")
def user_docs(
    user_id: int,
    data_type: Optional[str] = Query(None),
    size: int = Query(50, ge=1, le=200),
    from_: int = Query(0, ge=0, alias="from"),
    current_user: AuthedUser = Depends(get_current_user),
):
    if user_id != current_user.userId:
        raise HTTPException(status_code=403, detail="Access denied")

    if use_memory_search:
        docs = [d for d in memory_docs if d["user_id"] == user_id]
        if data_type:
            docs = [d for d in docs if d["data_type"] == data_type]
        docs_sorted = sorted(
            docs, key=lambda d: d["created_at"], reverse=True
        )
        paginated = docs_sorted[from_ : from_ + size]
        return {
            "user_id": user_id,
            "documents": paginated,
            "total": len(docs),
        }

    try:
        search_body: dict[str, Any] = {
            "query": {
                "bool": {
                    "must": [{"term": {"user_id": user_id}}],
                }
            },
            "size": size,
            "from": from_,
            "sort": [{"created_at": {"order": "desc"}}],
        }
        if data_type:
            search_body["query"]["bool"]["filter"] = [{"term": {"data_type": data_type}}]

        resp = open_search_client.search(index=INDEX_NAME, body=search_body)
        hits = [
            {
                "document_id": h["_id"],
                "user_id": h["_source"]["user_id"],
                "data_type": h["_source"]["data_type"],
                "text": h["_source"]["text"],
                "created_at": h["_source"]["created_at"],
                "metadata": h["_source"].get("metadata", {}),
            }
            for h in resp["hits"]["hits"]
        ]
        total_raw = resp["hits"]["total"]
        total = total_raw if isinstance(total_raw, int) else total_raw.get("value", 0)
    except Exception as e:  # pragma: no cover
        print("Get user documents error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "user_id": user_id,
        "documents": hits,
        "total": total,
    }


@router.delete("/document/{document_id}")
def delete_doc(
    document_id: str,
    current_user: AuthedUser = Depends(get_current_user),
):
    if use_memory_search:
        for idx, d in enumerate(memory_docs):
            if d["id"] == document_id and d["user_id"] == current_user.userId:
                memory_docs.pop(idx)
                return {
                    "message": "Document deleted (Memory mode)",
                    "document_id": document_id,
                }
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        # Check ownership
        get_resp = open_search_client.get(index=INDEX_NAME, id=document_id)
        if get_resp["_source"].get("user_id") != current_user.userId:
            raise HTTPException(status_code=403, detail="Access denied")

        open_search_client.delete(index=INDEX_NAME, id=document_id)
    except Exception as e:  # pragma: no cover
        from opensearchpy.exceptions import NotFoundError

        if isinstance(e, NotFoundError):
            raise HTTPException(status_code=404, detail="Document not found")
        print("Delete document error:", e)
        raise HTTPException(status_code=500, detail="Internal server error")

    return {
        "message": "Document deleted successfully",
        "document_id": document_id,
    }


@router.get("/health")
def health():
    if use_memory_search:
        return {
            "status": "healthy",
            "opensearch_status": "MEMORY_MODE",
            "cluster_name": "local-memory",
        }
    try:
        health_resp = open_search_client.cluster.health()
        return {
            "status": "healthy",
            "opensearch_status": health_resp["status"],
            "cluster_name": health_resp["cluster_name"],
        }
    except Exception as e:  # pragma: no cover
        print("Health check error:", e)
        raise HTTPException(
            status_code=500,
            detail="OpenSearch connection failed",
        )

