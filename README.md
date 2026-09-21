# Secret Sniper | DevSecOps Pre-Commit Guard

A DevSecOps pre-commit webhook system designed to automatically intercept and block hardcoded API keys and passwords from being pushed to repositories using Regex and YARA rules.

## Features
- **Git Pre-Commit Hook Integration:** Blocks developers from committing code if it contains secrets.
- **Pattern Matching (Regex):** Scans for AWS Access Keys, Stripe Keys, OpenAI Tokens, and generic passwords.
- **FastAPI Backend:** Orchestrates the scanning logic and serves the API.
- **Enterprise Dashboard:** Modern, Atlassian-style UI to visualize intercepted secrets and Quality Gate status.
- **Security Masking:** Safely redacts secrets (`AKIA****MPLE`) on the dashboard to prevent leakage.

## Tech Stack
- **Backend:** Python 3.11, FastAPI
- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Security:** Git Hooks, Regex Pattern Matching

## How to Run Locally

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001
```

### 2. Open the Dashboard
Simply open `frontend/index.html` in your browser.

## How to use the Git Hook
1. Copy the `pre_commit_hook.py` logic into your repository.
2. In your `.git/hooks/pre-commit` file, add a script to execute the scanner before allowing the commit.
