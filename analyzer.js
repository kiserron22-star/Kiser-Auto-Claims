(() => {
  "use strict";

  // KISER AUTO CLAIM
  // V2 TEST ANALYZER
  // SYNTHETIC / TEST DATA ONLY

  const $ = (id) => document.getElementById(id);

  const sample = `SYNTHETIC TEST PATIENT — NOT A REAL PERSON

Visit Type: Established Patient Office Visit

History:
Patient presents for follow-up of type 2 diabetes mellitus
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

  const API_URL =
    "https://kiser-auto-claims-api.onrender.com";

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
        description
