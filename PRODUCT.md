# PRODUCT.md — In-Place BaseGrade Project Savings Estimator

## What it is
A public, single-file (index.html) road-construction savings calculator comparing a
liquid soil-stabilization treatment ("In-Place") against conventional aggregate
base/excavation methods, using AASHTO 1993 structural design + FHWA-style
life-cycle cost analysis. Live via GitHub Pages; every merge to main deploys.

## Register
**Product / tool** — design serves the estimate. Credibility and legibility beat
flash. This is a lead-generation and engineering-defensibility instrument, not a
marketing splash page.

## Audience
- Primary: county/municipal road decision-makers and public-works staff, **age
  skews 55–75** — legibility floor is a hard requirement: key descriptors and
  interactive labels ≥16px effective, generous contrast, both desktop and mobile.
- Secondary: reviewing civil engineers (PE) — served by the embedded assumptions
  register and the Engineer's Report export.
- Bilingual: full EN/ES parity is mandatory for every user-facing string.

## Visual system (existing — preserve identity)
- Dark theme: warm near-black ink background (--ink ≈ #211e1a family), gold/bronze
  accent (#9a7435 family), rust accent for warnings.
- Fonts: Barlow (display/UI) + DM Mono (numbers/data). Do not add families.
- Source/citation notes are deliberately small and muted (field-source class);
  that hierarchy is intentional — keep citations quiet, make decisions legible.

## Hard constraints
- Single file; no build step; no external network dependencies at runtime.
- Every numeric default carries a citation or an explicit Estimated/Pending label
  (enforced by test/citations.js).
- 10-file Node test suite must stay green; Peru ledger regression is untouchable.
- Print outputs (summary + Engineer's Report) are first-class surfaces: pt-based
  sizes, black-on-white, built-in margins.
