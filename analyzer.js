(() => {
  "use strict";

  // ============================================================
  // KISER AUTO CLAIM
  // V2 TEST ANALYZER
  // SYNTHETIC / TEST DATA ONLY
  // ============================================================

  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------
  // SYNTHETIC TEST DOCTOR NOTE
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // LOCAL TEST CODING ENGINE
  // ------------------------------------------------------------

  function analyzeLocally(note) {
    const text = note.toLowerCase();
    const results = [];

    // Type 2 diabetes with hyperglycemia
    if (
      text.includes("type 2 diabetes") &&
      text.includes("hyperglycemia")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "E11.65",
        description:
          "Type 2 diabetes mellitus with hyperglycemia",
        confidence: 96
      });
    }

    // Essential hypertension
    if (
      text.includes("essential hypertension") ||
      text.includes("primary hypertension")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "I10",
        description:
          "Essential (primary) hypertension",
        confidence: 95
      });
    }

    // Primary osteoarthritis — right knee
    if (
      text.includes("osteoarthritis") &&
      text.includes("right knee")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "M17.11",
        description:
          "Unilateral primary osteoarthritis, right knee",
        confidence: 94
      });
    }

    return results;
  }

  // ------------------------------------------------------------
  // DISPLAY RESULTS
  // ------------------------------------------------------------

  function showResults(results) {
    const resultsBox = $("results");

    if (!resultsBox) {
      console.error(
        'Kiser Auto Claim: Could not find element with id="results".'
      );
      return;
    }

    if (results.length === 0) {
      resultsBox.innerHTML = `
        <div class="result">
          <strong>MANUAL REVIEW REQUIRED</strong><br>
          No supported test codes were detected.
        </div>
      `;
      return;
    }

    resultsBox.innerHTML = results
      .map(
        (item) => `
          <div class="result">
            <strong>${item.code}</strong><br>
            ${item.description}<br>
            <small>
              ${item.system} — Confidence: ${item.confidence}%
            </small>
          </div>
        `
      )
      .join("");
  }

  // ------------------------------------------------------------
  // UPDATE DASHBOARD SUMMARY
  // ------------------------------------------------------------

  function updateSummary(results) {
    const average =
      results.length > 0
        ? Math.round(
            results.reduce(
              (sum, item) => sum + item.confidence,
              0
            ) / results.length
          )
        : 0;

    const reviewCount = results.filter
