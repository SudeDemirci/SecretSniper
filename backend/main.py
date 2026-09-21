from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, get_db
import models
from scanner_secrets import scan_code_for_secrets, SecretScanResult

from prometheus_fastapi_instrumentator import Instrumentator

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Secret Sniper Webhook API")

# Instrument the FastAPI app for Prometheus metrics
Instrumentator().instrument(app).expose(app)

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
async def scan_secrets(payload: CodePayload, db: Session = Depends(get_db)):
    """
    Receives a chunk of code, scans it for hardcoded secrets,
    and saves any found secrets to the database.
    """
    result = scan_code_for_secrets(payload.code)
    
    if result.total_secrets > 0:
        for secret in result.secrets_found:
            db_secret = models.LeakedSecret(
                secret_type=secret.type,
                masked_value=secret.match,
                line_number=secret.line_number
            )
            db.add(db_secret)
        db.commit()
        
    return result

@app.get("/api/history")
def get_history(db: Session = Depends(get_db)):
    """
    Returns the history of all blocked secrets from the database.
    """
    secrets = db.query(models.LeakedSecret).order_by(models.LeakedSecret.detected_at.desc()).all()
    return secrets

@app.get("/health")
def health_check():
    return {"status": "ok"}
