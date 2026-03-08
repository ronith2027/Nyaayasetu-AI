import boto3
import json
import faiss
import numpy as np
import os
import base64
import re
from email.parser import BytesParser
from email.policy import default

# -------- AWS clients --------
s3 = boto3.client("s3")
bedrock = boto3.client("bedrock-runtime")

# -------- S3 configuration --------
BUCKET = os.environ.get("VECTOR_BUCKET", "legal-rag-storage")
INDEX_KEY = os.environ.get("VECTOR_INDEX_KEY", "faiss/constitution.index")
CHUNKS_KEY = os.environ.get("VECTOR_CHUNKS_KEY", "faiss/chunks.json")

EMBED_MODEL_ID = os.environ.get("EMBED_MODEL_ID", "amazon.titan-embed-text-v2:0")
CHAT_MODEL_ID = os.environ.get("CHAT_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

INDEX_PATH = "/tmp/constitution.index"
CHUNKS_PATH = "/tmp/chunks.json"

# -------- Global cache (important for Lambda speed) --------
index = None
chunks = None


# --------------------------------
# Load FAISS index from S3
# --------------------------------

def load_vector_store():

    global index, chunks

    if index is None:

        print("Downloading FAISS index from S3...")

        s3.download_file(BUCKET, INDEX_KEY, INDEX_PATH)
        s3.download_file(BUCKET, CHUNKS_KEY, CHUNKS_PATH)

        index = faiss.read_index(INDEX_PATH)

        with open(CHUNKS_PATH) as f:
            chunks = json.load(f)

        print("Vector store loaded")

    return index, chunks


# --------------------------------
# Generate embedding (Bedrock)
# --------------------------------

def get_embedding(text):

    response = bedrock.invoke_model(
        modelId=EMBED_MODEL_ID,
        body=json.dumps({
            "inputText": text
        })
    )

    result = json.loads(response["body"].read())

    vector = np.array(result["embedding"]).astype("float32")

    return vector


# --------------------------------
# Vector search
# --------------------------------

def search(query):

    index, chunks = load_vector_store()

    query_vector = get_embedding(query)

    query_vector = np.array([query_vector])

    D, I = index.search(query_vector, k=5)

    results = [chunks[i] for i in I[0]]

    return results


def _response(status_code: int, body: dict):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def _fallback_chat_response():
    return {
        "summary": "We are unable to process your query right now.",
        "legal_basis": "Not available",
        "steps": [],
        "documents_required": [],
        "confidence_score": 0.2,
    }


def _parse_multipart_form(event):

    headers = event.get("headers") or {}
    content_type = headers.get("content-type") or headers.get("Content-Type")
    if not content_type:
        raise ValueError("Missing Content-Type header")

    body = event.get("body") or ""
    if event.get("isBase64Encoded"):
        raw_body = base64.b64decode(body)
    else:
        raw_body = body.encode("utf-8")

    # Parse multipart as an email message
    msg = BytesParser(policy=default).parsebytes(
        b"Content-Type: " + content_type.encode("utf-8") + b"\r\n\r\n" + raw_body
    )

    form = {}
    files = {}

    for part in msg.iter_parts():
        disposition = part.get("Content-Disposition", "")
        name_match = re.search(r"name=\"([^\"]+)\"", disposition)
        if not name_match:
            continue

        name = name_match.group(1)
        filename_match = re.search(r"filename=\"([^\"]*)\"", disposition)
        if filename_match and filename_match.group(1):
            files[name] = {
                "filename": filename_match.group(1),
                "content_type": part.get_content_type(),
                "content": part.get_payload(decode=True) or b"",
            }
        else:
            payload = part.get_payload(decode=True) or b""
            form[name] = payload.decode("utf-8", errors="ignore")

    return form, files


def _extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:

    try:
        from pypdf import PdfReader
    except Exception as e:
        raise RuntimeError(
            "PDF upload support requires the 'pypdf' package. Install it in the container requirements."
        ) from e

    import io
    reader = PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n".join(pages)


# --------------------------------
# Generate answer using Claude
# --------------------------------

def generate_answer(query, contexts):

    context_text = "\n".join([c.get("text", "") for c in contexts])

    return {
        "context_text": context_text,
    }


def generate_chat_response(message: str, language: str, contexts, document_text: str = ""):

    base_context = "\n".join([c.get("text", "") for c in contexts])
    combined_context = base_context
    if document_text:
        combined_context = combined_context + "\n\n" + "User Document (extracted text):\n" + document_text

    system_instruction = f"""
You are NyayaSetu AI, an expert virtual legal assistant for Indian Law.
Provide accurate, helpful, and concise legal guidance based on the user's query and the provided context.

IMPORTANT: You MUST respond in the EXACT same language matching the locale '{language}'.
For example:
If locale is 'hi-IN', reply entirely in Hindi (Devanagari script).

Your response MUST be a valid JSON object matching the following structure exactly:
{{
  "summary": "...",
  "legal_basis": "...",
  "steps": ["Step 1", "Step 2"],
  "documents_required": ["Doc 1", "Doc 2"],
  "confidence_score": 0.0
}}

Do not include markdown formatting or backticks. Output raw JSON only.
""".strip()

    user_prompt = f"""
Context:
{combined_context}

User Query:
{message}
""".strip()

    response = bedrock.invoke_model(
        modelId=CHAT_MODEL_ID,
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 800,
            "temperature": 0.2,
            "messages": [
                {
                    "role": "user",
                    "content": system_instruction + "\n\n" + user_prompt,
                }
            ],
        }),
    )

    result = json.loads(response["body"].read())
    text = result["content"][0]["text"]

    try:
        data = json.loads(text)
    except Exception:
        return _fallback_chat_response()

    # Ensure required keys exist
    return {
        "summary": data.get("summary", ""),
        "legal_basis": data.get("legal_basis", "Not available"),
        "steps": data.get("steps") if isinstance(data.get("steps"), list) else [],
        "documents_required": data.get("documents_required") if isinstance(data.get("documents_required"), list) else [],
        "confidence_score": float(data.get("confidence_score", 0.5))
        if isinstance(data.get("confidence_score"), (int, float))
        else 0.5,
    }


