# UX Design

The application is a single lesson page: short orientation, possession controls, interactive rink, team-tabbed responsibility table, and collapsible source context.

## Interaction rules

- Blue and Orange always include text labels and role abbreviations; color is supplementary.
- Goalie circles are smaller than skater circles but retain the same generous pointer hit target.
- The puck carrier or chaser follows a drag live while supporting players shift proportionally; the trail origin changes only on release.
- Selecting a circle highlights the matching row. Selecting a row highlights the matching circle.
- The last committed formation remains visible at low opacity with dashed team-colored movement paths, including same-area micro-movements.
- Markup mode turns pointer gestures into smoothed, semi-transparent marker strokes; Clear markup removes every stroke.
- On narrow portrait devices, the app recommends landscape without blocking use.
- The rink is keyboard-focusable and arrow keys move among teaching-area centers.

Theme values are defined in [theme.md](theme.md). The [static mockup](mockups/rink-lesson/index.html) records the layout without requiring the Angular toolchain; the production app is authoritative for behavior.
