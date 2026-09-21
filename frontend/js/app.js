const API_BASE = "http://127.0.0.1:8001/api";

document.addEventListener("DOMContentLoaded", () => {
    // Navigation
    const navScanner = document.getElementById("nav-scanner");
    const navHistory = document.getElementById("nav-history");
    const viewScanner = document.getElementById("view-scanner");
    const viewHistory = document.getElementById("view-history");

    // Scanner UI
    const scanBtn = document.getElementById("scan-btn");
    const codeInput = document.getElementById("code-input");
    const loadingState = document.getElementById("loading-state");
    const resultsDashboard = document.getElementById("results-dashboard");
    const gateStatus = document.getElementById("gate-status");
    const countSecrets = document.getElementById("count-secrets");
    const secretsTableBody = document.getElementById("secrets-table-body");
    const noVulnMsg = document.getElementById("no-vuln-msg");
    const tableResponsive = document.querySelector("#view-scanner .table-responsive");

    // History UI
    const historyTableBody = document.getElementById("history-table-body");

    // Switch Views
    navScanner.addEventListener("click", (e) => {
        e.preventDefault();
        navScanner.classList.add("active");
        navHistory.classList.remove("active");
        viewScanner.classList.remove("hidden");
        viewHistory.classList.add("hidden");
    });

    navHistory.addEventListener("click", (e) => {
        e.preventDefault();
        navHistory.classList.add("active");
        navScanner.classList.remove("active");
        viewHistory.classList.remove("hidden");
        viewScanner.classList.add("hidden");
        fetchHistory(); // Fetch data when tab opens
    });

    // Scanner Logic
    scanBtn.addEventListener("click", async () => {
        const code = codeInput.value.trim();
        if (!code) {
            alert("Please paste some code to scan.");
            return;
        }

        resultsDashboard.classList.add("hidden");
        loadingState.classList.remove("hidden");
        scanBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/scan-secrets`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code, filename: "test.py" })
            });

            if (!response.ok) throw new Error("API request failed");

            const data = await response.json();
            populateDashboard(data);
            
            loadingState.classList.add("hidden");
            resultsDashboard.classList.remove("hidden");
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
            loadingState.classList.add("hidden");
        } finally {
            scanBtn.disabled = false;
        }
    });

    function populateDashboard(data) {
        if (data.status === "PASSED") {
            gateStatus.innerHTML = `<div class="status-pass-badge"><i class="fa-solid fa-check-circle"></i> COMMIT ALLOWED</div>`;
            gateStatus.className = "status-indicator status-pass";
        } else {
            gateStatus.innerHTML = `<div class="status-fail-badge"><i class="fa-solid fa-ban"></i> COMMIT BLOCKED</div>`;
            gateStatus.className = "status-indicator status-fail";
        }

        countSecrets.textContent = data.total_secrets;
        secretsTableBody.innerHTML = "";

        if (!data.secrets_found || data.secrets_found.length === 0) {
            tableResponsive.classList.add("hidden");
            noVulnMsg.classList.remove("hidden");
        } else {
            tableResponsive.classList.remove("hidden");
            noVulnMsg.classList.add("hidden");

            data.secrets_found.forEach(secret => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td style="font-weight: 600; color: #5E6C84;">Line ${secret.line_number}</td>
                    <td style="font-weight: 600; color: #DE350B;">${secret.type}</td>
                    <td class="pkg-name" style="background-color: #FFEBE6; color: #DE350B;">${secret.match}</td>
                    <td><span class="badge badge-critical">BLOCKED</span></td>
                `;
                secretsTableBody.appendChild(tr);
            });
        }
    }

    // History Logic
    async function fetchHistory() {
        try {
            historyTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Loading records...</td></tr>`;
            
            const response = await fetch(`${API_BASE}/history`);
            if (!response.ok) throw new Error("Failed to fetch history");

            const records = await response.json();
            
            historyTableBody.innerHTML = "";
            if (records.length === 0) {
                historyTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No security incidents recorded.</td></tr>`;
                return;
            }

            records.forEach(record => {
                const tr = document.createElement("tr");
                // Format date string from database
                const dateObj = new Date(record.detected_at);
                const dateStr = dateObj.toLocaleString();
                
                tr.innerHTML = `
                    <td style="color: #5E6C84; font-size: 13px;">${dateStr}</td>
                    <td style="font-weight: 600;">${record.secret_type}</td>
                    <td style="font-family: monospace;">${record.masked_value}</td>
                    <td><span class="badge badge-critical">BLOCKED</span></td>
                `;
                historyTableBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            historyTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Failed to load history. Backend running?</td></tr>`;
        }
    }
});
