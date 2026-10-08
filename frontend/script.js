// ========================================
// TrustGuard AI
// Frontend JavaScript
// ========================================


// ========================================
// OPEN SCANNER
// ========================================

function openScanner(type) {
    window.location.href = "scan.html?type=" + type;
}


// ========================================
// APP ACCESS CONTROL PAGE
// ========================================

function openAppControl() {
    window.location.href = "app-control.html";
}


// ========================================
// ANALYZE CONTENT
// ========================================

async function analyzeContent() {

    const contentBox = document.getElementById("content");

    if (!contentBox) {
        return;
    }

    const text = contentBox.value.trim();

    if (!text) {
        alert("Please enter some content first.");
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/analyze",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: text
                })
            }
        );

        if (!response.ok) {
            throw new Error("Backend server error");
        }

        const data = await response.json();

        saveScanResult(data);


        // ========================================
        // SHOW RESULT
        // ========================================

        const result = document.getElementById("result");

        if (result) {
            result.classList.remove("hidden");
        }


        // ========================================
        // RISK ICON
        // ========================================

        let icon = "🟢";

        if (data.risk === "DANGEROUS") {
            icon = "🔴";
        }
        else if (data.risk === "SUSPICIOUS") {
            icon = "🟠";
        }
        else if (data.risk === "UNCERTAIN") {
            icon = "🟡";
        }

        const riskIcon =
            document.getElementById("riskIcon");

        if (riskIcon) {
            riskIcon.textContent = icon;
        }


        // ========================================
        // RISK TITLE
        // ========================================

        const riskTitle =
            document.getElementById("riskTitle");

        if (riskTitle) {
            riskTitle.textContent = data.risk;
        }


        // ========================================
        // RISK SCORE
        // ========================================

        const riskScore =
            document.getElementById("riskScore");

        if (riskScore) {
            riskScore.textContent =
                data.risk_score + "/100";
        }
        // ========================================
// REAL-TIME RISK MESSAGE
// ========================================

const realtimeStatus =
    document.getElementById("realtimeStatus");

if (realtimeStatus) {

    if (data.risk === "DANGEROUS") {

        realtimeStatus.textContent =
            "🔴 DANGEROUS — Avoid this message";

        realtimeStatus.style.background =
            "#fef2f2";

        realtimeStatus.style.color =
            "#b91c1c";

    }
    else if (data.risk === "SUSPICIOUS") {

        realtimeStatus.textContent =
            "🟠 SUSPICIOUS — Review before interacting";

        realtimeStatus.style.background =
            "#fff7ed";

        realtimeStatus.style.color =
            "#c2410c";

    }
    else {

        realtimeStatus.textContent =
            "🟢 SAFE — No major threats detected";

        realtimeStatus.style.background =
            "#ecfdf5";

        realtimeStatus.style.color =
            "#166534";
    }
}


        // ========================================
        // DETECTION REASONS
        // ========================================

        const reasonList =
            document.getElementById("reasonList");

        if (reasonList) {

            reasonList.innerHTML = "";

            if (
                data.detected_patterns &&
                data.detected_patterns.length > 0
            ) {

                data.detected_patterns.forEach(
                    pattern => {

                        const li =
                            document.createElement("li");

                        li.textContent =
                            "✓ " + pattern;

                        reasonList.appendChild(li);
                    }
                );

            }
            else {

                const li =
                    document.createElement("li");

                li.textContent =
                    "No suspicious patterns detected";

                reasonList.appendChild(li);
            }


            // ========================================
            // SOCIAL ENGINEERING
            // ========================================

            if (
                data.social_engineering &&
                data.social_engineering.length > 0
            ) {

                data.social_engineering.forEach(
                    signal => {

                        const li =
                            document.createElement("li");

                        li.textContent =
                            "✓ Social engineering: " +
                            signal;

                        reasonList.appendChild(li);
                    }
                );
            }


            // ========================================
            // ML ANALYSIS
            // ========================================

            if (data.ml_analysis) {

                const li =
                    document.createElement("li");

                li.textContent =
                    "✓ ML classification: " +
                    data.ml_analysis.classification +
                    " (" +
                    data.ml_analysis.confidence +
                    "%)";

                reasonList.appendChild(li);
            }
        }


        // ========================================
        // URL ANALYSIS
        // ========================================

        showURLAnalysis(data);


        // ========================================
        // RECOMMENDATION
        // ========================================

        let recommendation =
            "No major suspicious patterns were detected.";

        if (data.risk === "DANGEROUS") {

            recommendation =
                "Do not click links, share OTPs, passwords or send money.";

        }
        else if (data.risk === "SUSPICIOUS") {

            recommendation =
                "Verify the sender and information before taking action.";

        }
        else if (data.risk === "UNCERTAIN") {

            recommendation =
                "Be careful and verify the information before trusting it.";
        }

        const recommendationText =
            document.getElementById(
                "recommendationText"
            );

        if (recommendationText) {
            recommendationText.textContent =
                recommendation;
        }


        // ========================================
        // SCROLL TO RESULT
        // ========================================

        if (result) {

            result.scrollIntoView({
                behavior: "smooth"
            });
        }

    }
    catch (error) {

        console.error(error);

        alert(
            "Could not connect to TrustGuard AI backend.\n\n" +
            "Make sure FastAPI is running."
        );
    }
}


