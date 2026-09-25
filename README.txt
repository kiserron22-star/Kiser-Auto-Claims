KISER AUTO CLAIM — REAL V1 TEST BUILD

This package is a working browser prototype for SYNTHETIC TEST DATA ONLY.

Run it on a computer:
1. Extract the ZIP.
2. Open Terminal / Command Prompt in this folder.
3. Run: python -m http.server 8080
4. Open: http://localhost:8080
5. Click LOAD SAMPLE NOTE, then ANALYZE NOTE.

For phone testing, this folder should be deployed to a normal HTTPS web host. Opening local HTML files on mobile is unreliable.

Current V1:
- Detects three controlled ICD-10-CM test diagnoses.
- Shows supporting note text and confidence.
- Adds guardrails/warnings.
- Does NOT submit claims.
- Does NOT assign CPT E/M levels.
- Is NOT approved for PHI or production medical billing.
