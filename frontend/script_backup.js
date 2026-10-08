// ========================================
// TrustGuard AI
// Frontend JavaScript
// ========================================


// ----------------------------------------
// Open Scanner
// ----------------------------------------

function openScanner(type) {

    window.location.href =
        "scan.html?type=" + type;
}


// ----------------------------------------
// Analyze Content
// ----------------------------------------

async function analyzeContent() {

    const contentBox =
        document.getElementById("content");

    const text =
        contentBox.value.trim();


    if (!text) {

        alert(
            "Please enter some content first."
        );

        return;
    }


    try {

        const response =
            await fetch(
                "http://127.0.0.1:8000/analyze",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Backend server error"
            );
        }


        const data =
            await response.json();


        // Save scan to dashboard

        saveScanResult(data);


        // Show result

        document
            .getElementById("result")
            .classList.remove("hidden");


        // --------------------------------
        // Risk Icon
        // --------------------------------

        let icon = "🟢";


        if (data.risk === "DANGEROUS") {

            icon = "🔴";

        }
        else if (
            data.risk === "SUSPICIOUS"
        ) {

            icon = "🟠";

        }
        else if (
            data.risk === "UNCERTAIN"
        ) {

            icon = "🟡";
        }


        document
            .getElementById("riskIcon")
            .textContent = icon;


        // --------------------------------
        // Risk Title
        // --------------------------------

        document
            .getElementById("riskTitle")
            .textContent =
                data.risk;


        // --------------------------------
        // Risk Score
        // --------------------------------

        document
            .getElementById("riskScore")
            .textContent =
                data.risk_score + "/100";


        // --------------------------------
        // Detection Reasons
        // --------------------------------

        const reasonList =
            document.getElementById(
                "reasonList"
            );


        reasonList.innerHTML = "";


        if (
            data.detected_patterns &&
            data.detected_patterns.length > 0
        ) {

            data.detected_patterns.forEach(
                pattern => {

                    const li =
                        document.createElement(
                            "li"
                        );

                    li.textContent =
                        "✓ " + pattern;

                    reasonList.appendChild(
                        li
                    );
                }
            );

        }
        else {

            const li =
                document.createElement(
                    "li"
                );

            li.textContent =
                "No suspicious patterns detected";

            reasonList.appendChild(li);
        }


        // --------------------------------
        // Social Engineering
        // --------------------------------

        if (
            data.social_engineering &&
            data.social_engineering.length > 0
        ) {

            data.social_engineering.forEach(
                signal => {

                    const li =
                        document.createElement(
                            "li"
                        );

                    li.textContent =
                        "✓ Social engineering: " +
                        signal;

                    reasonList.appendChild(
                        li
                    );
                }
            );
        }


        // --------------------------------
        // ML Analysis
        // --------------------------------

        if (data.ml_analysis) {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =
                "✓ ML classification: " +
                data.ml_analysis.classification +
                " (" +
                data.ml_analysis.confidence +
                "%)";


            reasonList.appendChild(li);
        }


        // --------------------------------
        // URL Analysis
        // --------------------------------

        showURLAnalysis(
            data
        );


        // --------------------------------
        // Recommendation
        // --------------------------------

        let recommendation =
            "No major suspicious patterns were detected.";


        if (
            data.risk === "DANGEROUS"
        ) {

            recommendation =
                "Do not click links, share OTPs, passwords or send money.";

        }
        else if (
            data.risk === "SUSPICIOUS"
        ) {

            recommendation =
                "Verify the sender and information before taking action.";

        }
        else if (
            data.risk === "UNCERTAIN"
        ) {

            recommendation =
                "Be careful and verify the information before trusting it.";
        }


        document
            .getElementById(
                "recommendationText"
            )
            .textContent =
                recommendation;


        // Scroll to result

        document
            .getElementById("result")
            .scrollIntoView({
                behavior: "smooth"
            });

    }


    catch (error) {

        console.error(error);


        alert(
            "Could not connect to TrustGuard AI backend.\n\n" +
            "Make sure FastAPI is running."
        );
    }
}


// ----------------------------------------
// URL Analysis Display
// ----------------------------------------

function showURLAnalysis(data) {

    const section =
        document.getElementById(
            "urlSection"
        );

    const results =
        document.getElementById(
            "urlResults"
        );


    if (
        !section ||
        !results
    ) {

        return;
    }


    results.innerHTML = "";


    if (
        !data.url_analysis ||
        data.url_analysis.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        return;
    }


    section.classList.remove(
        "hidden"
    );


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
                document.createElement(
                    "div"
                );


            box.style.marginBottom =
                "15px";


            box.innerHTML =

                "<p><strong>" +
                icon +
                " URL Risk Score: " +
                score +
                "/100</strong></p>" +


                "<br>" +


                "<p><strong>Security indicators:</strong></p>" +


                "<ul>" +
                (
                    analysis.url_indicators || []
                )
                .map(
                    indicator =>
                        "<li>✓ " +
                        indicator +
                        "</li>"
                )
                .join("") +
                "</ul>";


            results.appendChild(
                box
            );

        }
    );
}


// ----------------------------------------
// Delete Result
// ----------------------------------------

