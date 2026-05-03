"use client";

import type { ProfileData } from "@/lib/opendota";
import type { HeroStatEntry } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  totalHours: number;
  yearWinRate: string;
  totalGames: number;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};


export default function Card5Summary({
  profile,
  heroStats,
  totalHours,
  yearWinRate,
  totalGames,
}: Props) {
  console.log('CARD5 PROPS:', JSON.stringify({win: profile.wl?.win, lose: profile.wl?.lose}));
  console.log("[Card5Summary] wl prop:", JSON.stringify(profile.wl));
  const wins = profile.wl?.win ?? 0;
  const losses = profile.wl?.lose ?? 0;
  const allTimeTotal = wins + losses;
  const allTimeWr =
    allTimeTotal > 0
      ? ((wins / allTimeTotal) * 100).toFixed(1)
      : "0.0";

  const top3 = heroStats.slice(0, 3);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0f0f23",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          right: -90,
          bottom: "5%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          border: "1px solid rgba(13,148,136,0.18)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexShrink: 0,
        }}
      >
        <span style={BRAND}>Dota Wrapped</span>
        <span
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800 }}
        >
          2026
        </span>
      </div>

      {/* Header */}
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 6,
          flexShrink: 0,
        }}
      >
        Your 2026 Dota Wrapped
      </p>

      {/* W/L record — large and centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <p
          style={{
            color: "white",
            fontSize: 64,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            textAlign: "center",
          }}
        >
          {wins.toLocaleString()}
          <span
            style={{ color: "rgba(255,255,255,0.25)", fontSize: 36 }}
          >
            {" "}
            /{" "}
          </span>
          {losses.toLocaleString()}
        </p>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          All-time W / L
        </p>

        <p
          style={{
            color: parseFloat(allTimeWr) >= 50 ? "#4ade80" : "#f87171",
            fontSize: 36,
            fontWeight: 900,
            marginTop: 4,
          }}
        >
          {allTimeWr}%
        </p>

        <p
          style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}
        >
          win rate
        </p>
      </div>

      {/* Top 3 hero chips */}
      {top3.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginBottom: 14,
            flexShrink: 0,
          }}
        >
          {top3.map((hero) => {
            const heroData = profile.heroList?.find((h) => h.id === hero.hero_id);
            if (!heroData) {
              console.log("[Card5Summary] heroData not found for hero_id:", hero.hero_id, "heroList length:", profile.heroList?.length ?? 0);
            }
            const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
            const url = `/api/hero-image?hero=${cleanName}`;
            return (
              <div
                key={hero.hero_id}
                style={{
                  width: 88,
                  height: 116,
                  borderRadius: 10,
                  overflow: "hidden",
                  position: "relative",
                  flexShrink: 0,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {cleanName && (
                  <img
                    src={url}
                    alt={hero.heroName}
                    crossOrigin="anonymous"
                    onLoad={() => console.log("Final image URL:", url)}
                    onError={(e) => console.log("Failed URL:", e.currentTarget.src)}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    background:
                      "linear-gradient(to top,rgba(0,0,0,0.85),transparent)",
                    padding: "16px 5px 5px",
                  }}
                >
                  <p
                    style={{
                      color: "white",
                      fontSize: 8,
                      fontWeight: 700,
                      textAlign: "center",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hero.heroName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom stats row */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: 12,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          flexShrink: 0,
        }}
      >
        <div>
          <p style={{ color: "white", fontSize: 20, fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>
            {totalGames.toLocaleString()}
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Games
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: 20, fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>
            {yearWinRate}%
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Win Rate (yr)
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "white", fontSize: 20, fontWeight: 800, lineHeight: 1, marginBottom: 2 }}>
            {totalHours}h
          </p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Hours
          </p>
        </div>
      </div>

      <p
        style={{ ...BRAND, color: "rgba(255,255,255,0.22)", textAlign: "center", flexShrink: 0 }}
      >
        dotawrapped.gg
      </p>
    </div>
  );
}
