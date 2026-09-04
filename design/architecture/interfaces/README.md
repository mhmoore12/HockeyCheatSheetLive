# Client Contracts

There is no network API. The stable internal contract is defined in `src/app/hockey.models.ts`.

| ID     | Contract                                     | Producer                     | Consumer                    |
| ------ | -------------------------------------------- | ---------------------------- | --------------------------- |
| IF-001 | `PuckState`                                  | Lesson shell                 | Formation engine and canvas |
| IF-002 | `TeamScenario`                               | Formation engine             | Lesson shell                |
| IF-003 | `puckCommit(point)`                          | Rink canvas                  | Lesson shell                |
| IF-004 | `puckPreview(point)` and cancel              | Rink canvas                  | Lesson shell                |
| IF-005 | `playerSelect(id)`                           | Rink canvas                  | Lesson shell                |
| IF-006 | Markup mode, clear version, and availability | Lesson shell and rink canvas | Each other                  |

Changes to zone, lane, phase, role, or coordinate semantics require coordinated engine, renderer, documentation, and test updates.
