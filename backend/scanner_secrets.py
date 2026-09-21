import re
from pydantic import BaseModel
from typing import List

class SecretMatch(BaseModel):
    type: str
    match: str
    line_number: int
    severity: str

class SecretScanResult(BaseModel):
    status: str
    secrets_found: List[SecretMatch]
    total_secrets: int

# YARA/Regex style rules for catching secrets
SECRET_PATTERNS = {
    "AWS Access Key ID": r"(?i)AKIA[0-9A-Z]{16}",
    "Stripe Secret Key": r"(?i)sk_live_[0-9a-zA-Z]{24}",
    "OpenAI API Key": r"sk-[a-zA-Z0-9]{48}",
    "Generic Password/Token Leak": r"(?i)(?:password|secret|api_key|token|auth)[\s]*[:=][\s]*['\"]([^'\"]{6,})['\"]"
}

def scan_code_for_secrets(code_content: str) -> SecretScanResult:
    found_secrets = []
    lines = code_content.splitlines()
    
    for i, line in enumerate(lines):
        for secret_type, pattern in SECRET_PATTERNS.items():
            matches = re.finditer(pattern, line)
            for match in matches:
                # Mask the secret for display so we don't leak it on the dashboard
                raw_match = match.group(0)
                if len(raw_match) > 10:
                    masked_match = raw_match[:4] + "*" * (len(raw_match) - 8) + raw_match[-4:]
                else:
                    masked_match = "***[REDACTED]***"
                
                found_secrets.append(SecretMatch(
                    type=secret_type,
                    match=masked_match,
                    line_number=i + 1,
                    severity="CRITICAL"
                ))
                
    status = "FAILED" if len(found_secrets) > 0 else "PASSED"
    return SecretScanResult(
        status=status,
        secrets_found=found_secrets,
        total_secrets=len(found_secrets)
    )
