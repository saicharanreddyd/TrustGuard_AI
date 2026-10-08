from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.detector import analyze_text
from backend.risk_engine import calculate_risk
from backend.social_engineering import detect_social_engineering
from ai.scam_classifier.ml_detector import ml_analyze


app = FastAPI(
    title="TrustGuard AI",
    description="AI-powered digital safety system"
)


# ==============================
# CORS
# ==============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================
# REQUEST MODEL
# ==============================

class Message(BaseModel):
    text: str


# ==============================
# HOME
# ==============================

@app.get("/")
def home():
    return {
        "project": "TrustGuard AI",
        "status": "online"
    }


# ==============================
# ANALYZE
# ==============================

@app.post("/analyze")
def analyze(message: Message):

    # Rule-based analysis
    result = analyze_text(message.text)

    # Machine-learning analysis
    ml_result = ml_analyze(message.text)

    # Social-engineering analysis
    social_signals = detect_social_engineering(
        message.text
    )

    # Combined TrustGuard risk engine
    final_risk = calculate_risk(
        result["risk_score"],
        result["url_analysis"],
        result["detected_patterns"],
        ml_analysis=ml_result,
        social_engineering=social_signals
    )

    return {
        "message": message.text,
        **result,
        "social_engineering": social_signals,
        "ml_analysis": ml_result,
        **final_risk
    }