# Hockey Cheat Sheet Live

An interactive full-ice 5v5 positioning lesson for players entering 10U. Move the puck on a Canvas 2D rink, change possession, compare both teams' movement, and read each role's current responsibility.

## Run locally

```powershell
npm install
npm start
```

Open `http://localhost:4200`.

## Verify and build

```powershell
npm test -- --watch=false
npm run build
```

The static production site is written to `dist/hockey-cheat-sheet-live/browser/`.

## How the lesson works

- Blue attacks right; Orange attacks left.
- Click or drag the puck, then select Blue, loose puck, or Orange possession.
- Nine teaching areas choose the responsibilities while exact puck movement drives live carrier, chaser, support, defense, and goalie micro-movements.
- Markup mode lets a coach draw smoothed, semi-transparent notes directly on the rink and clear them in one step.
- Faded circles and dashed paths retain the immediately previous formation.
- Click a player or responsibility row to connect the rink position with its job.
- Focus the rink and use arrow keys to move among teaching areas.

The formation is one beginner-friendly model, not the only correct hockey system. Young players should rotate through all positions.

See the [living design specification](design/README.md) for requirements, content sources, architecture, interaction rules, and decisions.
