"use client";

import type { Peer } from "@/lib/opendota";

function timeAgo(unixTs: number): string {
  const seconds = Math.floor(Date.now() / 1000) - unixTs;
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

interface Props {
  peers: Peer[] | null;
  playerName: string;
  isExporting?: boolean;
}

export default function Card6Teammate({ peers, playerName, isExporting = false }: Props) {
  const topPeer = (peers ?? [])
    .filter((p) => p.games > 10)
    .sort((a, b) => b.games - a.games)[0] ?? null;

  if (!topPeer) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No teammate data</p>
      </div>
    );
  }

  const winRate = topPeer.with_games > 0
    ? ((topPeer.with_win / topPeer.with_games) * 100).toFixed(1)
    : "0.0";
  const wr = parseFloat(winRate);
  const isGoodWr = wr >= 50;

  const avgGpm = topPeer.with_games > 0
    ? Math.round(topPeer.with_gpm_sum / topPeer.with_games)
    : null;
  const avgXpm = topPeer.with_games > 0
    ? Math.round(topPeer.with_xpm_sum / topPeer.with_games)
    : null;

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
        padding: "24px 28px 0 28px",
      }}
    >
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

      {/* FIX 6: playerName context header */}
      <div
        style={{
          fontSize: 11,
          color: "rgba(138,43,226,0.5)",
          letterSpacing: 3,
          textTransform: "uppercase",
          textAlign: "center",
          paddingTop: 16,
          marginBottom: 4,
        }}
      >
        {playerName}
      </div>

      {/* Top label */}
      <p
        style={{
          color: "#a855f7",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 16,
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        Your Most Frequent Teammate
      </p>

      {/* Avatar with glow ring — FIX 5: 96px */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 14,
          flexShrink: 0,
        }}
      >
        {topPeer.avatarfull ? (
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "3px solid #a855f7",
              overflow: "hidden",
              boxShadow: "0 0 28px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2)",
              flexShrink: 0,
            }}
          >
            <img
              src={topPeer.avatarfull}
              alt={topPeer.personaname ?? "Teammate"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              border: "3px solid #a855f7",
              backgroundColor: "rgba(168,85,247,0.15)",
            }}
          />
        )}
      </div>

      {/* Teammate name — 26px/900 already above 24px spec floor */}
      <p
        style={{
          color: "white",
          fontSize: 26,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textAlign: "center",
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        {topPeer.personaname ?? "Unknown"}
      </p>

      {/* Games + Win rate */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
            {topPeer.with_games}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Games
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: isGoodWr ? "#B9FF33" : "#FF4D30", fontSize: 40, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
            {winRate}%
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Win Rate
          </p>
        </div>
      </div>

      {/* GPM / XPM grid — FIX 1: XPM (not XMP) */}
      {(avgGpm !== null || avgXpm !== null) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 14,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 10,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "white", fontSize: 22, fontWeight: 900, lineHeight: 1, marginBottom: 3 }}>
              {avgGpm ?? "—"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Avg GPM Together
            </p>
          </div>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 10,
              padding: "10px 12px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "white", fontSize: 22, fontWeight: 900, lineHeight: 1, marginBottom: 3 }}>
              {avgXpm ?? "—"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Avg XPM Together
            </p>
          </div>
        </div>
      )}

      {/* Last played together */}
      <div style={{
        textAlign: "center",
        padding: "12px 0 0",
        fontSize: 10,
        color: "#8a9bb0",
        letterSpacing: 1,
        textTransform: "uppercase",
      }}>
        Last played together{" "}
        <span style={{ color: "#fff", fontWeight: 700 }}>
          {timeAgo(topPeer.last_played)}
        </span>
      </div>

      {/* Rivals record */}
      {topPeer.against_games >= 5 && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
          padding: "10px 0 0",
          fontSize: 10,
          color: "#8a9bb0",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}>
          As rivals:{"  "}
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#9ef01a",
          }}>
            {topPeer.against_win}W
          </span>
          <span style={{ color: "#4a5568" }}>/</span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#ef4444",
          }}>
            {topPeer.against_games - topPeer.against_win}L
          </span>
        </div>
      )}

      {/* FIX 5: Purple divider */}
      <div
        style={{
          borderTop: "1px solid rgba(138,43,226,0.2)",
          marginTop: 16,
          marginBottom: 8,
          flexShrink: 0,
        }}
      />

      {/* Share button — FIX 4: normal flow, gated on !isExporting */}
      {!isExporting && (
        <button
          onClick={() =>
            navigator.clipboard
              ?.writeText(typeof window !== "undefined" ? window.location.href : "")
              .catch(() => {})
          }
          style={{
            display: "block",
            width: "fit-content",
            margin: "0 auto",
            padding: "0 24px",
            height: 40,
            borderRadius: 20,
            backgroundColor: "white",
            color: "black",
            fontSize: 13,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
            position: "relative",
            zIndex: 5,
          }}
        >
          Share this story
        </button>
      )}

      {/* Watermark — FIX 4: normal flow */}
      <p
        style={{
          textAlign: "center",
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.25)",
          letterSpacing: 3,
          textTransform: "uppercase",
          padding: "8px 0",
          margin: 0,
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        DOTA WRAPPED
      </p>
    </div>
  );
}
