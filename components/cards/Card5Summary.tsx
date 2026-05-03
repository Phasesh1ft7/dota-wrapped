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

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card5Summary({
  profile,
  heroStats,
  totalHours,
  yearWinRate,
  totalGames,
}: Props) {
  const wins = profile.wl?.win ?? 0;
  const losses = profile.wl?.lose ?? 0;
  const allTimeTotal = wins + losses;
  const allTimeWr =
    allTimeTotal > 0 ? ((wins / allTimeTotal) * 100).toFixed(1) : "0.0";

  const top3 = heroStats.slice(0, 3);
  const isGoodWr = parseFloat(allTimeWr) >= 50;

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
      {/* 2026 rotated left edge */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "20%",
          transform: "rotate(90deg)",
          transformOrigin: "center center",
          fontSize: 10,
          letterSpacing: "0.3em",
          opacity: 0.3,
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
        }}
      >
        Dota Wrapped
      </p>

      {/* Title section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Your 2026
          </p>
          <p
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            DOTA
          </p>
          <p
            style={{
              color: "white",
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
            }}
          >
            WRAPPED
          </p>
        </div>

        {/* Checkerboard 8×2 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 12px)",
            gridTemplateRows: "repeat(2, 12px)",
            gap: 0,
            opacity: 0.15,
            flexShrink: 0,
          }}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                backgroundColor:
                  (Math.floor(i / 8) + (i % 8)) % 2 === 0
                    ? "white"
                    : "transparent",
              }}
            />
          ))}
        </div>
      </div>

      {/* Middle content — flex:1 fills space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* W/L record */}
        <p
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {wins.toLocaleString()}
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 40 }}>
            {" "}
            /{" "}
          </span>
          {losses.toLocaleString()}
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          All-time W / L
        </p>

        {/* Win rate */}
        <p
          style={{
            color: isGoodWr ? "#B9FF33" : "#FF4D30",
            fontSize: 36,
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          {allTimeWr}%
        </p>
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          win rate
        </p>

        {/* Top 3 hero chips */}
        {top3.length > 0 && (
          <div style={{ display: "flex", gap: 10 }}>
            {top3.map((hero) => {
              const heroData = profile.heroList?.find(
                (h) => h.id === hero.hero_id,
              );
              const cleanName =
                heroData?.name.replace("npc_dota_hero_", "") ?? "";
              const url = `/api/hero-image?hero=${cleanName}`;
              return (
                <div
                  key={hero.hero_id}
                  style={{
                    width: 96,
                    height: 120,
                    borderRadius: 10,
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {cleanName && (
                    <img
                      src={url}
                      alt={hero.heroName}
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
                        "linear-gradient(to top,rgba(0,0,0,0.9),transparent)",
                      padding: "18px 5px 5px",
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
      </div>

      {/* Bottom stats row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 12,
          marginTop: 12,
          flexShrink: 0,
        }}
      >
        {[
          { value: totalGames.toLocaleString(), label: "Games" },
          { value: `${yearWinRate}%`, label: "Win Rate" },
          { value: `${totalHours}h`, label: "Hours" },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: i === 1 ? "center" : i === 2 ? "right" : "left",
              borderLeft:
                i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined,
              paddingLeft: i > 0 ? 12 : 0,
            }}
          >
            <p
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
