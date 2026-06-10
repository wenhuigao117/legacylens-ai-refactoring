# LegacyLens：AI-Powered Code Refactoring Tool

A full-stack tool that uses Claude (Anthropic) to analyze and refactor legacy code, with a Human-in-the-Loop review interface.

## Tech Stack
- Frontend: React, TypeScript
- Backend: FastAPI, Python
- AI: Claude API (Anthropic)

## Setup

### Backend

1. Install dependencies:
```
pip install anthropic fastapi uvicorn
```

2. Open `backend/main.py` and paste your Anthropic API key where indicated.

3. Run:
```
uvicorn backend.main:app --reload
```

### Frontend

1. Install dependencies:
```
cd frontend
npm install
```

2. Run:
```
npm start
```

## Features
- AI-driven code refactoring powered by Claude
- Side-by-side diff view: original vs refactored code
- Human-in-the-Loop review: accept or reject individual changes
- Refactoring Report: summary of accepted and rejected changes
- Supports Python, JavaScript, and Java
