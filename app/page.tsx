"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const CSS = `
  * { box-sizing: border-box; }

  .lp {
    min-height: 100vh;
    background: #000000;
    display: flex;
    flex-direction: row;
    position: relative;
    overflow: hidden;
  }

  /* ── LEFT COLUMN ── */
  .lp-left {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 72px 72px 80px;
    position: relative;
    z-index: 2;
  }

  /* ── RIGHT COLUMN ── */
  .lp-right {
    width: 50%;
    position: relative;
    overflow: hidden;
    z-index: 1;
  }

  /* ── Headline ── */
  .lp-dota {
    color: #ffffff;
    font-size: 88px;
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -4px;
    margin: 0;
  }
  .lp-wrapped {
    color: #B9FF33;
    font-size: 88px;
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -4px;
    margin: 0;
  }
  .lp-year {
    color: rgba(255,255,255,0.3);
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.3em;
    margin: 8px 0 0;
  }
  .lp-sub {
    color: rgba(255,255,255,0.4);
    font-size: 16px;
    font-weight: 400;
    margin: 24px 0 0;
    line-height: 1.5;
  }

  /* ── Input row ── */
  .lp-input-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 32px;
  }
  .lp-input {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 14px 18px;
    color: #ffffff;
    font-size: 16px;
    outline: none;
    width: 260px;
    transition: border-color 0.15s;
  }
  .lp-input::placeholder { color: rgba(255,255,255,0.28); }
  .lp-input:focus { border-color: rgba(255,255,255,0.3); }
  .lp-btn {
    margin-left: 8px;
    background: #ffffff;
    color: #000000;
    border: none;
    border-radius: 8px;
    padding: 14px 24px;
    font-weight: 800;
    font-size: 15px;
    text-transform: uppercase;
    cursor: pointer;
    letter-spacing: 0.04em;
    white-space: nowrap;
    transition: opacity 0.15s;
  }
  .lp-btn:hover { opacity: 0.85; }

  .lp-hint {
    color: rgba(255,255,255,0.3);
    font-size: 12px;
    margin-top: 8px;
  }

  /* ── Branding ── */
  .lp-brand {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    color: rgba(255,255,255,0.2);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 3;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .lp { flex-direction: column; }
    .lp-left { width: 100%; padding: 72px 32px 48px; justify-content: flex-start; }
    .lp-right { display: none; }
    .lp-dota { font-size: 64px; }
    .lp-wrapped { font-size: 64px; }
    .lp-input-row { flex-direction: column; align-items: stretch; }
    .lp-input { width: 100%; }
    .lp-btn { margin-left: 0; margin-top: 8px; }
    .lp-brand { left: 50%; transform: translateX(-50%); }
  }
`;

export default function HomePage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmed = accountId.trim();
    if (!trimmed || !/^\d+$/.test(trimmed)) {
      setError("Invalid ID — numbers only");
      return;
    }
    router.push(`/wrapped/${trimmed}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="lp">

      {/* ── Element 1: Aegis watermark ── */}
      <img
        src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aegis.png"
        alt=""
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          objectFit: "contain",
          opacity: 0.04,
          top: "50%",
          left: "25%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Element 2: Roshan silhouette ── */}
      <svg
        viewBox="0 0 300 400"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 300,
          height: 400,
          opacity: 0.04,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Body */}
        <ellipse cx="150" cy="280" rx="100" ry="120" fill="white" />
        {/* Head */}
        <circle cx="150" cy="160" r="70" fill="white" />
        {/* Left horn */}
        <polygon points="90,120 60,40 110,100" fill="white" />
        {/* Right horn */}
        <polygon points="210,120 240,40 190,100" fill="white" />
        {/* Left shoulder spike */}
        <polygon points="60,200 20,150 70,220" fill="white" />
        {/* Right shoulder spike */}
        <polygon points="240,200 280,150 230,220" fill="white" />
      </svg>

      {/* ── LEFT COLUMN ── */}
      <div className="lp-left" style={{ position: "relative", zIndex: 1 }}>
        <motion.p className="lp-dota"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          DOTA
        </motion.p>
        <motion.p className="lp-wrapped"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
          WRAPPED
        </motion.p>
        <motion.p className="lp-year"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
          2026
        </motion.p>
        <motion.p className="lp-sub"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
          Your Dota 2 year in review.
        </motion.p>

        <motion.div className="lp-input-row"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <input
            className="lp-input"
            type="text"
            inputMode="numeric"
            placeholder="Steam ID or account ID"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
          />
          <button className="lp-btn" onClick={handleSubmit}>
            Go
          </button>
        </motion.div>

        <p className="lp-hint">Find your ID at steamid.io</p>
        {error && (
          <p style={{ color: "#FF4D30", fontSize: 13, marginTop: 6 }}>{error}</p>
        )}
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div className="lp-right">
        {/* Radial glow behind card fan */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(185,255,51,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Card fan — anchored at column center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 1,
          }}
        >
          {/* Card 1 — back */}
          <motion.div
            style={{
              position: "absolute",
              width: 220,
              height: 320,
              top: -160,
              left: -130,
              background: "linear-gradient(160deg,#1a0a2e,#0d0d1a)",
              borderRadius: 16,
            }}
            initial={{ opacity: 0, rotate: -12, x: -60 }}
            animate={{ opacity: 0.6, rotate: -8, x: -40 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Card 2 — middle */}
          <motion.div
            style={{
              position: "absolute",
              width: 230,
              height: 330,
              top: -165,
              left: -115,
              background: "linear-gradient(160deg,#1a1a0a,#0d1117)",
              borderRadius: 16,
            }}
            initial={{ opacity: 0, rotate: 8, x: 40 }}
            animate={{ opacity: 0.8, rotate: 4, x: 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Card 3 — front */}
          <motion.div
            style={{
              position: "absolute",
              width: 250,
              height: 360,
              top: -180,
              left: -125,
              backgroundColor: "#000000",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16,
              boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "20px 20px 24px",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Top branding */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Dota Wrapped
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 800 }}>2026</span>
            </div>

            {/* Center content */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <img
                src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/aegis.png"
                alt="Aegis"
                style={{ width: 64, height: 64, objectFit: "contain" }}
              />
              {/* Stat chips */}
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {["9 Cards", "Live Stats", "Shareable"].map((label) => (
                  <span
                    key={label}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "4px 12px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.5)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom rule */}
            <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)" }} />
          </motion.div>
        </div>
      </div>

      {/* SVG scribble */}
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: 0.08,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
        <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Bottom branding */}
      <p className="lp-brand">Dotawrapped.gg</p>
    </main>
    </>
  );
}
