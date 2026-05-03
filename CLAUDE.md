 # CLAUDE.md — Dota Wrapped

## Stack
- Next.js 15 App Router
- TypeScript (strict)
- Tailwind v4
- Framer Motion (animations only)
- Recharts (KDA chart only)

## Architecture rules
- No backend, no database, no auth
- All data fetching via OpenDota REST API
- All transforms in lib/transforms.ts
- All API calls in lib/opendota.ts
- No Prisma, no Redis, no external state libraries

## API
- Base URL: https://api.opendota.com/api
- No API key needed. Do not add any auth headers to requests.
- Always use Promise.allSettled for parallel calls, never Promise.all

## Win condition (critical — never change this)
const isWin = (m) =>
  (m.radiant_win && m.player_slot < 128) ||
  (!m.radiant_win && m.player_slot >= 128)
