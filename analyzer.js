(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const sample = `SYNTHETIC TEST PATIENT — NOT FOR CLINICAL USE OR BILLING

Visit Type: Established Patient Office Visit

History:
Patient presents for follow-up of type 2 diabetes mellitus and essential hypertension.
HbA1c is 8.2%. Diabetes is above treatment goal.
Blood pressure today is 148/92 mmHg.
Patient also reports persistent right knee pain.

Assessment:
1. Type 2 diabetes mellitus with hyperglycemia.
2. Essential hypertension.
3. Primary osteoarthritis of right knee.

Plan:
Continue medications. Referral to physical therapy placed today.`;

  function analyze(note) {
    const results = [];

    if (/type\s*2 diabetes mellitus with hyperglycemia/i.test(note)) {
      results.push({
        code: "E11.65",
        name: "Type 2 diabetes mellitus with hyperglycemia",
        confidence: 96
      });
    }

    if (/essential hypertension/i.test(note)) {
      results.push({
        code: "I10",
        name: "Essential (primary) hypertension",
        confidence: 96
      });
    }

    if (/primary osteoarthritis of (the )?right knee/i.test(note)) {
      results.push({
        code: "M17.11",
        name: "Unilateral primary osteoarthritis, right knee",
        confidence: 96
      });
    }

    return results;
  }

  function runAnalyzer() {
    try {
      const note = $("note").value.trim();

      if (!note) {
        $("status").textContent =
          "Paste a synthetic note or press LOAD SAMPLE NOTE first.";
        return;
      }

      $("status").textContent = "Analyzing...";

      const results = analyze(note);
      $("results").innerHTML = "";

      results.forEach((result) => {
        const item = document.createElement("div");
        item.className = "code";

        const title = document.createElement("b");
        title.textContent = "ICD-10-CM " + result.code;

        const confidence = document.createElement("span");
        confidence.className = "confidence";
        confidence.textContent = result.confidence + "%";

        const description = document.createElement("div");
        description.textContent = result.name;

        item.appendChild(title);
        item.appendChild(confidence);
        item.appendChild(document.createElement("br"));
        item.appendChild(description);

        $("results").appendChild(item);
      });

      $("count").textContent = results.length;

      $("avg").textContent =
        results.length > 0
          ? Math.round(
              results.reduce((sum, r) => sum + r.confidence, 0) /
                results.length
            ) + "%"
          : "—";

      $("review").textContent = "0";
      $("warnings").textContent =
        /referral to physical therapy/i.test(note) ? "1" : "0";

      $("status").textContent =
        results.length > 0
          ? "Analysis complete — verify suggestions before real-world use."
          : "No supported V1 diagnosis rules matched.";
    } catch (error) {
      console.error(error);
      $("status").textContent =
        "Analyzer error: " + (error.message || "Unknown error");
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("sample").addEventListener("click", () => {
      $("note").value = sample;
      $("status").textContent =
        "Sample loaded. Press ANALYZE NOTE.";
    });

    $("analyze").addEventListener("click", runAnalyzer);

    $("clear").addEventListener("click", () => {
      $("note").value = "";
      $("results").innerHTML = "";
      $("status").textContent = "Ready.";
      $("count").textContent = "0";
      $("avg").textContent = "—";
      $("review").textContent = "0";
      $("warnings").textContent = "0";
    });
  });
})();
