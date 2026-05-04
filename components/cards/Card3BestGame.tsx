"use client";

import type { BestGameData, ItemConstant } from "@/lib/opendota";

interface Props {
  bestGame: BestGameData | null;
  itemConstants: Record<string, ItemConstant> | null;
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

function durationShort(d: string): string {
  // d is "42m 30s" — return just "42m"
  return d.split(" ")[0];
}

export default function Card3BestGame({ bestGame, itemConstants }: Props) {
  if (!bestGame) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          No match data
        </p>
      </div>
    );
  }

  const {
    kills, deaths, assists, lastHits, gpm,
    heroCleanName, heroName, duration, isWin, isParsed, items,
  } = bestGame;

  // Build id→{key, img} map for item icons
  const itemById = new Map<number, { key: string; img: string; dname: string }>();
  for (const [key, item] of Object.entries(itemConstants ?? {})) {
    itemById.set(item.id, { key, img: item.img, dname: item.dname });
  }

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
        padding: "20px 28px 0 28px",
      }}
    >
      {/* Hero image — full bleed */}
      {heroCleanName && (
        <img
          src={`/api/hero-image?hero=${heroCleanName}`}
          alt={heroName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 20%",
          }}
        />
      )}

      {/* Heavy gradient overlay — bottom 65% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, #000000 0%, #000000 40%, rgba(0,0,0,0.8) 58%, transparent 78%)",
          pointerEvents: "none",
        }}
      />

      {/* 2026 rotated */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "30%",
          transform: "rotate(90deg)",
          transformOrigin: "center center",
          fontSize: 10,
          letterSpacing: "0.3em",
          opacity: 0.3,
          color: "white",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
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
        <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
        <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Share button */}
      <button
        onClick={() => navigator.clipboard?.writeText(shareUrl()).catch(() => {})}
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

      {/* DOTA WRAPPED label */}
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

      {/* Top branding */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          Your Best Game
        </p>
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 800,
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          2026
        </span>
      </div>

      {/* Spacer — lets hero portrait show through */}
      <div style={{ flex: 1, minHeight: 60 }} />

      {/* Bottom content — anchored below hero image */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>

        {/* Hero name + WIN/LOSS badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            {heroName}
          </p>
          <span
            style={{
              backgroundColor: isWin ? "#B9FF33" : "#FF4D30",
              color: isWin ? "#000" : "#fff",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            {isWin ? "WIN" : "LOSS"}
          </span>
        </div>

        {/* Middle stats row — 4 columns */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {[
            {
              value: `${kills}/${deaths}/${assists}`,
              label: "KDA",
              color: "#B9FF33",
              mono: true,
            },
            {
              value: isParsed && gpm !== null ? String(gpm) : "—",
              label: "GOLD/MIN",
              color: "white",
              mono: false,
            },
            {
              value: isParsed && lastHits !== null ? String(lastHits) : "—",
              label: "CS",
              color: "white",
              mono: false,
            },
            {
              value: durationShort(duration),
              label: "DURATION",
              color: "white",
              mono: false,
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : undefined,
              }}
            >
              <p
                style={{
                  color: stat.color,
                  fontSize: stat.mono ? 13 : 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: stat.mono ? "-0.02em" : "-0.03em",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Inventory section */}
        {isParsed && items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              marginBottom: 0,
            }}
          >
            {items.slice(0, 6).map((itemId, idx) => {
              const entry = itemById.get(itemId);
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    height: 44,
                  }}
                  title={entry?.dname}
                >
                  {entry && (
                    <img
                      src={`${DOTA_CDN}/apps/dota2/images/dota_react/items/${entry.key}.png`}
                      alt={entry.dname}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : !isParsed ? (
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 11,
              fontStyle: "italic",
            }}
          >
            Match not parsed — item data unavailable
          </p>
        ) : null}

        {/* Spacer for share button + DOTA WRAPPED */}
        <div style={{ height: 88 }} />
      </div>
    </div>
  );
}
