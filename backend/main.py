from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from scanner_secrets import scan_code_for_secrets, SecretScanResult
from pydantic import BaseModel

app = FastAPI(title="Secret Sniper Webhook API")

# Allow Frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodePayload(BaseModel):
    code: str
    filename: str = "unknown"

@app.post("/api/scan-secrets", response_model=SecretScanResult)
async def scan_secrets(payload: CodePayload):
    """
    Receives a chunk of code (e.g. from a git push hook or frontend paste),
    scans it for hardcoded secrets, and returns the result.
    """
    result = scan_code_for_secrets(payload.code)
    return result

@app.get("/health")
def health_check():
    return {"status": "ok"}
