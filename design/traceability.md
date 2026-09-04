# Traceability

| Requirement | Implementation                                          | Verification                             |
| ----------- | ------------------------------------------------------- | ---------------------------------------- |
| FR-001      | App state and `RinkCanvas` pointer handling             | App interaction tests and browser checks |
| FR-002      | Continuous formation engine and Canvas renderer         | Scenario matrix and micro-movement tests |
| FR-003      | Preview state, snapshots, animation, and trails         | Same-area trail and browser drag tests   |
| FR-004      | Shared `TeamScenario` data and responsibility table     | Six-row and team-tab tests               |
| FR-005      | Sources panel                                           | Content review                           |
| FR-006      | Native buttons and canvas arrow-key handler             | Component and browser keyboard checks    |
| FR-007      | Canvas markup state and smoothing renderer              | Toggle, draw, clear, and browser tests   |
| NFR-001     | Responsive CSS                                          | Desktop and landscape screenshots        |
| NFR-002     | `ResizeObserver` and device-pixel-ratio scaling         | Code review and browser screenshot       |
| NFR-003     | Semantic DOM, focus styles, live region, reduced motion | Component assertions and keyboard review |
| NFR-004     | Angular application build                               | `npm run build`                          |
| NFR-005     | Typed pure formation engine                             | Exhaustive unit tests                    |