// ========================================
// URL ANALYSIS
// ========================================

function showURLAnalysis(data) {

    const section =
        document.getElementById("urlSection");

    const results =
        document.getElementById("urlResults");

    if (!section || !results) {
        return;
    }

    results.innerHTML = "";

    if (
        !data.url_analysis ||
        data.url_analysis.length === 0
    ) {

        section.classList.add("hidden");
        return;
    }

    section.classList.remove("hidden");
    const realtimeStatus =
    document.getElementById("realtimeStatus");

if (realtimeStatus) {

    const hasDangerousURL =
        data.url_analysis.some(
            analysis =>
                (analysis.url_risk_score || 0) >= 70
        );

    const hasSuspiciousURL =
        data.url_analysis.some(
            analysis =>
                (analysis.url_risk_score || 0) >= 40
        );

    if (hasDangerousURL) {

        realtimeStatus.textContent =
            "🔴 Suspicious Link Detected";

        realtimeStatus.style.background =
            "#fef2f2";

        realtimeStatus.style.color =
            "#b91c1c";

    }
    else if (hasSuspiciousURL) {

        realtimeStatus.textContent =
            "🟠 Potentially Unsafe Link";

        realtimeStatus.style.background =
            "#fff7ed";

        realtimeStatus.style.color =
            "#c2410c";
    }
}


    data.url_analysis.forEach(
        analysis => {

            const score =
                analysis.url_risk_score || 0;

            let icon = "🟢";

            if (score >= 70) {
                icon = "🔴";
            }
            else if (score >= 40) {
                icon = "🟠";
            }

            const box =
                document.createElement("div");

            box.style.marginBottom = "15px";

            const indicators =
                analysis.url_indicators || [];

            box.innerHTML =
                "<p><strong>" +
                icon +
                " URL Risk Score: " +
                score +
                "/100</strong></p>" +

                "<br>" +

                "<p><strong>Security indicators:</strong></p>" +

                "<ul>" +

                indicators
                    .map(
                        indicator =>
                            "<li>✓ " +
                            indicator +
                            "</li>"
                    )
                    .join("") +

                "</ul>";

            results.appendChild(box);
        }
    );
}


// ========================================
// DELETE CURRENT RESULT
// ========================================

function deleteResult() {

    const content =
        document.getElementById("content");

    const result =
        document.getElementById("result");

    if (content) {
        content.value = "";
    }

    if (result) {
        result.classList.add("hidden");
    }
}


// ========================================
// DELETE DATA
// ========================================

function deleteData() {

    deleteResult();

    alert(
        "Your scan data has been deleted."
    );
}


// ========================================
// SAVE SCAN RESULT
// ========================================