# --------------------------------
# Lambda handler
# --------------------------------

def lambda_handler(event, context):

    try:
        method = (
            (event.get("requestContext") or {}).get("http") or {}
        ).get("method") or event.get("httpMethod") or "POST"

        if method.upper() == "OPTIONS":
            return _response(200, {"ok": True})

        headers = event.get("headers") or {}
        content_type = (headers.get("content-type") or headers.get("Content-Type") or "").lower()

        message = ""
        language = "en-IN"
        pdf_bytes = None

        if "multipart/form-data" in content_type:
            form, files = _parse_multipart_form(event)
            message = (form.get("message") or "").strip()
            language = (form.get("language") or "en-IN").strip() or "en-IN"
            if "file" in files and (files["file"].get("content") or b""):
                pdf_bytes = files["file"]["content"]
        else:
            body = event.get("body")
            if body:
                if event.get("isBase64Encoded"):
                    body = base64.b64decode(body).decode("utf-8", errors="ignore")
                parsed = json.loads(body) if isinstance(body, str) else body
                message = (parsed.get("message") or parsed.get("query") or "").strip()
                language = (parsed.get("language") or "en-IN").strip() or "en-IN"

        if not message and not pdf_bytes:
            return _response(400, {"error": "message is required"})

        contexts = search(message or "Please analyze the attached document.")

        document_text = ""
        if pdf_bytes:
            document_text = _extract_text_from_pdf_bytes(pdf_bytes)

        chat_response = generate_chat_response(message or "Please analyze the attached document.", language, contexts, document_text=document_text)

        return _response(200, chat_response)

    except Exception as e:
        print("[CHATBOT_ERROR]", str(e))
        return _response(500, _fallback_chat_response())