function deleteResult() {

    const content =
        document.getElementById(
            "content"
        );


    const result =
        document.getElementById(
            "result"
        );


    if (content) {

        content.value = "";
    }


    if (result) {

        result.classList.add(
            "hidden"
        );
    }
}


// ----------------------------------------
// Home Page Delete
// ----------------------------------------

function deleteData() {

    deleteResult();

    alert(
        "Your scan data has been deleted."
    );
}


// ----------------------------------------
// Save Scan Result
// ----------------------------------------

function saveScanResult(data) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "trustguard_history"
            )
        ) || [];


    const scan = {

        risk: data.risk,

        score: data.risk_score,

        time:
            new Date().toLocaleString()

    };


    history.unshift(scan);


    history =
        history.slice(0, 20);


    localStorage.setItem(
        "trustguard_history",
        JSON.stringify(history)
    );
}


// ----------------------------------------
// Safety Dashboard
// ----------------------------------------

function loadSafetyDashboard() {

    const totalScans =
        document.getElementById(
            "totalScans"
        );


    if (!totalScans) {

        return;
    }


    const dangerousScans =
        document.getElementById(
            "dangerousScans"
        );


    const suspiciousScans =
        document.getElementById(
            "suspiciousScans"
        );


    const safeScans =
        document.getElementById(
            "safeScans"
        );


    const historyContainer =
        document.getElementById(
            "history"
        );


    const history =
        JSON.parse(
            localStorage.getItem(
                "trustguard_history"
            )
        ) || [];


    let dangerous = 0;

    let suspicious = 0;

    let safe = 0;


    history.forEach(
        scan => {

            if (
                scan.risk === "DANGEROUS"
            ) {

                dangerous++;

            }
            else if (
                scan.risk === "SUSPICIOUS"
            ) {

                suspicious++;

            }
            else {

                safe++;
            }

        }
    );


    totalScans.textContent =
        history.length;


    dangerousScans.textContent =
        dangerous;


    suspiciousScans.textContent =
        suspicious;


    safeScans.textContent =
        safe;


    historyContainer.innerHTML = "";


    if (history.length === 0) {

        historyContainer.innerHTML =
            "<p>No scans yet.</p>";

        return;
    }


    history.forEach(
        scan => {

            let icon = "🟢";


            if (
                scan.risk === "DANGEROUS"
            ) {

                icon = "🔴";

            }
            else if (
                scan.risk === "SUSPICIOUS"
            ) {

                icon = "🟠";
            }


            const item =
                document.createElement(
                    "div"
                );


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


            historyContainer.appendChild(
                item
            );

        }
    );
}


// ----------------------------------------
// Clear History
// ----------------------------------------

function clearHistory() {

    localStorage.removeItem(
        "trustguard_history"
    );


    loadSafetyDashboard();


    alert(
        "Safety history has been cleared."
    );
}


// ----------------------------------------
// Scan Type
// ----------------------------------------

const params =
    new URLSearchParams(
        window.location.search
    );


const scanType =
    params.get("type");


const scanTitle =
    document.getElementById(
        "scanTitle"
    );


const scanDescription =
    document.getElementById(
        "scanDescription"
    );


const scannerIcon =
    document.getElementById(
        "scannerIcon"
    );


// Notification

if (
    scanType === "notification"
) {

    if (scanTitle) {

        scanTitle.textContent =
            "Check Notification";
    }


    if (scanDescription) {

        scanDescription.textContent =
            "Analyze notifications for scams, fraud and suspicious activity.";
    }


    if (scannerIcon) {

        scannerIcon.textContent =
            "🔔";
    }
}


// Link

if (
    scanType === "link"
) {

    if (scanTitle) {

        scanTitle.textContent =
            "Check a Link";
    }


    if (scanDescription) {

        scanDescription.textContent =
            "Analyze a website link for possible phishing or fraud.";
    }


    if (scannerIcon) {

        scannerIcon.textContent =
            "🔗";
    }
}


// Message

if (
    scanType === "message"
) {

    if (scanTitle) {

        scanTitle.textContent =
            "Check Message";
    }


    if (scanDescription) {

        scanDescription.textContent =
            "Analyze a message for scams, manipulation and fraud.";
    }


    if (scannerIcon) {

        scannerIcon.textContent =
            "💬";
    }
}


// News

if (
    scanType === "news"
) {

    if (scanTitle) {

        scanTitle.textContent =
            "Verify News";
    }


    if (scanDescription) {

        scanDescription.textContent =
            "Analyze information and claims for possible misinformation.";
    }


    if (scannerIcon) {

        scannerIcon.textContent =
            "📰";
    }
}


// ----------------------------------------
// Load Dashboard
// ----------------------------------------

loadSafetyDashboard();
// ==============================
// QUICK DEMO EXAMPLES
// ==============================

function loadDemo(type) {

    const content = document.getElementById("content");

    if (!content) {
        return;
    }

    if (type === "safe") {

        content.value =
            "Hi, are you coming to class tomorrow?";

    } else if (type === "scam") {

        content.value =
            "URGENT! Your bank account has been suspended. Verify your KYC immediately and enter your OTP.";

    } else if (type === "link") {

        content.value =
            "URGENT! Verify your bank account immediately using this link: http://192.168.1.50/login";

    }

    content.focus();
}