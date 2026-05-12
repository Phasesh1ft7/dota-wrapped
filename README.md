# Dota Wrapped 2026

A Spotify Wrapped-style annual stats experience for Dota 2. Enter your Steam ID or profile URL and get 8 shareable cards breaking down your year — hero stats, win rates, playstyle, best teammate, fastest win and more.

**Live:** https://dota-wrapped-coral.vercel.app

> ⚡ Vibe coded — built with AI-assisted development (Claude) as a portfolio project. The architecture, data pipeline and design decisions are intentional; the implementation velocity was not entirely human.

---

## Features

- **8 stat cards** — Hero DNA, Win Rate, Rank, Signature Moves, Tempo Stats, Teammate Chemistry, Play Style, Year in Review
- **Steam ID resolution** — accepts Steam32, Steam64 (17-digit) or vanity profile URLs (`steamcommunity.com/id/username`)
- **Redis caching** — 6-hour TTL via Upstash, `?refresh=1` to bypass
- **Shareable cards** — PNG download per card via html2canvas
- **Dynamic OG image** — per-player 1200×630 preview for social sharing
- **Locked state handling** — graceful degradation for unparsed/private accounts
- **Timeout-safe** — 20s global fetch timeout, 15s on unprotected raw fetches, descriptive error UI

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + inline styles |
| Animation | Framer Motion 12 |
| Charts | Recharts 3 |
| Caching | Upstash Redis (`@upstash/redis`) |
| OG Images | `@vercel/og` (Edge Runtime) |
| PNG Export | `html2canvas` |
| Data | OpenDota API (primary), STRATZ GraphQL API (fallback) |
| Deployment | Vercel |

---

## Architecture
app/
├── page.tsx                    # Landing page — Steam ID input, useActionState form
├── actions/
│   └── resolveSteamId.ts       # Server action — Steam32/64/vanity URL resolution
├── wrapped/
│   └── [accountId]/
│       └── page.tsx            # Server component — data fetch + Redis cache layer
└── api/
└── og/
└── route.tsx           # Dynamic OG image (Edge runtime, 1200×630)
components/
├── WrappedClient.tsx           # Client wrapper — receives server data, owns card state
├── WrappedGrid.tsx             # Card grid — tile rendering, modal open logic
├── CardModal.tsx               # Expanded card modal with exit animation
├── HeroMosaicBackground.tsx    # Landing page hero grid background
└── cards/
├── Card1Hero.tsx           # Hero DNA
├── Card5Summary.tsx        # Win Rate
├── Card4MatchupB.tsx       # Signature Moves
├── Card8BestMonth.tsx      # Tempo Stats
├── Card6Teammate.tsx       # Teammate Chemistry
├── CardPlayStyle.tsx       # Play Style (radar chart)
├── CardQuiz.tsx            # Quiz
└── [Rank card]             # Rank
lib/
├── opendota.ts                 # OpenDota API — all fetch logic, 20s timeout
├── stratz.ts                   # STRATZ GraphQL API — fallback data
├── transforms.ts               # Data transformation — getYearInNumbers, getSignatureMoves, computePlaystyle, etc.
└── cache.ts                    # Upstash Redis — get/set with 6hr TTL

### Data Flow
User enters Steam ID / URL
↓
app/actions/resolveSteamId.ts   (Steam Web API vanity resolution if needed)
↓
app/wrapped/[accountId]/page.tsx (server)
↓
Redis cache hit? → serve immediately
↓ miss
fetchPlayerProfile + fetchPlayerMatches (Promise.allSettled, parallel)
↓
lib/transforms.ts — shape raw API data into card-ready structures
↓
WrappedClient.tsx → WrappedGrid.tsx → individual card components

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `STEAM_API_KEY` | Steam Web API — vanity URL resolution |
| `STRATZ_API_KEY` | STRATZ GraphQL API auth (Bearer token) |
| `KV_REST_API_URL` | Upstash Redis URL |
| `KV_REST_API_TOKEN` | Upstash Redis auth token |
| `VERCEL_PROJECT_PRODUCTION_URL` | OG image base URL (production) |
| `VERCEL_URL` | OG image base URL (preview fallback) |

---

## Local Development

```bash
git clone https://github.com/phasesh1ft7s-projects/dota-wrapped
cd dota-wrapped
npm install
```

Create `.env.local`:

```env
STEAM_API_KEY=your_steam_api_key
STRATZ_API_KEY=your_stratz_token
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Test accounts:**
- `154715080` — Immortal, parsed matches (full data)
- `1557388483` — Active account
- `91060310` — No parsed matches (locked state testing)
- `87287966` — Dendi (public, load testing)

---

## API Notes

- **OpenDota** — free tier, no API key required, 60 req/min, 3000 req/day
- **STRATZ** — used as fallback for fields OpenDota doesn't expose on unparsed matches
- **Steam Web API** — free, requires API key from [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)
- Cache bypass: append `?refresh=1` to any `/wrapped/[accountId]` URL

---

## License

MIT © [phasesh1ft](https://github.com/phasesh1ft7s-projects)

---

*Built with Claude. Shipped with intent.*
