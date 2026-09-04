# Hockey Cheat Sheet Live Design

This workspace documents the implemented 10U full-ice positioning lesson.

**Status:** Implementation-ready and implemented on 2026-09-04.

## Product boundary

The product is a responsive static Angular app. It teaches one beginner formation for two five-skater teams and their goalies. It has no accounts, backend, saved progress, authoring mode, quiz, or claim that its formation is the only correct hockey system.

## Architecture

Puck state drives a pure formation engine. Teaching areas select responsibilities while exact puck coordinates continuously adjust player placements. Angular signals expose the derived placements and responsibility table, while a Canvas 2D component handles rink rendering, input, animation, and trails. See [architecture](architecture/overview.md) and [requirements](requirements/overview.md).

## Design map

- [Use cases](requirements/use-cases.md)
- [Client data model](architecture/data-models/README.md)
- [Interaction contract](architecture/interactions/README.md)
- [UX and accessibility](ux/README.md)
- [Operations](operations/overview.md)
- [Traceability](traceability.md)
- [Decision log](decisions/adr-log.md)

## Assumptions

- Blue always attacks right and Orange always attacks left.
- “5v5” means five skaters per team; both goalies are also shown.
- Positions are roles that young players rotate through, not permanent assignments.
- A qualified coach may tune the formation coordinates without changing the architecture.

There are no material open design blockers.
