"use strict";

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic status check
app.get("/", (req, res) => {
  res.json({
    service: "Kiser Auto Claim API",
    status: "online",
    mode: "synthetic-test-only"
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// TEST analyzer endpoint.
// Uses synthetic/test notes only for now.
app.post("/api/analyze", (req, res) => {
  try {
    const note = String(req.body?.note || "").trim();

    if (!note) {
      return res.status(400).json({
        error: "A note is required."
      });
    }

    const results = [];
    const lower = note.toLowerCase();

    if (
      lower.includes("type 2 diabetes") &&
      lower.includes("hyperglycemia")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "E11.65",
        description: "Type 2 diabetes mellitus with hyperglycemia",
        confidence: 0.96
      });
    }

    if (
      lower.includes("essential hypertension") ||
      lower.includes("essential (primary) hypertension")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "I10",
        description: "Essential (primary) hypertension",
        confidence: 0.96
      });
    }

    if (
      lower.includes("osteoarthritis") &&
      lower.includes("right knee")
    ) {
      results.push({
        system: "ICD-10-CM",
        code: "M17.11",
        description: "Unilateral primary osteoarthritis, right knee",
        confidence: 0.96
      });
    }

    res.json({
      success: true,
      mode: "synthetic-test-only",
      suggestions: results,
      warning:
        "Prototype output. Codes and confidence values must not be used for real patient billing."
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Analyzer error."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Kiser Auto Claim API running on port ${PORT}`);
});
