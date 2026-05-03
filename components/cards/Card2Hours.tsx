"use client";

interface Props {
  totalHours: number;
  totalGames: number;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card2Hours({ totalHours, totalGames }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#1a1a2e",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative rings */}
      <div
        style={{
          position: "absolute",
          right: -80,
          top: "18%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          border: "1px solid rgba(239,68,68,0.2)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -40,
          top: "25%",
          width: 230,
          height: 230,
          borderRadius: "50%",
          border: "1px solid rgba(239,68,68,0.15)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={BRAND}>Dota Wrapped</span>
        <span
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800 }}
        >
          2026
        </span>
      </div>

      {/* Main content */}
      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Hours
        </p>

        {/* Giant hours number */}
        <p
          style={{
            color: "#ef4444",
            fontSize: 130,
            fontWeight: 900,
            lineHeight: 0.85,
            letterSpacing: "-0.05em",
            marginBottom: 0,
          }}
        >
          {totalHours}
        </p>

        <p
          style={{
            color: "rgba(255,255,255,0.9)",
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Hours
        </p>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 16,
            fontStyle: "italic",
          }}
        >
          of your life, gone forever
        </p>
      </div>

      {/* Bottom row */}
      <div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 16,
            marginBottom: 12,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 3,
            }}
          >
            {totalGames.toLocaleString()}
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Matches Played
          </p>
        </div>

        <p style={{ ...BRAND, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
          dotawrapped.gg
        </p>
      </div>
    </div>
  );
}
