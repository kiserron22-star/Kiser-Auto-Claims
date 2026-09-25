
(() => {
  "use strict";

  // KISER AUTO CLAIM
  // V2 TEST ANALYZER
  // SYNTHETIC / TEST DATA ONLY

  const $ = (id) => document.getElementById(id);

  const sample = `SYNTHETIC TEST PATIENT — NOT A REAL PATIENT

Visit Type: Established Patient Office Visit

History:
Patient presents for follow-up of type 2 diabetes
and essential hypertension.
HbA1c is 8.2%. Diabetes is above treatment goal.
Blood pressure today is 148/92 mmHg.
Patient also reports persistent right knee pain.

Assessment:
1. Type 2 diabetes mellitus with hyperglycemia.
2. Essential hypertension.
3. Primary osteoarthritis of right knee.

Plan:
Continue medications.
Referral to physical therapy for right knee pain.`;

  function analyzeLocally(note) {
    const text = note.toLowerCase();
    const results = [];

    if (
      text.includes("type 2 diabetes") &&
      text.includes("hyperglycemia")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "E11.65",
        description: "Type 2 diabetes mellitus with hyperglycemia",
        confidence: 96
      });
    }

    if (
      text.includes("essential hypertension") ||
      text.includes("hypertension")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "I10",
        description: "Essential (primary) hypertension",
        confidence: 95
      });
    }

    if (
      text.includes("osteoarthritis") &&
      text.includes("right knee")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "M17.11",
        description: "Unilateral primary osteoarthritis, right knee",
        confidence: 94
      });
    }

    return results;
  }

  function showResults(results) {
    const resultsBox = $("results");

    if (!resultsBox) return;

    if (results.length === 0) {
      resultsBox.innerHTML =
        "<p>No suggested codes found. Manual review required.</p>";
      return;
    }

    resultsBox.innerHTML = results
      .map(
        (item) => `
          <div class="result">
            <strong>${item.code}</strong><br>
            ${item.description}<br>
            <small>${item.system} — Confidence: ${item.confidence}%</small>
          </div>
        `
      )
      .join("");
  }

  function updateSummary(results) {
    const avg =
      results.length > 0
        ? Math.round(
            results.reduce((sum, item) => sum + item.confidence, 0) /
              results.length
          )
        : 0;

    const reviewCount = results.filter(
      (item) => item.confidence < 90
    ).length;
    if ($("count")) $("count").textContent = results.length;
    if ($("avg")) $("avg").textContent = avg + "%";
    if ($("review")) $("review").textContent = reviewCount;
    if ($("warnings")) $("warnings").textContent = "0";
  }

  function loadSample() {
    const noteBox = $("note");

    if (!noteBox) {
      alert("Could not find the Clinical Note box.");
      return;
    }

    noteBox.value = sample;

    if ($("status")) {
      $("status").textContent =
        "Sample note loaded. Press ANALYZE NOTE.";
    }
  }

  function clearAll() {
    if ($("note")) $("note").value = "";
    if ($("results")) $("results").innerHTML = "";
    if ($("status")) $("status").textContent = "Ready.";

    updateSummary([]);
  }

  function runAnalyzer() {
    const noteBox = $("note");

    if (!noteBox || !noteBox.value.trim()) {
      if ($("status")) {
        $("status").textContent = "Load or enter a note first.";
      }
      return;
    }

    if ($("status")) {
      $("status").textContent = "Analyzing synthetic test note...";
    }

    const results = analyzeLocally(noteBox.value);

    showResults(results);
    updateSummary(results);

    if ($("status")) {
      $("status").textContent =
        "Analysis complete — TEST DATA ONLY.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const sampleButton = $("sample");
    const clearButton = $("clear");
    const analyzeButton = $("analyze");

    if (sampleButton) {
      sampleButton.addEventListener("click", loadSample);
    }

    if (clearButton) {
      clearButton.addEventListener("click", clearAll);
    }

    if (analyzeButton) {
      analyzeButton.addEventListener("click", runAnalyzer);
    }

    if ($("status")) {
      $("status").textContent = "Ready.";
    }
  });
})();
