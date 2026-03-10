# Triage Corpus

Updated: 2026-03-10

## Purpose

Provide a deterministic, sanitized regression corpus for `forensic.basicPreTriage` and `forensic.basicTriage`.

## Corpus policy

- Fixtures are synthetic or heavily sanitized.
- No live malware, private keys, or real victim data are committed.
- Indicators use placeholder or documentation-safe values unless the format itself is under test.
- Binary fixtures are hand-built minimal samples used to exercise parser paths, not production payloads.

## Current corpus

1. `benign_text`
   - Purpose: baseline text-only path with low-risk IOC density.
   - Coverage: benign verdict, text parsing, no binary trust path.
2. `suspicious_text`
   - Purpose: deterministic suspicious verdict via IOC + CVE mix.
   - Coverage: score threshold behavior, findings, recommendations.
3. `safe_zip_archive`
   - Purpose: validate archive inventory and local safety guards.
   - Coverage: ZIP manifest, guard enforcement, mocked capability removal for local archive safety.
4. `signed_pe`
   - Purpose: validate embedded certificate parsing.
   - Coverage: PE trust summary, signed finding, mocked capability removal for trust verification.

## Redaction and provenance

- Text samples are authored directly in tests and contain no real case data.
- ZIP and PE fixtures are constructed programmatically in test fixtures for deterministic structure.
- The embedded X.509 certificate used for trust-path coverage is a disposable self-signed test certificate generated only for parser validation.

## Maintenance rules

- Any triage behavior change must update the corpus expectations in the same PR.
- New fixtures should prefer synthetic construction over storing opaque binaries.
- If a fixture exercises a new report section, add the expectation to the corpus test before merging behavior changes.