function saveScanResult(data) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "trustguard_history"
            ) || "[]"
        );

    const now = Date.now();

    const scan = {

        risk: data.risk,

        score: data.risk_score,

        time: new Date().toLocaleString(),

        createdAt: now,

        expiresAt:
            now +
            (24 * 60 * 60 * 1000)
    };

    history.unshift(scan);

    history =
        history.slice(0, 20);

    localStorage.setItem(
        "trustguard_history",
        JSON.stringify(history)
    );
}


// ========================================
// CLEAN EXPIRED HISTORY
// ========================================

function cleanupExpiredHistory() {

    let history =
        JSON.parse(
            localStorage.getItem(
                "trustguard_history"
            ) || "[]"
        );

    const now = Date.now();

    history =
        history.filter(
            scan => {

                if (!scan.expiresAt) {
                    return true;
                }

                return scan.expiresAt > now;
            }
        );

    localStorage.setItem(
        "trustguard_history",
        JSON.stringify(history)
    );

    return history;
}


// ========================================
// SAFETY DASHBOARD
// ========================================

function loadSafetyDashboard() {

    const totalScans =
        document.getElementById("totalScans");

    if (!totalScans) {
        return;
    }

    const dangerousScans =
        document.getElementById("dangerousScans");

    const suspiciousScans =
        document.getElementById("suspiciousScans");

    const safeScans =
        document.getElementById("safeScans");

    const historyContainer =
        document.getElementById("history");

    const history =
    cleanupExpiredHistory();

updateThreatLevel(history);
updateProtectionScore(history);

    let dangerous = 0;
    let suspicious = 0;
    let safe = 0;

    history.forEach(
        scan => {

            if (scan.risk === "DANGEROUS") {
                dangerous++;
            }
            else if (scan.risk === "SUSPICIOUS") {
                suspicious++;
            }
            else {
                safe++;
            }
        }
    );

    totalScans.textContent =
        history.length;

    if (dangerousScans) {
        dangerousScans.textContent =
            dangerous;
    }

    if (suspiciousScans) {
        suspiciousScans.textContent =
            suspicious;
    }

    if (safeScans) {
        safeScans.textContent =
            safe;
    }

    if (!historyContainer) {
        return;
    }

    historyContainer.innerHTML = "";

    if (history.length === 0) {

        historyContainer.innerHTML =
            "<p>No scans yet.</p>";

        return;
    }

    history.forEach(
        scan => {

            let icon = "🟢";

            if (scan.risk === "DANGEROUS") {
                icon = "🔴";
            }
            else if (scan.risk === "SUSPICIOUS") {
                icon = "🟠";
            }

            const item =
                document.createElement("div");

            item.style.padding =
                "15px 0";

            item.style.borderBottom =
                "1px solid #e5e7eb";

            item.innerHTML =
                icon +
                " <strong>" +
                scan.risk +
                "</strong>" +
                " — Risk Score: " +
                scan.score +
                "/100" +
                "<br>" +
                "<small>" +
                scan.time +
                "</small>";

            historyContainer.appendChild(item);
        }
    );
}
// ========================================
// UPDATE THREAT LEVEL
// ========================================

function updateThreatLevel(history) {

    const threatLevel =
        document.getElementById("threatLevel");

    const threatDescription =
        document.getElementById("threatDescription");

    if (!threatLevel || !threatDescription) {
        return;
    }

    const dangerous =
        history.filter(
            scan => scan.risk === "DANGEROUS"
        ).length;

    const suspicious =
        history.filter(
            scan => scan.risk === "SUSPICIOUS"
        ).length;

    if (dangerous > 0) {

        threatLevel.textContent =
            "🔴 HIGH THREAT";

        threatDescription.textContent =
            dangerous +
            " dangerous scan(s) detected recently.";

    }
    else if (suspicious > 0) {

        threatLevel.textContent =
            "🟠 MEDIUM THREAT";

        threatDescription.textContent =
            suspicious +
            " suspicious scan(s) detected recently.";

    }
    else {

        threatLevel.textContent =
            "🟢 LOW THREAT";

        threatDescription.textContent =
            "No recent threats detected.";
    }
}
// ========================================
// UPDATE PROTECTION SCORE
// ========================================

