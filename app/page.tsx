"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CSS = `
  .lw {
    display: flex;
    flex-direction: row;
    min-height: 100vh;
  }

  /* ── LEFT HALF ── */
  .ll {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 72px;
    position: relative;
  }

  /* ── RIGHT HALF ── */
  .lr {
    width: 50%;
    position: relative;
    overflow: hidden;
  }

  /* ── Headline ── */
  .hl-your {
    color: rgba(255,255,255,0.32);
    font-size: 72px;
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -4px;
    margin: 0;
    animation: fadeUp 0.5s ease 0s both;
  }
  .hl-dota {
    color: white;
    font-size: 96px;
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -4px;
    margin: 0;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .hl-wrapped {
    color: white;
    font-size: 96px;
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -4px;
    margin: 0;
    animation: fadeUp 0.5s ease 0.2s both;
  }

  .subtext {
    color: rgba(255,255,255,0.4);
    font-size: 16px;
    line-height: 1.55;
    margin-top: 32px;
    margin-bottom: 28px;
    animation: fadeUp 0.5s ease 0.3s both;
  }

  .input-section {
    animation: fadeUp 0.5s ease 0.44s both;
    max-width: 400px;
  }
  .input-row {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }
  .sid-input {
    flex: 1;
    min-width: 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 14px 18px;
    color: white;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s;
  }
  .sid-input::placeholder { color: rgba(255,255,255,0.28); }
  .sid-input:focus { border-color: rgba(255,255,255,0.28); }

  .go-btn {
    background: white;
    color: black;
    border: none;
    border-radius: 8px;
    padding: 14px 28px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.15s;
  }
  .go-btn:hover { opacity: 0.82; }
  .go-btn:active { opacity: 0.6; }

  .smallprint {
    color: rgba(255,255,255,0.26);
    font-size: 12px;
    margin-top: 10px;
    line-height: 1.5;
  }
  .brand-btm {
    position: absolute;
    bottom: 40px;
    left: 72px;
    color: rgba(255,255,255,0.18);
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  /* ── Animated blobs ── */
  .blob1 {
    position: absolute;
    width: 75%;
    height: 75%;
    top: -10%;
    left: 5%;
    background: radial-gradient(ellipse, rgba(88,28,135,1) 0%, transparent 65%);
    opacity: 0.15;
    pointer-events: none;
    animation: glow1 18s ease-in-out infinite;
  }
  .blob2 {
    position: absolute;
    width: 60%;
    height: 60%;
    bottom: -5%;
    right: -5%;
    background: radial-gradient(ellipse, rgba(127,29,29,1) 0%, transparent 65%);
    opacity: 0.15;
    pointer-events: none;
    animation: glow2 24s ease-in-out infinite;
  }

  /* ── Preview cards ── */
  .pc {
    position: absolute;
    width: 185px;
    height: 275px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.09);
    padding: 18px 16px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 32px 80px rgba(0,0,0,0.75);
  }
  .pc-brand {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .pc-lbl {
    color: rgba(255,255,255,0.38);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .pc-yr {
    color: rgba(255,255,255,0.55);
    font-size: 11px;
    font-weight: 800;
  }
  .pc-tag {
    color: rgba(255,255,255,0.42);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes glow1 {
    0%,100% { transform: scale(1) translate(0,0); }
    33%     { transform: scale(1.3) translate(20%,-20%); }
    66%     { transform: scale(0.8) translate(-10%,25%); }
  }
  @keyframes glow2 {
    0%,100% { transform: scale(1.1) translate(0,0); }
    33%     { transform: scale(0.85) translate(-25%,15%); }
    66%     { transform: scale(1.25) translate(12%,-14%); }
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .lw    { flex-direction: column; }
    .ll    { width: 100%; padding: 72px 32px 96px; justify-content: flex-start; }
    .lr    { display: none; }
    .hl-your    { font-size: 48px; }
    .hl-dota    { font-size: 64px; }
    .hl-wrapped { font-size: 64px; }
    .brand-btm  { left: 32px; }
    .input-section { max-width: 100%; }
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
    <main style={{ backgroundColor: "#000000", position: "relative", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="lw">

        {/* ── LEFT HALF ── */}
        <div className="ll">
          {/* Stacked headline */}
          <div>
            <p className="hl-your">YOUR</p>
            <p className="hl-dota">DOTA</p>
            <p className="hl-wrapped">WRAPPED</p>
          </div>

          <p className="subtext">
            Enter your Steam ID to see your<br />2026 Dota stats.
          </p>

          {/* Input row */}
          <div className="input-section">
            <div className="input-row">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter Steam ID or account ID"
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                className="sid-input"
              />
              <button onClick={handleSubmit} className="go-btn">
                Go
              </button>
            </div>

            {error && (
              <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8 }}>
                {error}
              </p>
            )}

            <p className="smallprint">
              Your Steam64 ID or account ID. Find it at steamid.io
            </p>
          </div>

          <p className="brand-btm">Dotawrapped.gg</p>
        </div>

        {/* ── RIGHT HALF ── */}
        <div className="lr">
          {/* Slow animated gradient blobs */}
          <div className="blob1" />
          <div className="blob2" />

          {/* Subtle vertical divider */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1,
              height: "100%",
              backgroundColor: "rgba(255,255,255,0.06)",
              pointerEvents: "none",
            }}
          />

          {/* Card fan — anchored to right half center */}
          <div style={{ position: "absolute", top: "50%", left: "50%" }}>

            {/* Card 1 — Top Hero (deep indigo) */}
            <div
              className="pc"
              style={{
                background: "linear-gradient(148deg,#0c0a22,#25226a)",
                top: -147,
                left: -175,
                transform: "rotate(-3deg)",
                zIndex: 1,
                animation: "fadeIn 0.7s ease 0.6s both",
              }}
            >
              <div className="pc-brand">
                <span className="pc-lbl">Dota Wrapped</span>
                <span className="pc-yr">2026</span>
              </div>
              <div>
                <p className="pc-tag">Your Most Played</p>
                <p style={{
                  fontSize: 44,
                  lineHeight: 1,
                  marginBottom: 6,
                }}>⚔️</p>
                <p style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>Top Hero</p>
              </div>
            </div>

            {/* Card 2 — Hours Lost (dark crimson) */}
            <div
              className="pc"
              style={{
                background: "linear-gradient(148deg,#150808,#581212)",
                top: -137,
                left: -90,
                transform: "rotate(0deg)",
                zIndex: 2,
                animation: "fadeIn 0.7s ease 0.8s both",
              }}
            >
              <div className="pc-brand">
                <span className="pc-lbl">Dota Wrapped</span>
                <span className="pc-yr">2026</span>
              </div>
              <div>
                <p className="pc-tag">Time Played</p>
                <p style={{
                  color: "#ef4444",
                  fontSize: 64,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-4px",
                  marginBottom: 2,
                }}>???</p>
                <p style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}>Hours</p>
              </div>
            </div>

            {/* Card 3 — Summary (dark teal) */}
            <div
              className="pc"
              style={{
                background: "linear-gradient(148deg,#071413,#0e3c3a)",
                top: -127,
                left: -5,
                transform: "rotate(3deg)",
                zIndex: 3,
                animation: "fadeIn 0.7s ease 1.0s both",
              }}
            >
              <div className="pc-brand">
                <span className="pc-lbl">Dota Wrapped</span>
                <span className="pc-yr">2026</span>
              </div>
              <div>
                <p className="pc-tag">Your Year</p>
                <p style={{ fontSize: 44, lineHeight: 1, marginBottom: 6 }}>📊</p>
                <p style={{
                  color: "white",
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>Summary</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SVG hand-drawn scribble at bottom */}
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
    </main>
  );
}
