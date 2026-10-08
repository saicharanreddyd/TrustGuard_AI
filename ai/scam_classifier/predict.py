from pathlib import Path
import re
import joblib


# ==============================
# LOAD TRAINED ML MODEL
# ==============================

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "model" / "scam_model.pkl"

model = joblib.load(MODEL_FILE)


# ==============================
# SCAM SIGNALS
# ==============================

SCAM_PATTERNS = {

    "Urgency": [
        "urgent",
        "immediately",
        "act now",
        "right now",
        "within 24 hours"
    ],

    "Banking threat": [
        "bank account",
        "account blocked",
        "account suspended",
        "card blocked"
    ],

    "Credential request": [
        "otp",
        "password",
        "pin",
        "cvv",
        "verify kyc",
        "verify your account"
    ],

    "Financial request": [
        "send money",
        "transfer money",
        "payment required",
        "claim refund",
        "receive your refund"
    ],

    "Suspicious link": [
        "click this link",
        "click here",
        "verify now",
        "login here"
    ]
}


# ==============================
# ANALYZE MESSAGE
# ==============================

def analyze_message(message):

    text = message.lower()

    detected = []

    for category, patterns in SCAM_PATTERNS.items():

        for pattern in patterns:

            if pattern in text:
                detected.append(category)
                break


    # ==============================
    # ML PREDICTION
    # ==============================

    prediction = model.predict([message])[0]

    probabilities = model.predict_proba([message])[0]

    if prediction == 1:

        ml_result = "SPAM"
        ml_confidence = probabilities[1]

    else:

        ml_result = "HAM"
        ml_confidence = probabilities[0]


    # ==============================
    # FINAL TRUSTGUARD SCORE
    # ==============================

    score = 0

    # Scam signals
    score += len(detected) * 15

    # ML spam signal
    if ml_result == "SPAM":
        score += int(ml_confidence * 30)

    # Suspicious URLs
    urls = re.findall(
        r"https?://\S+|www\.\S+",
        message
    )

    if urls:
        score += 15


    score = min(score, 100)


    # Risk level
    if score >= 70:

        risk = "DANGEROUS"

    elif score >= 40:

        risk = "SUSPICIOUS"

    else:

        risk = "LOW RISK"


    return {

        "risk": risk,

        "risk_score": score,

        "ml_classification": ml_result,

        "ml_confidence": round(
            ml_confidence * 100,
            2
        ),

        "detected_patterns": detected,

        "urls": urls
    }


# ==============================
# TEST
# ==============================

if __name__ == "__main__":

    message = input(
        "Enter a message: "
    )

    result = analyze_message(message)

    print("\nTrustGuard AI Result")
    print("====================")

    print(
        "Risk:",
        result["risk"]
    )

    print(
        "Risk Score:",
        result["risk_score"]
    )

    print(
        "ML Classification:",
        result["ml_classification"]
    )

    print(
        "ML Confidence:",
        result["ml_confidence"],
        "%"
    )

    print(
        "Detected Patterns:",
        result["detected_patterns"]
    )

    print(
        "URLs:",
        result["urls"]
    )