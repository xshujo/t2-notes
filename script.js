document.addEventListener("DOMContentLoaded", () => {
    const result = document.querySelector("#section__result");
    const form = document.querySelector("form");
    const copyBtn = document.querySelector("#button__copy");

    // --- Signature Handling via localStorage ---
    const sigField = document.querySelector('input[placeholder*="CTWS"]');
    const savedSig = localStorage.getItem("ctwsSignature");
    if (savedSig) sigField.value = savedSig;

    sigField.addEventListener("input", () => {
        const sig = sigField.value.trim();
        localStorage.setItem("ctwsSignature", sig);
        updateSummary();
    });

    const purchaseSelect = document.getElementById("select__purchase-location");
    const whInput = document.getElementById("input__wh-number");

    function toggleWHInput() {
        const isWH = purchaseSelect.value === "WH#";
        whInput.style.display = isWH ? "block" : "none";
        if (!isWH) whInput.value = "";
    }

    purchaseSelect.addEventListener("change", () => {
        toggleWHInput();
        updateSummary();
    });

    toggleWHInput(); // initial state

    function buildSummary() {
        const uls = Array.from(form.querySelectorAll("ul"));
        const lines = [];

        uls.forEach((ul, ulIndex) => {
            const values = [];

            ul.querySelectorAll("li").forEach(li => {
                // Text inputs
                li.querySelectorAll("input[type='text']").forEach(input => {
                    if (input.value.trim()) {
                        values.push(input.value.trim());
                    }
                });

                // Selects
                li.querySelectorAll("select").forEach(select => {
                    if (!select.value) return;

                    if (select.id === "select__purchase-location") {
                        if (select.value === "WH#") {
                            const wh = whInput.value.trim();
                            if (wh) values.push(`WH#${wh}`);
                        } else {
                            values.push(select.value);
                        }
                    } else {
                        values.push(
                            select.options[select.selectedIndex].text.trim()
                        );
                    }
                });

                // Textareas
                li.querySelectorAll("textarea").forEach(textarea => {
                    if (textarea.value.trim()) {
                        const inline = textarea.value
                            .split("\n")
                            .map(l => l.trim())
                            .filter(Boolean)
                            .join(" - ");
                        values.push(inline);
                    }
                });
            });

            if (!values.length) return;

            // Fourth UL → " / " separator
            const slashSeparated = [0, 1, 3].includes(ulIndex);

const line = slashSeparated
    ? values.join(" / ")
    : values.join(" ");
            lines.push(line);
        });

        return lines.join("\n");
    }

    function updateSummary() {
        result.querySelector("pre")?.remove();
        const pre = document.createElement("pre");
        const summary = buildSummary().trim();

        pre.textContent = summary || "Private notes will appear here...";
        result.insertBefore(pre, copyBtn);
    }

    form.addEventListener("input", updateSummary);
    form.addEventListener("change", updateSummary);
    updateSummary();

    // --- Copy button ---
    copyBtn.addEventListener("click", async () => {
        const text = buildSummary();
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = "Copied!";
            setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
        } catch {
            copyBtn.textContent = "Failed";
            setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
        }
    });

    // --- Clear button ---
    document.getElementById("button__clear").addEventListener("click", () => {
        const confirmClear = confirm(
            "Are you sure you want to clear all fields?"
        );
        if (confirmClear) location.reload();
    });

    // --- Optional: Prevent unwanted reloads (commented for now) ---
    function preventUnwantedReload() {
        window.addEventListener("beforeunload", e => {
            e.preventDefault();
            e.returnValue = "";
            return "";
        });
    }
    preventUnwantedReload();
});
