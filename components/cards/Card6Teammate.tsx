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

  const copy = wr >= 55
    ? "A winning partnership."
    : wr >= 45
      ? "Through thick and thin."
      : "You suffer together.";

  const h2hWins = topPeer.against_win;
  const h2hLosses = topPeer.against_games - topPeer.against_win;

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
        }}
      >
        Your Most Frequent Teammate
      </p>

      {/* Avatar with glow ring */}
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
              width: 88,
              height: 88,
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
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: "3px solid #a855f7",
              backgroundColor: "rgba(168,85,247,0.15)",
            }}
          />
        )}
      </div>

      {/* Teammate name */}
      <p
        style={{
          color: "white",
          fontSize: 26,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          textAlign: "center",
          marginBottom: 4,
          flexShrink: 0,
        }}
      >
        {topPeer.personaname ?? "Unknown"}
      </p>

      <p
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        You&apos;ve played together
      </p>

      {/* Games + Win rate — main stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 32,
          marginBottom: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
            {topPeer.with_games}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Games
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: isGoodWr ? "#B9FF33" : "#FF4D30", fontSize: 48, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: 4 }}>
            {winRate}%
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Win Rate
          </p>
        </div>
      </div>

      {/* GPM / XPM grid */}
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

      {/* H2H record */}
      <div style={{ textAlign: "center", marginBottom: 12, flexShrink: 0 }}>
        {topPeer.against_games > 0 ? (
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Head to head:{" "}
            <span style={{ color: "#B9FF33" }}>{h2hWins}W</span>
            {" / "}
            <span style={{ color: "#FF4D30" }}>{h2hLosses}L</span>
          </p>
        ) : (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontStyle: "italic" }}>
            You&apos;ve never faced each other
          </p>
        )}
      </div>

      {/* Copy */}
      <p
        style={{
          color: "rgba(255,255,255,0.28)",
          fontSize: 12,
          fontStyle: "italic",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        &ldquo;{copy}&rdquo;
      </p>

      {/* Spacer */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
