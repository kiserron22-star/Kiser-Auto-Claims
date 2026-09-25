"use strict";

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ============================================================
// KISER AUTO CLAIM
// V3 BACKEND API
// SYNTHETIC / TEST DATA ONLY
// NOT FOR REAL PATIENT BILLING
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
      "essential (primary) hypertension",
      "primary hypertension"
    ]
  },

  {
    system: "ICD-10-CM",
    code: "M17.11",
    description: "Unilateral primary osteoarthritis, right knee",
    required: [
      "osteoarthritis",
      "right knee"
    ]
  },

  {
    system: "ICD-10-CM",
    code: "J45.909",
    description: "Unspecified asthma, uncomplicated",
    any: ["asthma"]
  },

  {
    system: "ICD-10-CM",
    code: "E78.5",
    description: "Hyperlipidemia, unspecified",
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
  }
];

// ============================================================
// FIND DOCUMENTATION EVIDENCE
// ============================================================

function findEvidence(note, phrases) {
  const lines = note
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines
    .filter((line) => {
      const lowerLine = line.toLowerCase();

      return phrases.some((phrase) =>
        lowerLine.includes(phrase.toLowerCase())
      );
    })
    .slice(0, 3);
}

// ============================================================
// SYNTHETIC TEST CODING ENGINE
// ============================================================

function analyzeNote(note) {
  const text = note.toLowerCase();

  const suggestions = [];

  codingRules.forEach((rule) => {
    let matched = false;
    let matchedPhrases = [];

    if (rule.required) {
      matched = rule.required.every((phrase) =>
        text.includes(phrase)
      );

      if (matched) {
        matchedPhrases = rule.required;
      }
    }

    if (rule.any) {
      matchedPhrases = rule.any.filter((phrase) =>
        text.includes(phrase)
      );

      matched = matchedPhrases.length > 0;
    }

    if (!matched) {
      return;
    }

    const evidence = findEvidence(
      note,
      matchedPhrases
    );

    suggestions.push({
      system: rule.system,
      code: rule.code,
      description: rule.description,

      // Prototype test score only.
      // NOT a clinically validated probability.
      testMatchScore: 95,

      evidence:
        evidence.length > 0
          ? evidence
          : ["Matching test documentation detected."],

      reviewRequired: false
    });
  });

  return suggestions;
}

// ============================================================
// STATUS ENDPOINTS
// ============================================================

app.get("/", (req, res) => {
  res.json({
    service: "Kiser Auto Claim API",
    version: "V3",
    status: "online",
    mode: "synthetic-test-only"
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "Kiser Auto Claim API",
    version: "V3"
  });
});

// ============================================================
// ANALYZE ENDPOINT
// ============================================================

app.post("/api/analyze", (req, res) => {
  try {
    const note = String(
      req.body?.note || ""
    ).trim();

    if (!note) {
      return res.status(400).json({
        success: false,
        error: "A synthetic test note is required."
      });
    }

    const suggestions = analyzeNote(note);

    const needsReview =
      suggestions.length === 0;

    return res.json({
      success: true,

      mode: "synthetic-test-only",

      suggestions,

      summary: {
        suggestedCodes: suggestions.length,
        needsReview: needsReview ? 1 : 0,
        warnings: needsReview ? 1 : 0
      },

      warning:
        "Prototype test output only. Do not use this system for real patient coding, billing, diagnosis, treatment, or insurance claim submission."
    });

  } catch (error) {

    console.error(
      "Kiser Auto Claim analyzer error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Analyzer error."
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Kiser Auto Claim V3 API running on port ${PORT}`
    );
  }
);
