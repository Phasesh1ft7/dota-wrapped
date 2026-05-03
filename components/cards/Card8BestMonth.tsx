"use client";

import type { Match, PlayerHeroStats } from "@/lib/opendota";

interface Props {
  matches: Match[];
  playerHeroes: PlayerHeroStats[];
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTH_COPY: Partial<Record<string, string>> = {
  January: "New year, new losing streak.",
  March: "Something in the air.",
  December: "Holiday grind.",
};

const isWin = (m: Match) =>
  (m.radiant_win && m.player_slot < 128) ||
  (!m.radiant_win && m.player_slot >= 128);

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card8BestMonth({ matches, playerHeroes }: Props) {
  const buckets: Record<string, { wins: number; total: number; year: number; monthIdx: number }> = {};

  for (const m of matches) {
    const d = new Date(m.start_time * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) buckets[key] = { wins: 0, total: 0, year: d.getUTCFullYear(), monthIdx: d.getUTCMonth() };
    buckets[key].total++;
    if (isWin(m)) buckets[key].wins++;
  }

  const best = Object.values(buckets)
    .filter((b) => b.total >= 1)
    .sort((a, b) => b.wins / b.total - a.wins / a.total)[0] ?? null;

  // Fallback: derive month from most recently played hero
  const fallbackTs = !best && playerHeroes.length > 0
    ? Math.max(...playerHeroes.map((h) => h.last_played))
    : null;
  const fallbackDate = fallbackTs ? new Date(fallbackTs * 1000) : null;

  const noData = !best && !fallbackDate;

  const monthName = best
    ? MONTH_NAMES[best.monthIdx]
    : fallbackDate
      ? MONTH_NAMES[fallbackDate.getUTCMonth()]
      : "—";
  const year = best?.year ?? fallbackDate?.getUTCFullYear() ?? new Date().getUTCFullYear();
  const winRate = best ? ((best.wins / best.total) * 100).toFixed(1) : null;
  const games = best?.total ?? null;
  const copy = (best && MONTH_COPY[monthName]) ?? "You were in the zone.";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0a1628",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          left: -80,
          bottom: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(56,189,248,0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding */}
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        <span style={BRAND}>Dota Wrapped</span>
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 800 }}>
          2026
        </span>
      </div>

      {/* Main content */}
      <div style={{ position: "relative" }}>
        {noData ? (
          <>
            <p
              style={{
                color: "#38bdf8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              Your Best Month
            </p>
            <p
              style={{
                color: "white",
                fontSize: 48,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              NOT ENOUGH
              <br />
              DATA
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
              Play more games in 2026
            </p>
          </>
        ) : (
          <>
            <p
              style={{
                color: "#38bdf8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 10,
              }}
            >
              {best ? "Your Best Month" : "Most Recent Activity"}
            </p>

            <p
              style={{
                color: "white",
                fontSize: 62,
                fontWeight: 900,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {monthName}
            </p>

            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              {year}
            </p>

            {winRate !== null && games !== null && (
              <div style={{ display: "flex", gap: 28, marginBottom: 20 }}>
                <div>
                  <p style={{ color: "#38bdf8", fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                    {winRate}%
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Win rate
                  </p>
                </div>
                <div>
                  <p style={{ color: "white", fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                    {games}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Games played
                  </p>
                </div>
              </div>
            )}

            {best && (
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, fontStyle: "italic" }}>
                &ldquo;{copy}&rdquo;
              </p>
            )}
          </>
        )}
      </div>

      {/* Bottom branding */}
      <p style={{ ...BRAND, color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
        dotawrapped.gg
      </p>
    </div>
  );
}
