SOCIAL_ENGINEERING_PATTERNS = {

    "Urgency": [
        "urgent",
        "immediately",
        "act now",
        "right now",
        "within 24 hours",
        "today",
        "expires"
    ],

    "Fear / Threat": [
        "account blocked",
        "account suspended",
        "account will be closed",
        "legal action",
        "police",
        "penalty",
        "arrest"
    ],

    "Authority Impersonation": [
        "bank",
        "police",
        "government",
        "income tax",
        "official",
        "support team",
        "security team"
    ],

    "Reward / Prize": [
        "winner",
        "you won",
        "prize",
        "reward",
        "cashback",
        "lottery",
        "free gift"
    ],

    "Secrecy / Isolation": [
        "do not tell anyone",
        "keep this secret",
        "don't share",
        "confidential"
    ],

    "Credential Request": [
        "otp",
        "password",
        "pin",
        "cvv",
        "verification code",
        "login details"
    ]
}


def detect_social_engineering(text):

    text = text.lower()

    detected = []

    for category, patterns in SOCIAL_ENGINEERING_PATTERNS.items():

        for pattern in patterns:

            if pattern in text:
                detected.append(category)
                break

    return list(dict.fromkeys(detected))