function updateProtectionScore(history) {

    const scoreElement =
        document.getElementById("protectionScore");

    const textElement =
        document.getElementById("protectionScoreText");

    if (!scoreElement || !textElement) {
        return;
    }

    let score = 100;

    history.forEach(function (scan) {

        if (scan.risk === "DANGEROUS") {
            score -= 30;
        }
        else if (scan.risk === "SUSPICIOUS") {
            score -= 15;
        }
    });

    score = Math.max(0, score);

    scoreElement.textContent =
        score + "/100";

    if (score >= 80) {

        textElement.textContent =
            "Excellent protection status.";

    }
    else if (score >= 50) {

        textElement.textContent =
            "Your recent activity needs some attention.";

    }
    else {

        textElement.textContent =
            "High risk detected. Review your recent activity.";
    }
}


// ========================================
// CLEAR HISTORY
// ========================================

function clearHistory() {

    localStorage.removeItem(
        "trustguard_history"
    );

    loadSafetyDashboard();

    alert(
        "Safety history has been cleared."
    );
}


// ========================================
// AUTOMATIC 24-HOUR CLEANUP
// ========================================

cleanupExpiredHistory();

setInterval(
    function () {

        cleanupExpiredHistory();

        loadSafetyDashboard();

    },
    60 * 1000
);


// ========================================
// SCAN TYPE
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const scanType =
    params.get("type");

const scanTitle =
    document.getElementById("scanTitle");

const scanDescription =
    document.getElementById("scanDescription");

const scannerIcon =
    document.getElementById("scannerIcon");


// ========================================
// SCAN TYPE CONFIGURATION
// ========================================

if (scanType === "notification") {

    if (scanTitle) {
        scanTitle.textContent =
            "Check Notification";
    }

    if (scanDescription) {
        scanDescription.textContent =
            "Analyze notifications for scams, fraud and suspicious activity.";
    }

    if (scannerIcon) {
        scannerIcon.textContent = "🔔";
    }
}


if (scanType === "link") {

    if (scanTitle) {
        scanTitle.textContent =
            "Check a Link";
    }

    if (scanDescription) {
        scanDescription.textContent =
            "Analyze a website link for possible phishing or fraud.";
    }

    if (scannerIcon) {
        scannerIcon.textContent = "🔗";
    }
}


if (scanType === "message") {

    if (scanTitle) {
        scanTitle.textContent =
            "Check Message";
    }

    if (scanDescription) {
        scanDescription.textContent =
            "Analyze a message for scams, manipulation and fraud.";
    }

    if (scannerIcon) {
        scannerIcon.textContent = "💬";
    }
}


if (scanType === "news") {

    if (scanTitle) {
        scanTitle.textContent =
            "Verify News";
    }

    if (scanDescription) {
        scanDescription.textContent =
            "Analyze information and claims for possible misinformation.";
    }

    if (scannerIcon) {
        scannerIcon.textContent = "📰";
    }
}


// ========================================
// QUICK DEMO
// ========================================

function loadDemo(type) {

    const content =
        document.getElementById("content");

    if (!content) {
        return;
    }

    if (type === "safe") {

        content.value =
            "Hi, are you coming to class tomorrow?";
    }

    else if (type === "scam") {

        content.value =
            "URGENT! Your bank account has been suspended. Verify your KYC immediately and enter your OTP.";
    }

    else if (type === "link") {

        content.value =
            "URGENT! Verify your bank account immediately using this link: http://192.168.1.50/login";
    }

    content.focus();
}


// ========================================
// APP ACCESS CONTROL
// ========================================

function toggleApp(button, appName) {

    let appAccess =
        JSON.parse(
            localStorage.getItem(
                "trustguard_app_access"
            ) || "{}"
        );

    if (appAccess[appName] === undefined) {

        appAccess[appName] = false;

    }
    else {

        appAccess[appName] =
            !appAccess[appName];
    }

    localStorage.setItem(
        "trustguard_app_access",
        JSON.stringify(appAccess)
    );

    updateAppButton(
        button,
        appAccess[appName]
    );

    updateAppProtectionSummary();
}


