def calculate_risk(
    message_score,
    url_analysis,
    detected_patterns,
    ml_analysis=None,
    social_engineering=None
):
    """
    Combine TrustGuard security signals into
    one final risk score from 0 to 100.

    Signals:
    - Rule-based message detection
    - URL security analysis
    - ML scam probability
    - Social-engineering indicators
    """

    # --------------------------------
    # BASE MESSAGE SCORE
    # --------------------------------

    final_score = float(message_score)


    # --------------------------------
    # URL SECURITY SIGNAL
    # --------------------------------

    if url_analysis:

        url_scores = [
            item.get("url_risk_score", 0)
            for item in url_analysis
        ]

        if url_scores:
            highest_url_score = max(url_scores)

            # Message rules remain the primary signal.
            # URL analysis contributes additional evidence.
            final_score = (
                final_score * 0.65
                + highest_url_score * 0.35
            )


    # --------------------------------
    # ML SECURITY SIGNAL
    # --------------------------------

    if ml_analysis:

        ml_score = float(
            ml_analysis.get("ml_risk_score", 0)
        )

        # ML supports the existing security evidence
        # rather than replacing rule-based detection.
        final_score = (
            final_score * 0.80
            + ml_score * 0.20
        )


    # --------------------------------
    # HIGH-RISK PATTERNS
    # --------------------------------

    high_risk_patterns = [
        "Credential request",
        "Banking threat",
        "Financial request"
    ]

    for pattern in high_risk_patterns:

        if pattern in detected_patterns:
            final_score += 5


    # --------------------------------
    # SOCIAL ENGINEERING SIGNALS
    # --------------------------------

    if social_engineering:

        # Multiple manipulation techniques increase risk,
        # but cap the bonus to avoid score inflation.
        social_bonus = min(
            len(social_engineering) * 3,
            12
        )

        final_score += social_bonus


    # --------------------------------
    # STRONG MULTI-SIGNAL ATTACK
    # --------------------------------

    ml_is_scam = (
        ml_analysis
        and ml_analysis.get("classification") == "SPAM"
        and float(ml_analysis.get("confidence", 0)) >= 75
    )

    strong_rule_signal = (
        message_score >= 50
        or len(detected_patterns) >= 3
    )

    # If independent layers agree that the message is
    # malicious, prevent averaging from hiding the threat.
    if ml_is_scam and strong_rule_signal:
        final_score = max(final_score, 70)


    # --------------------------------
    # NORMALIZE SCORE
    # --------------------------------

    final_score = max(
        0,
        min(round(final_score), 100)
    )


    # --------------------------------
    # FINAL CLASSIFICATION
    # --------------------------------

    if final_score >= 70:
        risk = "DANGEROUS"

    elif final_score >= 40:
        risk = "SUSPICIOUS"

    else:
        risk = "LOW RISK"


    # --------------------------------
    # CONFIDENCE
    # --------------------------------

    evidence_count = len(detected_patterns)

    if social_engineering:
        evidence_count += len(social_engineering)

    if url_analysis:
        evidence_count += 1

    if ml_is_scam:
        evidence_count += 1

    confidence = min(
        60 + evidence_count * 5,
        98
    )


    return {
        "risk": risk,
        "risk_score": final_score,
        "confidence": confidence
    }