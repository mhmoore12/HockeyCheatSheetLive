# ADR-0002 — Add continuous in-zone micro-movements

- **Status:** Accepted
- **Date:** 2026-09-04
- **Decision owners:** Product owner
- **Related:** FR-001 through FR-007, NFR-001 through NFR-005
- **Supersedes:** [ADR-0001](0001-use-static-canvas-client.md)

## Context

Fixed placements teach broad responsibilities but imply that players stop adjusting once the puck remains inside one teaching area. The lesson needs to show the small movements players make as the puck changes depth and moves from boards to slot.

## Decision

Keep the nine areas for stable labels and responsibility text, but derive placements continuously from the exact puck coordinate. Interpolate each role between upper, middle, and lower templates. Pull the active carrier or chaser toward the puck, shift supporting skaters proportionally, constrain offensive defenders to their blue-line depth while they move laterally, and constrain goalie tracking to the crease band. Preview these positions live during drag and save the prior committed formation for trails on release.

Markup mode is an orthogonal canvas interaction state. It disables puck and player gestures, smooths sampled points with midpoint quadratic curves, and draws semi-transparent marker strokes beneath the player layer until cleared.

## Options considered

- Keep fixed area anchors: simplest, but fails to teach in-zone adjustments.
- Make all players follow one uniform offset: smooth, but ignores role-specific depth and structure.
- Replace areas with fully continuous responsibilities: flexible, but makes the written lesson unstable for new players.

## Consequences

The visual movement is more realistic while table instructions remain readable and stable. The engine requires interpolation and constraint tests. Same-area clicks now create meaningful ghost positions and movement paths. Markup remains ephemeral and local to the canvas.

## Revisit triggers

Revisit when a qualified coach supplies different role constraints, possession-carrier selection, formation-specific movement curves, or persistent/shared markup.
