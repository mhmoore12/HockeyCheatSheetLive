# Operations

Build with `npm ci && npm run build`; publish `dist/hockey-cheat-sheet-live/browser/` to any static HTTPS host. Roll back by restoring the prior immutable build artifact. There are no runtime configuration values, secrets, migrations, scheduled jobs, backups, or state recovery procedures.

Operational availability equals the chosen static host's availability. Browser failures should leave the source and coaching context readable where possible; unsupported Canvas behavior prevents the rink but not the responsibility table.
