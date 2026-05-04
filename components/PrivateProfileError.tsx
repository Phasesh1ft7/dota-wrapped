"use client";

const STEPS = [
  "Open Dota 2",
  "Click your profile avatar → Settings",
  "Go to the Social tab",
  'Enable "Expose Public Match Data"',
  "Return here and try again",
];

export default function PrivateProfileError() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 96px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* SVG scribble at bottom */}
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: 0.1,
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

      {/* DOTA WRAPPED branding bottom-left */}
      <p
        style={{
          position: "absolute",
          bottom: 16,
          left: 24,
          fontSize: 10,
          letterSpacing: "0.15em",
          opacity: 0.3,
          color: "white",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        Dota Wrapped
      </p>

      {/* Lock emoji */}
      <p style={{ fontSize: 64, lineHeight: 1, marginBottom: 24 }}>🔒</p>

      {/* Heading */}
      <h1
        style={{
          color: "white",
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        Profile is Private
      </h1>

      {/* Subtext */}
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 15,
          textAlign: "center",
          maxWidth: 340,
          lineHeight: 1.6,
          marginBottom: 36,
        }}
      >
        To use Dota Wrapped, enable public match data in your Dota 2 settings.
      </p>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          maxWidth: 380,
          marginBottom: 36,
        }}
      >
        {STEPS.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: "12px 16px",
            }}
          >
            {/* Number badge */}
            <span
              style={{
                backgroundColor: "#B9FF33",
                color: "#000000",
                fontSize: 12,
                fontWeight: 900,
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            {/* Instruction */}
            <span
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                lineHeight: 1.4,
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Try Again button */}
      <a
        href="/"
        style={{
          display: "inline-block",
          backgroundColor: "white",
          color: "black",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          padding: "14px 40px",
          borderRadius: 999,
        }}
      >
        Try Again
      </a>
    </div>
  );
}
