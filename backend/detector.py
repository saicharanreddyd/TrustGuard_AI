import re
from urllib.parse import urlparse


SCAM_PATTERNS = {
    "Urgency": [
        "urgent",
        "immediately",
        "act now",
        "within 24 hours",
        "today"
    ],

    "Banking threat": [
        "account blocked",
        "account suspended",
        "bank account",
        "card blocked"
    ],

    "Credential request": [
        "otp",
        "password",
        "pin",
        "cvv",
        "verify your account",
        "verify kyc"
    ],

    "Financial request": [
        "send money",
        "transfer money",
        "payment required",
        "claim prize",
        "send payment"
    ],

    "Suspicious link": [
        "click here",
        "click the link",
        "verify now",
        "login here"
    ]
}


def analyze_url(url):

    indicators = []
    score = 0

    try:
        parsed = urlparse(url)

        domain = parsed.netloc.lower()
        path = parsed.path.lower()

        # HTTPS check
        if parsed.scheme != "https":
            indicators.append("No HTTPS encryption")
            score += 15

        # IP address instead of domain
        if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
            indicators.append("IP address used instead of domain")
            score += 25

        # Suspicious words
        suspicious_words = [
            "login",
            "verify",
            "secure",
            "account",
            "update",
            "bank",
            "wallet",
            "payment",
            "password"
        ]

        for word in suspicious_words:
            if word in domain or word in path:
                indicators.append(
                    f"Sensitive keyword in URL: {word}"
                )
                score += 10

        # Very long URL
        if len(url) > 100:
            indicators.append("Unusually long URL")
            score += 10

        score = min(score, 100)

    except Exception:
        indicators.append("Invalid URL")
        score = 50

    return {
        "url_risk_score": score,
        "url_indicators": list(dict.fromkeys(indicators))
    }


def analyze_text(text):

    text_lower = text.lower()

    detected = []

    for category, patterns in SCAM_PATTERNS.items():

        for pattern in patterns:

            if pattern in text_lower:
                detected.append(category)
                break

    detected = list(dict.fromkeys(detected))

    score = min(len(detected) * 20, 100)

    urls = re.findall(
        r"https?://\S+|www\.\S+",
        text
    )

    url_analysis = []

    for url in urls:

        result = analyze_url(url)

        url_analysis.append(result)

        if result["url_risk_score"] >= 30:
            detected.append("Suspicious URL")

    detected = list(dict.fromkeys(detected))

    if score >= 60:
        risk = "DANGEROUS"

    elif score >= 30:
        risk = "SUSPICIOUS"

    else:
        risk = "LOW RISK"

    return {
        "risk": risk,
        "risk_score": score,
        "detected_patterns": detected,
        "urls": urls,
        "url_analysis": url_analysis
    }