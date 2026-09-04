# INT-001 — Commit a puck scenario

```mermaid
sequenceDiagram
    actor User
    participant Canvas as Rink canvas
    participant Shell as Lesson shell
    participant Engine as Formation engine
    participant Table as Responsibility table

    User->>Canvas: Drag puck
    Canvas->>Shell: puckPreview(point)
    Shell->>Engine: Derive continuous preview placements
    Engine-->>Canvas: Live player placements
    User->>Canvas: Release drag or click
    Canvas->>Shell: puckCommit(point)
    Shell->>Shell: Snapshot placements at prior committed point
    Shell->>Engine: Derive Blue and Orange scenarios
    Engine-->>Shell: Placements and responsibilities
    Shell-->>Canvas: Current and previous placements
    Shell-->>Table: Selected team's responsibilities
    Canvas-->>User: Animate, then retain ghosts and dashed paths
```

During dragging, the puck and all derived placements respond continuously without replacing the saved trail origin. Release commits the exact point and compares it with the prior committed formation, including moves inside one teaching area. Possession changes use the same snapshot and derivation flow.

## INT-002 — Draw and clear markup

When markup mode is enabled, pointer down starts an ephemeral stroke, sufficiently separated move samples append points, and the renderer connects them with midpoint quadratic curves. Pointer release completes the stroke. The semi-transparent marker layer is drawn above rink/trail graphics but beneath players and the puck. Clear markup increments a shell-owned clear version, resets every stroke, and disables the clear control.
