import anthropic
import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
 
app = FastAPI()
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
# Paste your Anthropic API key here, or set ANTHROPIC_API_KEY environment variable
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
 
class RefactorRequest(BaseModel):
    code: str
    language: str = "python"
 
@app.post("/refactor")
async def refactor_code(request: RefactorRequest):
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": f"""You are an expert software engineer. Refactor this {request.language} code.
 
Return ONLY a JSON object, no markdown, no backticks, no extra text:
{{
  "original_code": "...",
  "refactored_code": "...",
  "changes": ["change 1", "change 2"],
  "summary": "...",
  "scores": {{
    "maintainability_before": 55,
    "maintainability_after": 82,
    "complexity_before": 70,
    "complexity_after": 40,
    "readability_before": 60,
    "readability_after": 85
  }}
}}
 
Replace the example numbers above with actual scores for the code.
Maintainability and readability: higher is better (0-100).
Complexity: lower is better (0-100).
 
Code:
{request.code}"""
                }
            ]
        )
        text = message.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text)
        return result
    except Exception as e:
        return {"error": str(e)}
    
@app.post("/generate-tests")
async def generate_tests(request: RefactorRequest):
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2000,
            messages=[
                {
                    "role": "user",
                    "content": f"""You are an expert software engineer. Write unit tests for this {request.language} code.

Return ONLY a JSON object, no markdown, no backticks, no extra text:
{{"tests": "the complete test code as a string", "framework": "pytest or unittest or jest"}}

Code:
{request.code}"""
                }
            ]
        )
        text = message.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        result = json.loads(text)
        return result
    except Exception as e:
        return {"error": str(e)}
 
@app.get("/")
def root():
    return {"status": "LegacyLens backend running"}
 