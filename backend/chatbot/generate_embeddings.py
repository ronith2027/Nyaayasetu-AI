import boto3
import json
import faiss
import numpy as np
import re
import os
import argparse

# -----------------------------
# CONFIG
# -----------------------------

REGION = "ap-south-1"
BEDROCK_MODEL = "amazon.titan-embed-text-v2:0"

S3_BUCKET = "legal-rag-storage"
FAISS_FILE = "constitution.index"
METADATA_FILE = "chunks.json"

# -----------------------------
# Bedrock client
# -----------------------------

bedrock = boto3.client(
    service_name="bedrock-runtime",
    region_name=REGION
)

# -----------------------------
# Get embedding from Bedrock
# -----------------------------

def get_embedding(text):

    response = bedrock.invoke_model(
        modelId=BEDROCK_MODEL,
        body=json.dumps({
            "inputText": text
        })
    )

    result = json.loads(response["body"].read())
    return result["embedding"]


# -----------------------------
# Load + parse constitution text
# -----------------------------

def _extract_text_from_pdf(file_path: str) -> str:

    try:
        from pypdf import PdfReader
    except Exception as e:
        raise RuntimeError(
            "PDF support requires the 'pypdf' package. Install with: pip install pypdf"
        ) from e

    reader = PdfReader(file_path)
    parts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        parts.append(page_text)

    return "\n".join(parts)


def _load_source_text(file_path: str) -> str:

    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return _extract_text_from_pdf(file_path)

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def _title_case_part_name(part_name: str) -> str:
    cleaned = re.sub(r"\s+", " ", part_name.strip())
    return cleaned.title()

def split_text(text: str, max_chars: int = 2500, overlap_chars: int = 200):

    text = text.strip()
    if not text:
        return []

    if max_chars <= 0:
        return [text]

    overlap_chars = max(0, min(overlap_chars, max_chars - 1))

    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + max_chars, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        if end >= n:
            break

        start = end - overlap_chars

    return chunks

def parse_constitution(file_path):

    text = _load_source_text(file_path)

    # Normalize whitespace to make regex matching more stable across PDFs
    text = text.replace("\r", "\n")
    text = re.sub(r"[\t\f\v]", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # We scan the document in order, updating the current PART title when encountered.
    # Typical patterns in Constitution PDFs:
    #   PART III
    #   FUNDAMENTAL RIGHTS
    # We capture both lines when available.
    part_pattern = re.compile(
        r"\bPART\s+([IVXLC]+)\b\s*(?:\n|\s)+([A-Z][A-Z\s\-]{3,})",
        flags=re.MULTILINE,
    )

    # Articles may appear as: "Article 21" or "Article 21." in extracted text.
    article_pattern = re.compile(r"\bArticle\s+(\d+)\b\s*\.?", flags=re.IGNORECASE)

    markers = []

    for m in part_pattern.finditer(text):
        markers.append((m.start(), "part", m))

    for m in article_pattern.finditer(text):
        markers.append((m.start(), "article", m))

    markers.sort(key=lambda x: x[0])

    chunks = []
    current_part = "Unknown"

    i = 0
    while i < len(markers):
        _, kind, match = markers[i]

        if kind == "part":
            # Update part name and continue
            part_name = match.group(2)
            current_part = _title_case_part_name(part_name)
            i += 1
            continue

        if kind != "article":
            i += 1
            continue

        article_number = match.group(1)
        article_start = match.end()

        # Find the end of this article: next ARTICLE marker (preferred), otherwise next marker.
        article_end = len(text)
        j = i + 1
        while j < len(markers):
            if markers[j][1] == "article":
                article_end = markers[j][0]
                break
            j += 1

        article_text = text[article_start:article_end].strip()
        article_text = re.sub(r"\s+", " ", article_text).strip()

        if article_text:
            chunks.append({
                "article": str(article_number),
                "part": current_part,
                "text": article_text,
            })

        i += 1

    return chunks


# -----------------------------
# Main pipeline
# -----------------------------

def build_index():

    print("Parsing constitution...")

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="constitution.pdf",
        help="Path to constitution source file (.txt or .pdf)",
    )
    parser.add_argument(
        "--max-chars",
        type=int,
        default=2500,
    )
    parser.add_argument(
        "--overlap-chars",
        type=int,
        default=200,
    )
    args, _ = parser.parse_known_args()

    chunks = parse_constitution(args.input)

    print("Total chunks:", len(chunks))

    new_chunks = []
    embeddings = []

    print("Generating embeddings...")

    for c in chunks:
        sub_texts = split_text(c["text"], max_chars=args.max_chars, overlap_chars=args.overlap_chars)
        for sub_text in sub_texts:
            vec = get_embedding(sub_text)
            embeddings.append(vec)
            new_chunks.append({
                "article": c["article"],
                "part": c["part"],
                "text": sub_text,
            })

    if not embeddings:
        raise RuntimeError("No embeddings generated. Check input parsing and chunking.")

    vectors = np.array(embeddings).astype("float32")

    dimension = vectors.shape[1]

    print("Vector dimension:", dimension)

    index = faiss.IndexFlatL2(dimension)

    index.add(vectors)

    print("FAISS index size:", index.ntotal)

    # Save FAISS index
    faiss.write_index(index, FAISS_FILE)

    # Save metadata
    with open(METADATA_FILE, "w") as f:
        json.dump(new_chunks, f, ensure_ascii=False, indent=2)

    print("Files saved locally")


# -----------------------------
# Upload to S3
# -----------------------------

def upload_to_s3():

    s3 = boto3.client("s3")

    s3.upload_file(FAISS_FILE, S3_BUCKET, f"faiss/{FAISS_FILE}")
    s3.upload_file(METADATA_FILE, S3_BUCKET, f"faiss/{METADATA_FILE}")

    print("Uploaded to S3")


# -----------------------------
# Run pipeline
# -----------------------------

if __name__ == "__main__":

    build_index()
    upload_to_s3()