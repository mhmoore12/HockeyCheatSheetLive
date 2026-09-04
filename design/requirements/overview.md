# Product Requirements

## Goal and audience

Help players entering 10U recognize useful full-ice 5v5 positions as puck location and possession change. The primary audience is young players learning with a coach or parent on a desktop or landscape tablet.

## Functional requirements

### FR-001 — Select puck state

The user can click or drag the puck to any valid rink coordinate and select Blue, loose, or Orange possession.

### FR-002 — Show formation response

The app displays both five-skater teams and goalies in an age-appropriate formation derived from nine teaching areas and three possession states. At the center-ice loose-puck reset, both teams line up on their own side of the red line with correctly oriented wings. Within an area, the puck carrier or chaser follows the puck and the rest of the formation shifts proportionally with its exact coordinates. Offensive defenders retain blue-line depth while moving laterally between the boards and slot. Goalies remain in front of their goal lines and use smaller indicators than skaters.

### FR-003 — Explain the transition

During a drag, players respond continuously to the puck preview. After every completed puck move or possession change, one prior-position ghost and dashed movement line remain visible until the next completed move.

### FR-004 — Explain every role

The selected team's table shows where to go, the current job, and a short cue for LW, C, RW, LD, RD, and G. Selecting a player or row links the rink and table visually.

### FR-005 — Provide source context

The app identifies the lesson as one beginner model and links the coaching sources used to develop it.

### FR-006 — Support non-pointer input

Possession and team selection use native controls; arrow keys move a focused rink between teaching areas.

### FR-007 — Draw coach markup

The user can toggle markup mode, draw smoothed semi-transparent marker strokes on the rink, and clear all markup. Markup mode prevents the same pointer gesture from moving the puck or selecting a player.

## Non-functional requirements

### NFR-001 — Responsive interaction

The complete lesson works at 1024×768 landscape and scales to current desktop browsers without horizontal page overflow.

### NFR-002 — Crisp rendering

The canvas accounts for device pixel ratio and resize changes.

### NFR-003 — Accessibility

Controls have keyboard access, visible focus, semantic labels, live state announcements, sufficient contrast, and reduced-motion behavior.

### NFR-004 — Static delivery

The production build runs from static files without runtime services or secrets.

### NFR-005 — Verifiable content model

All 27 team-relative contexts produce exactly six valid placements and six complete responsibilities, with equivalent Away scenarios derived by mirroring. Micro-movements remain bounded, continuous inside each zone, and preserve role-specific depth constraints.

## Sources and content policy

- Supplied `hockey-cheat-sheet.pdf` and the [How To Hockey source page](https://howtohockey.com/hockey-cheat-sheet/)
- [USA Hockey recommended youth structure](https://portal.usahockey.com/cx/vice-president/hockey-development/recommended_youth_hockey_program_structure.pdf)
- [Hockey Canada U11 progression](https://www.hockeycanada.ca/en-ca/hockey-programs/coaching/under-11/coaches/skills)
- [Hockey Canada defence development](https://www.hockeycanada.ca/en-ca/hockey-programs/players/essentials/positions-skills/defence)

The app paraphrases concepts and does not reproduce the supplied graphic, branding, or long source passages.
