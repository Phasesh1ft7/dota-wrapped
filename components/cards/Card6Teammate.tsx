"use client";

import type { Peer } from "@/lib/opendota";

interface Props {
  peers: Peer[] | null;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

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
        backgroundColor: "#1a0a2e",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative glow */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(168,85,247,0.18) 0%,transparent 70%)",
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
      {topPeer ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            position: "relative",
            flex: 1,
            justifyContent: "center",
          }}
        >
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
                boxShadow: "0 0 24px rgba(168,85,247,0.4)",
              }}
            >
              <img
                src={topPeer.avatarfull}
                alt={topPeer.personaname ?? "Teammate"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <p
              style={{
                color: "#a855f7",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginBottom: 6,
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
                marginBottom: 14,
              }}
            >
              {topPeer.personaname ?? "Unknown"}
            </p>

            <div
              style={{
                display: "flex",
                gap: 28,
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <p style={{ color: "white", fontSize: 28, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                  {topPeer.with_games}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Games together
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    lineHeight: 1,
                    marginBottom: 2,
                    color: parseFloat(winRate) >= 50 ? "#4ade80" : "#f87171",
                  }}
                >
                  {winRate}%
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Win rate
                </p>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontStyle: "italic" }}>
              "You&apos;ve been through a lot together."
            </p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>No teammate data</p>
        </div>
      )}

      {/* Bottom branding */}
      <p style={{ ...BRAND, color: "rgba(255,255,255,0.22)", textAlign: "center" }}>
        dotawrapped.gg
      </p>
    </div>
  );
}
