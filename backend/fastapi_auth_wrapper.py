import json
from fastapi import APIRouter, Request
from .lambda.auth_lambda import lambda_handler

router = APIRouter(prefix="/auth")

@router.post("/signup")
async def signup(request: Request):
    body_bytes = await request.body()
    event = {
        "httpMethod": "POST",
        "path": "/auth/signup",
        "body": body_bytes.decode("utf-8"),
        "headers": dict(request.headers),
    }
    return lambda_handler(event, None)

@router.post("/login")
async def login(request: Request):
    body_bytes = await request.body()
    event = {
        "httpMethod": "POST",
        "path": "/auth/login",
        "body": body_bytes.decode("utf-8"),
        "headers": dict(request.headers),
    }
    return lambda_handler(event, None)

@router.options("/{proxy_path:path}")
async def options():
    # FastAPI will automatically handle CORS via the middleware, but we provide a 200 response for pre‑flight.
    return {"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*"}}
