const API_BASE = "http://127.0.0.1:8001/api";

document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scan-btn");
    const codeInput = document.getElementById("code-input");
    
    const loadingState = document.getElementById("loading-state");
    const resultsDashboard = document.getElementById("results-dashboard");
    
    // Stats
    const gateStatus = document.getElementById("gate-status");
    const countSecrets = document.getElementById("count-secrets");
    
    // Table
    const secretsTableBody = document.getElementById("secrets-table-body");
    const noVulnMsg = document.getElementById("no-vuln-msg");
    const tableResponsive = document.querySelector(".table-responsive");

    scanBtn.addEventListener("click", async () => {
        const code = codeInput.value.trim();
        if (!code) {
            alert("Please paste some code to scan.");
            return;
        }

        // UI Reset
        resultsDashboard.classList.add("hidden");
        loadingState.classList.remove("hidden");
        scanBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE}/scan-secrets`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ code: code, filename: "test.py" })
            });

            if (!response.ok) {
                throw new Error("API request failed: " + response.statusText);
            }

            const data = await response.json();
            
            // Populate data
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
        // Status Gate
        if (data.status === "PASSED") {
            gateStatus.innerHTML = `<div class="status-pass-badge"><i class="fa-solid fa-check-circle"></i> COMMIT ALLOWED</div>`;
            gateStatus.className = "status-indicator status-pass";
        } else {
            gateStatus.innerHTML = `<div class="status-fail-badge"><i class="fa-solid fa-ban"></i> COMMIT BLOCKED</div>`;
            gateStatus.className = "status-indicator status-fail";
        }

        // Counts
        countSecrets.textContent = data.total_secrets;

        // Table
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
});
