# DM-001 — Lesson State

The browser owns ephemeral lesson state. Nothing is persisted.

```text
PuckState = point + global zone + global lane + possession
TeamScenario = team + relative zone + lane + phase + six placements + six responsibilities
PlayerPlacement = team + role + normalized point
Responsibility = role + where + job + cue
MarkupStroke = ordered normalized points
```

## Invariants

- Normalized rink coordinates use 200×85 units.
- Global zones are west, neutral, and east; lanes are upper, middle, and lower.
- Roles are LW, C, RW, LD, RD, and G.
- Away local coordinates are a 180-degree transform of global coordinates.
- Each scenario has one placement and responsibility for every role.
- Exact puck coordinates interpolate between lane templates and apply bounded role-specific offsets.
- Puck leaders close toward the puck; supporting skaters shift laterally; offensive defenders retain blue-line depth; goalies remain in front of their goal line inside their tracking band.
- At the center-ice loose-puck reset, each team's center and wings begin on its own side of the red line, with wing orientation defined from that team's attacking direction.
- Previous placements retain only the immediately preceding committed puck point or possession state.
- Markup strokes are ephemeral canvas state and are removed together by the clear version signal.
