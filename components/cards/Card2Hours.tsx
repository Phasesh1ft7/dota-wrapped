"use client";

interface Props {
  totalHours: number;
  totalGames: number;
}

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card2Hours({ totalHours, totalGames }: Props) {
  const digits = Math.floor(totalHours).toString().length;
  const numFontSize = digits <= 3 ? 140 : digits === 4 ? 96 : 72;
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
      {/* Concentric circles background */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 0,
        }}
        viewBox="0 0 400 600"
      >
        <circle cx="200" cy="300" r="80"  fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="140" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="200" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="260" fill="none" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="300" r="320" fill="none" stroke="white" strokeWidth="1" />
      </svg>

      {/* 2026 rotated left edge */}
      <span
        style={{
          position: "absolute",
          right: 12,
          top: "25%",
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

      {/* Top label */}
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          marginBottom: 12,
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        You played for
      </p>

      {/* Main content */}
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
        {/* Outlined hours number — shadow + stroke layers */}
        <div style={{ position: "relative", overflow: "hidden", width: "100%", maxWidth: "100%" }}>
          {/* Shadow layer behind */}
          <p
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              color: "rgba(255,77,48,0.15)",
              fontSize: numFontSize,
              fontWeight: 900,
              width: "100%",
              overflow: "hidden",
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {totalHours}
          </p>
          {/* Outlined stroke layer */}
          <p
            style={{
              color: "transparent",
              WebkitTextStroke: "3px #FF4D30",
              fontSize: numFontSize,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              position: "relative",
            }}
          >
            {totalHours}
          </p>
        </div>

        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          HOURS
        </p>

        <div
          style={{
            width: 40,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.3)",
            marginBottom: 16,
          }}
        />

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, fontStyle: "italic" }}>
          of your life, gone forever
        </p>
      </div>

      {/* Games count */}
      <div style={{ flexShrink: 0, marginTop: 16, position: "relative", zIndex: 1 }}>
        <p style={{ color: "white", fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>
          {totalGames.toLocaleString()}
        </p>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Matches played
        </p>
      </div>

      {/* Spacer for share button + DOTA WRAPPED */}
      <div style={{ height: 88, flexShrink: 0 }} />
    </div>
  );
}