// ========================================
// UPDATE APP BUTTON
// ========================================

function updateAppButton(button, allowed) {

    if (!button) {
        return;
    }

    if (allowed) {

        button.textContent =
            "Allow Access";

        button.classList.remove(
            "blocked"
        );

    }
    else {

        button.textContent =
            "Access Blocked";

        button.classList.add(
            "blocked"
        );
    }
}


// ========================================
// UPDATE APP PROTECTION SUMMARY
// ========================================

function updateAppProtectionSummary() {

    const appAccess =
        JSON.parse(
            localStorage.getItem(
                "trustguard_app_access"
            ) || "{}"
        );

    const appNames = [
        "WhatsApp",
        "Instagram",
        "Messages",
        "Chrome"
    ];

    let protectedCount = 0;

    appNames.forEach(
        function (appName) {

            if (appAccess[appName] !== false) {
                protectedCount++;
            }
        }
    );

    const countElement =
        document.getElementById(
            "protectedAppCount"
        );

    const statusElement =
        document.getElementById(
            "appProtectionStatus"
        );

    if (countElement) {

        countElement.textContent =
            protectedCount +
            " Apps Protected";
    }

    if (statusElement) {

        if (protectedCount === 0) {

            statusElement.textContent =
                "No apps are currently protected.";

        }
        else if (
            protectedCount === appNames.length
        ) {

            statusElement.textContent =
                "All selected apps are protected by TrustGuard.";

        }
        else {

            statusElement.textContent =
                protectedCount +
                " of " +
                appNames.length +
                " selected apps are protected.";
        }
    }
}


// ========================================
// LOAD APP ACCESS SETTINGS
// ========================================

function loadAppAccess() {

    const appAccess =
        JSON.parse(
            localStorage.getItem(
                "trustguard_app_access"
            ) || "{}"
        );

    const buttons =
        document.querySelectorAll(
            ".app-toggle"
        );

    buttons.forEach(
        button => {

            const appCard =
                button.closest(
                    ".app-card"
                );

            if (!appCard) {
                return;
            }

            const heading =
                appCard.querySelector(
                    "h3"
                );

            if (!heading) {
                return;
            }

            const appName =
                heading.textContent.trim();

            const allowed =
                appAccess[appName] !== false;

            updateAppButton(
                button,
                allowed
            );
        }
    );

    updateAppProtectionSummary();
}


// ========================================
// PAGE INITIALIZATION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSafetyDashboard();

        loadAppAccess();
    }
);
// ========================================
// AUTOMATIC MESSAGE DETECTION
// ========================================

let autoScanTimer = null;

document.addEventListener("DOMContentLoaded", function () {

    const contentBox =
        document.getElementById("content");

    const realtimeStatus =
        document.getElementById("realtimeStatus");

    if (!contentBox) {
        return;
    }

    contentBox.addEventListener("input", function () {

        clearTimeout(autoScanTimer);

        const text =
            contentBox.value.trim();

        // Waiting for enough text
        if (text.length < 15) {

            if (realtimeStatus) {
                realtimeStatus.textContent =
                    "🛡️ Protected in Real Time";

                realtimeStatus.style.background =
                    "#ecfdf5";

                realtimeStatus.style.color =
                    "#166534";
            }

            return;
        }

        // AI is checking the message
        if (realtimeStatus) {
            realtimeStatus.textContent =
                "🔎 TrustGuard AI is checking...";

            realtimeStatus.style.background =
                "#eff6ff";

            realtimeStatus.style.color =
                "#1d4ed8";
        }

        autoScanTimer = setTimeout(
            function () {

                analyzeContent();

                // Protection restored after analysis
                if (realtimeStatus) {
                    realtimeStatus.textContent =
                        "🛡️ Protected in Real Time";

                    realtimeStatus.style.background =
                        "#ecfdf5";

                    realtimeStatus.style.color =
                        "#166534";
                }

            },
            1500
        );
    });
});