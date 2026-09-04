# Components

| ID      | Component        | Responsibility                                                      | Dependencies                      |
| ------- | ---------------- | ------------------------------------------------------------------- | --------------------------------- |
| SVC-001 | Lesson shell     | Own selected puck, possession, team, player, and previous formation | Angular signals, DM-001           |
| SVC-002 | Formation engine | Derive deterministic placements and text                            | DM-001 only                       |
| SVC-003 | Rink canvas      | Render and collect rink input                                       | Browser Canvas 2D, SVC-001 output |

All components ship together as one static application.
