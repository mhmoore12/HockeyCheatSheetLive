# ADR-0001 — Use a static Angular client and Canvas 2D

- **Status:** Superseded by [ADR-0002](0002-add-continuous-micro-movements.md)
- **Date:** 2026-09-04
- **Decision owners:** Product owner
- **Related:** FR-001 through FR-006, NFR-001 through NFR-005

## Context

The lesson has fixed public coaching content, ephemeral interaction state, frequent drawing updates, and no identity or collaboration requirement.

## Decision

Build one strict standalone Angular 21.2 application. Use typed signals and a pure formation engine for state derivation, Canvas 2D for the rink and moving pieces, and semantic HTML for controls and responsibility text. Deploy as static files.

## Options considered

- SVG would make every player directly semantic but produces a larger retained element tree and was not the requested drawing technology.
- A backend would enable authoring and synchronization but adds operations without a v1 requirement.
- Continuous coordinate rules look fluid but make positions harder to explain and validate than nine stable teaching areas.

## Consequences

The app is inexpensive to host and works without runtime services. Canvas requires explicit resize, input, rendering, and accessibility handling. Coach editing or shared saved lessons would require a later architecture decision.

## Revisit triggers

Revisit if formation authoring, accounts, cross-device persistence, real-time collaboration, or offline installation becomes a committed requirement.
