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

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card8BestMonth({ matches, playerHeroes }: Props) {
  const buckets: Record<
    string,
    { wins: number; total: number; year: number; monthIdx: number }
  > = {};

  for (const m of matches) {
    const d = new Date(m.start_time * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key])
      buckets[key] = {
        wins: 0,
        total: 0,
        year: d.getUTCFullYear(),
        monthIdx: d.getUTCMonth(),
      };
    buckets[key].total++;
    if (isWin(m)) buckets[key].wins++;
  }

  const best =
    Object.values(buckets)
      .filter((b) => b.total >= 1)
      .sort((a, b) => b.wins / b.total - a.wins / a.total)[0] ?? null;

  const fallbackTs =
    !best && playerHeroes.length > 0
      ? Math.max(...playerHeroes.map((h) => h.last_played))
      : null;
  const fallbackDate = fallbackTs ? new Date(fallbackTs * 1000) : null;
  const noData = !best && !fallbackDate;

  const monthIdx = best
    ? best.monthIdx
    : fallbackDate
      ? fallbackDate.getUTCMonth()
      : 0;
  const monthName = best
    ? MONTH_NAMES[best.monthIdx]
    : fallbackDate
      ? MONTH_NAMES[fallbackDate.getUTCMonth()]
      : "—";
  const year =
    best?.year ?? fallbackDate?.getUTCFullYear() ?? new Date().getUTCFullYear();
  const winRate = best ? ((best.wins / best.total) * 100).toFixed(1) : null;
  const games = best?.total ?? null;
  const copy = (best && MONTH_COPY[monthName]) ?? "You were in the zone.";
  const monthNum = String(monthIdx + 1).padStart(2, "0");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "28px 28px 0 28px",
      }}
    >
      {/* Large faded month number behind everything */}
      {!noData && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 180,
            fontWeight: 900,
            color: "white",
            opacity: 0.04,
            pointerEvents: "none",
            userSelect: "none",
            lineHeight: 1,
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
        >
          {monthNum}
        </div>
      )}

      {/* 2026 rotated left edge */}
      <span
        style={{
          position: "absolute",
          left: 16,
          top: "50%",
          transform: "translateY(-50%) rotate(-90deg)",
          fontSize: 11,
          letterSpacing: "0.3em",
          opacity: 0.4,
          textTransform: "uppercase",
          color: "white",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          zIndex: 2,
        }}
      >
        2026
      </span>

      {/* SVG scribble */}
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: 0.12,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <path
          d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        <path
          d="M-10,70 Q80,40 140,65 Q200,85 310,55"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>

      {/* Share button */}
      <button
        onClick={() =>
          navigator.clipboard?.writeText(shareUrl()).catch(() => {})
        }
        style={{
          position: "absolute",
          bottom: 44,
          left: "50%",
          transform: "translateX(-50%)",
          width: 160,
          height: 40,
          borderRadius: 20,
          backgroundColor: "white",
          color: "black",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          zIndex: 5,
        }}
      >
        Share this story
      </button>

      {/* DOTA WRAPPED bottom-left */}
      <p
        style={{
          position: "absolute",
          bottom: 16,
          left: 28,
          fontSize: 10,
          letterSpacing: "0.15em",
          opacity: 0.35,
          color: "white",
          textTransform: "uppercase",
          margin: 0,
          zIndex: 2,
        }}
      >
        Dota Wrapped
      </p>

      {/* Middle content — flex:1 fills space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {noData ? (
          <>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Your best
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              MONTH
            </p>
            <p
              style={{
                color: "white",
                fontSize: 72,
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
                marginBottom: 16,
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
                color: "rgba(255,255,255,0.5)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              {best ? "Your best" : "Most recent"}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              MONTH
            </p>

            <p
              style={{
                color: "white",
                fontSize: monthName.length <= 3 ? 96 : monthName.length <= 5 ? 80 : monthName.length <= 7 ? 64 : 52,
                fontWeight: 900,
                lineHeight: 0.9,
                letterSpacing: "-0.04em",
                marginBottom: 6,
                textTransform: "uppercase",
                overflow: "hidden",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {monthName}
            </p>

            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 24,
                fontWeight: 700,
                marginBottom: 20,
              }}
            >
              {year}
            </p>

            {winRate !== null && games !== null && (
              <div style={{ display: "flex", gap: 32, marginBottom: 16 }}>
                <div>
                  <p
                    style={{
                      color: "#38bdf8",
                      fontSize: 36,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginBottom: 3,
                    }}
                  >
                    {winRate}%
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Win rate
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      color: "white",
                      fontSize: 36,
                      fontWeight: 900,
                      lineHeight: 1,
                      marginBottom: 3,
                    }}
                  >
                    {games}
                  </p>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Games played
                  </p>
                </div>
              </div>
            )}

            {best && (
              <p
                style={{
                  color: "rgba(255,255,255,0.32)",
                  fontSize: 13,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{copy}&rdquo;
              </p>
            )}
          </>
        )}
      </div>

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
