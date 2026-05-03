"use client";

import type { Peer } from "@/lib/opendota";

interface Props {
  peers: Peer[] | null;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card6Teammate({ peers }: Props) {
  const topPeer = (peers ?? [])
    .filter((p) => p.games > 10)
    .sort((a, b) => b.games - a.games)[0] ?? null;

  const winRate =
    topPeer && topPeer.with_games > 0
      ? ((topPeer.with_win / topPeer.with_games) * 100).toFixed(1)
      : "0.0";

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

      {/* Middle content — flex:1 fills available space */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
        }}
      >
        {topPeer ? (
          <>
            {/* Avatar */}
            {topPeer.avatarfull && (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: "3px solid #a855f7",
                  overflow: "hidden",
                  flexShrink: 0,
                  boxShadow: "0 0 24px rgba(168,85,247,0.35)",
                  marginBottom: 16,
                }}
              >
                <img
                  src={topPeer.avatarfull}
                  alt={topPeer.personaname ?? "Teammate"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <p
              style={{
                color: "#a855f7",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Your Most Frequent Teammate
            </p>

            <p
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              {topPeer.personaname ?? "Unknown"}
            </p>

            <div
              style={{
                display: "flex",
                gap: 36,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    color: "white",
                    fontSize: 36,
                    fontWeight: 900,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {topPeer.with_games}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                  }}
                >
                  Games together
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 900,
                    lineHeight: 1,
                    marginBottom: 4,
                    color:
                      parseFloat(winRate) >= 50 ? "#4ade80" : "#f87171",
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
            </div>

            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                fontStyle: "italic",
                textAlign: "center",
              }}
            >
              &ldquo;You&apos;ve been through a lot together.&rdquo;
            </p>
          </>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            No teammate data
          </p>
        )}
      </div>

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
