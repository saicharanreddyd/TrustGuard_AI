from pathlib import Path
import joblib


# ==============================
# MODEL PATH
# ==============================

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "model" / "scam_model.pkl"


# ==============================
# LOAD MODEL
# ==============================

model = joblib.load(MODEL_FILE)


# ==============================
# ML ANALYSIS
# ==============================

def ml_analyze(text):

    prediction = int(model.predict([text])[0])

    probabilities = model.predict_proba([text])[0]

    spam_probability = float(probabilities[1])
    ham_probability = float(probabilities[0])


    if prediction == 1:

        classification = "SPAM"
        confidence = spam_probability

    else:

        classification = "HAM"
        confidence = ham_probability


    # Convert spam probability into an ML risk score.
    ml_risk_score = round(spam_probability * 100, 2)


    return {
        "classification": classification,

        "confidence": round(
            float(confidence) * 100,
            2
        ),

        "spam_probability": round(
            spam_probability * 100,
            2
        ),

        "ml_risk_score": ml_risk_score
    }