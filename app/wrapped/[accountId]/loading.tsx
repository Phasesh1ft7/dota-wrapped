export default function Loading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position:  200% 0 }
        }
        .sk {
          background: linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 16px 80px",
        }}
      >
        {/* Profile header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginBottom: 40,
            padding: "28px 40px",
            borderRadius: 16,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <div className="sk" style={{ width: 64, height: 64, borderRadius: "50%" }} />
          <div className="sk" style={{ width: 120, height: 16, borderRadius: 8 }} />
          <div className="sk" style={{ width: 80,  height: 10, borderRadius: 6 }} />
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateAreas:
              '"hero winrate" "legend legend" "signature tempo" "teammate teammate" "bestgame yearreview"',
            gap: 10,
            width: "100%",
            maxWidth: 680,
          }}
        >
          <div className="sk" style={{ gridArea: "hero",       minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "winrate",    minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "legend",     minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "signature",  minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "tempo",      minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "teammate",   minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "bestgame",   minHeight: 160, borderRadius: 16 }} />
          <div className="sk" style={{ gridArea: "yearreview", minHeight: 160, borderRadius: 16 }} />
        </div>
      </main>
    </>
  );
}
