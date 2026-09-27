(() => {
  "use strict";

  const API_BASE_URL = "https://kiser-auto-claims-api.onrender.com";
  const ANALYZE_API_URL = `${API_BASE_URL}/api/analyze`;

  // ==========================================
  // KISER HEALTH REVENUE

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

  // ============================================================
  // TEST RULES
  // ============================================================

  const codingRules = [
    {
      system: "ICD-10-CM",
      code: "E11.65",
      description: "Type 2 diabetes mellitus with hyperglycemia",
      required: ["type 2 diabetes", "hyperglycemia"]
    },
    {
      system: "ICD-10-CM",
      code: "I10",
      description: "Essential (primary) hypertension",
      any: [
        "essential hypertension",
        "primary hypertension"
      ]
    },
    {
      system: "ICD-10-CM",
      code: "M17.11",
      description:
        "Unilateral primary osteoarthritis, right knee",
      required: ["osteoarthritis", "right knee"]
    },
    {
      system: "ICD-10-CM",
      code: "J45.909",
      description:
        "Unspecified asthma, uncomplicated",
      any: ["asthma"]
    },
    {
      system: "ICD-10-CM",
      code: "E78.5",
      description:
        "Hyperlipidemia, unspecified",
      any: [
        "hyperlipidemia",
        "high cholesterol"
      ]
    },
    {
      system: "ICD-10-CM",
      code: "K21.9",
      description:
        "Gastro-esophageal reflux disease without esophagitis",
      any: [
        "gastroesophageal reflux disease",
        "gerd"
      ]
    },{
  system: "ICD-10-CM",
  code: "M54.50",
  description: "Low back pain, unspecified",
  any: [
    "low back pain",
    "lower back pain",
    "lumbar pain"
  ]
  }
  ];

  // ============================================================
  // FIND SUPPORTING TEXT
  // 

  function findEvidence(note, phrases) {
  const lines = note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const negativeWords = [
    "denies",
    "denied",
    "no evidence of",
    "no history of",
    "negative for",
    "without",
    "ruled out",
    "rule out"
  ];

  const matches = lines.filter((line) => {
    const lower = line.toLowerCase();

    const hasPhrase = phrases.some((phrase) =>
      lower.includes(phrase.toLowerCase())
    );

    if (!hasPhrase) return false;

    const isNegative = negativeWords.some((word) =>
      lower.includes(word)
    );

    return !isNegative;
  });

  return matches.slice(0, 3);
  }

  // ============================================================
  // TEST CODING ENGINE
  // ============================================================

  function analyzeLocally(note) {
    const text = note.toLowerCase();

    const results = [];

    codingRules.forEach((rule) => {
      let matched = false;
      let phrases = [];

      if (rule.required) {
        matched = rule.required.every((phrase) =>
          text.includes(phrase)
        );

        phrases = rule.required;
      }

      if (rule.any) {
        const found = rule.any.filter((phrase) =>
          text.includes(phrase)
        );

        matched = found.length > 0;
        phrases = found;
      }

      if (!matched) return;

      const evidence = findEvidence(
        note,
        phrases
      );
if (evidence.length === 0) return;
      results.push({
        system: rule.system,
        code: rule.code,
        description: rule.description,

        // TEST SCORE ONLY.
        // This is NOT a validated probability.
        confidence: 95,

        evidence:
          evidence.length > 0
            ? evidence
            : ["Matching documentation detected."],

        reviewRequired: false
      });
    });

    return results;
  }

  // ============================================================
  // DISPLAY RESULTS
  // ============================================================

  function showResults(results) {
    const resultsBox = $("results");

    if (!resultsBox) return;

    if (results.length === 0) {
      resultsBox.innerHTML = `
        <div class="result">
          <strong>MANUAL REVIEW REQUIRED</strong><br><br>

          No supported test rule matched this documentation.

          <br><br>

          <small>
            Kiser Health Revenue did not guess a code.
          </small>
        </div>
      `;

      return;
    }

    resultsBox.innerHTML = results
      .map((item) => {

        const evidenceHTML = item.evidence
          .map(
            (line) =>
              `<li>${escapeHTML(line)}</li>`
          )
          .join("");

        return `
          <div class="result">

            <strong>
              ${escapeHTML(item.code)}
            </strong>

            <br>

            ${escapeHTML(item.description)}

            <br><br>

            <small>
              ${escapeHTML(item.system)}
              — Test Match Score:
              ${item.confidence}%
            </small>

            <br><br>

            <strong>
              Documentation Evidence
            </strong>

            <ul>
              ${evidenceHTML}
            </ul>

            <small>
              Review Status:
              ${
                item.reviewRequired
                  ? "REVIEW REQUIRED"
                  : "TEST RULE MATCHED"
              }
            </small>

          </div>
        `;
      })
      .join("");
  }

  // ============================================================
  // BASIC HTML PROTECTION
  // ============================================================

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ============================================================
  // DASHBOARD SUMMARY
  // ============================================================

  function updateSummary(results) {
    const average =
      results.length > 0
        ? Math.round(
            results.reduce(
              (sum, item) =>
                sum + item.confidence,
              0
            ) / results.length
          )
        : 0;

    const reviewCount =
      results.filter(
        (item) => item.reviewRequired
      ).length;

    if ($("count")) {
      $("count").textContent =
        results.length;
    }

    if ($("avg")) {
      $("avg").textContent =
        average + "%";
    }

    if ($("review")) {
      $("review").textContent =
        reviewCount;
    }

    if ($("warnings")) {
      $("warnings").textContent =
        results.length === 0 ? "1" : "0";
    }
  }

  // ============================================================
  // LOAD SAMPLE
  // ============================================================

  function loadSample() {
    const noteBox = $("note");

    if (!noteBox) {
      alert(
        "Could not find the Clinical Note box."
      );
      return;
    }

    noteBox.value = sample;
    noteBox.focus();

    if ($("status")) {
      $("status").textContent =
        "Sample loaded. Press ANALYZE NOTE.";
    }
  }

  // ============================================================
  // CLEAR
  // ============================================================

  function clearAll() {
    if ($("note")) {
      $("note").value = "";
    }

    if ($("results")) {
      $("results").innerHTML = "";
    }

    updateSummary([]);

    if ($("warnings")) {
      $("warnings").textContent = "0";
    }

    if ($("status")) {
      $("status").textContent =
        "Ready.";
    }
  }

  // ============================================================
  // ANALYZE
  // ============================================================

  function runAnalyzer() {
    const noteBox = $("note");

    if (
      !noteBox ||
      !noteBox.value.trim()
    ) {
      if ($("status")) {
        $("status").textContent =
          "Load or enter a synthetic note first.";
      }

      return;
    }

    if ($("status")) {
      $("status").textContent =
        "Analyzing synthetic test note...";
    }

    try {
      const results =
        analyzeLocally(
          noteBox.value
        );

      showResults(results);
      updateSummary(results);

      if ($("status")) {
        $("status").textContent =
          results.length > 0
            ? `Analysis complete — ${results.length} test code(s) suggested.`
            : "No supported code found — review required.";
      }

    } catch (error) {

      console.error(
        "Kiser Health Revenue error:",
        error
      );

      if ($("status")) {
        $("status").textContent =
          "Analyzer error.";
      }
    }
  }

  // ============================================================
  // START APPLICATION
  // ============================================================

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      const sampleButton =
        $("sample");

      const clearButton =
        $("clear");

      const analyzeButton =
        $("analyze");

      if (sampleButton) {
        sampleButton.addEventListener(
          "click",
          loadSample
        );
      }

      if (clearButton) {
        clearButton.addEventListener(
          "click",
          clearAll
        );
      }

      if (analyzeButton) {
        analyzeButton.addEventListener(
          "click",
          runAnalyzer
        );
      }

      updateSummary([]);

      if ($("warnings")) {
        $("warnings").textContent = "0";
      }

      if ($("status")) {
        $("status").textContent =
          "Ready.";
      }

      console.log(
        "Kiser Health Revenue V5 loaded."
      );
    }
  );

})();
