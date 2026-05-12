"use client";

import { useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { resolveSteamId } from "@/app/actions/resolveSteamId";
import type { ResolveResult } from "@/app/actions/resolveSteamId";
import { motion, useReducedMotion } from "framer-motion";
import HeroMosaicBackground from "@/components/HeroMosaicBackground";
import GoldRain from "@/components/GoldRain";

const CSS = `
  * { box-sizing: border-box; }

  @keyframes radiancePulse {
    0%   { transform: translate(-50%,-50%) scale(0.95); opacity: 0.6; }
    50%  { transform: translate(-50%,-50%) scale(1.05); opacity: 0.3; }
    100% { transform: translate(-50%,-50%) scale(0.95); opacity: 0.6; }
  }

  .lp {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: transparent;
    position: relative;
    z-index: 3;
    padding: 48px 24px;
  }

  @keyframes dotaShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes chromaFlicker {
    0%,  100% { text-shadow: -3px 0 rgba(255,0,0,0.7),   3px 0 rgba(0,255,255,0.7); }
    25%        { text-shadow: -4px 0 rgba(255,0,0,0.5),   4px 0 rgba(0,255,255,0.5); }
    50%        { text-shadow: -2px 0 rgba(255,0,0,0.9),   2px 0 rgba(0,255,255,0.9); }
    75%        { text-shadow: -5px 0 rgba(255,0,0,0.4),   5px 0 rgba(0,255,255,0.4); }
  }

  .lp-dota {
    font-size: clamp(64px, 10vw, 120px);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -2px;
    margin: 0;
    background: linear-gradient(
      135deg,
      #ff6b1a 0%,
      #ffaa00 20%,
      #ffd700 35%,
      #4a90d9 55%,
      #2d6bb5 70%,
      #1a3a6b 100%
    );
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    background-size: 200% 200%;
    animation: dotaShift 8s ease infinite;
  }

  .lp-wrapped {
    font-size: clamp(64px, 10vw, 120px);
    font-weight: 900;
    line-height: 0.9;
    letter-spacing: -2px;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .lp-dota {
      animation: none;
      background-position: 0% 50%;
    }
    .lp-wrapped {
      animation: none;
    }
  }

  .lp-year {
    color: #c8a84b;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 8px;
    text-transform: uppercase;
    margin: 12px 0 0;
  }

  .lp-sub {
    color: #7a9bb5;
    font-size: 16px;
    font-weight: 400;
    margin: 16px 0 0;
    line-height: 1.5;
  }

  .lp-search {
    display: flex;
    width: 90%;
    max-width: 480px;
    margin-top: 40px;
  }

  .lp-input {
    flex: 1;
    background: #111111;
    border: 1px solid rgba(255,255,255,0.15);
    border-right: none;
    border-radius: 8px 0 0 8px;
    padding: 14px 20px;
    color: #ffffff;
    font-size: 16px;
    outline: none;
    transition: border-color 0.15s;
  }
  .lp-input::placeholder { color: rgba(255,255,255,0.3); }
  .lp-input:focus { border-color: rgba(255,255,255,0.35); }

  .lp-btn {
    background: #4a90d9;
    color: #ffffff;
    border: none;
    border-radius: 0 8px 8px 0;
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
  .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .lp-hint {
    color: #7a9bb5;
    font-size: 12px;
    margin-top: 8px;
  }

  .lp-pills {
    display: flex;
    gap: 8px;
    margin-top: 32px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .lp-pill {
    border: 1px solid rgba(74,144,217,0.3);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 11px;
    color: #7a9bb5;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .lp-brand {
    position: fixed;
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

  @media (max-width: 480px) {
    .lp-search { width: 100%; }
  }
`;


export default function HomePage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ResolveResult | null, FormData>(resolveSteamId, null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    if (state?.accountId) {
      router.push(`/wrapped/${state.accountId}`);
    }
  }, [state, router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          overflowX: "hidden",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%), #000",
        }}
      >
        <HeroMosaicBackground />
        <GoldRain />

        <main className="lp">
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {!shouldReduceMotion && (
              <div style={{ position: "absolute", top: "50%", left: "50%", zIndex: 0, pointerEvents: "none" }}>
                {/* Radial glow */}
                <div style={{
                  position: "absolute",
                  width: 700,
                  height: 700,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: "radial-gradient(ellipse at center, rgba(255,100,0,0.08) 0%, transparent 70%)",
                  borderRadius: "50%",
                }} />
                {(
                  [
                    { size: 220, color: "rgba(255,140,0,0.4)",  delay: "0s" },
                    { size: 400, color: "rgba(255,80,0,0.25)",  delay: "1s" },
                    { size: 600, color: "rgba(255,200,0,0.15)", delay: "2s" },
                  ] as { size: number; color: string; delay: string }[]
                ).map(({ size, color, delay }, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: size,
                      height: size,
                      borderRadius: "50%",
                      border: `2px solid ${color}`,
                      top: "50%",
                      left: "50%",
                      animation: `radiancePulse 3s ease-in-out ${delay} infinite`,
                      willChange: "transform, opacity",
                      transformOrigin: "center center",
                    }}
                  />
                ))}
              </div>
            )}

            <motion.p
              className="lp-dota"
              style={{ position: "relative", zIndex: 1 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              DOTA
            </motion.p>
            <motion.p
              className="lp-wrapped"
              style={{
                position: "relative",
                zIndex: 1,
                background: "linear-gradient(135deg, #4a90d9 0%, #c8a84b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              WRAPPED
            </motion.p>
            <motion.p
              className="lp-year"
              style={{ position: "relative", zIndex: 1 }}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              2026
            </motion.p>
          </div>
          <motion.p
            className="lp-sub"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            How bad was your 2026, really?
          </motion.p>

          <motion.div
            className="lp-search"
            style={{ position: "relative", zIndex: 1 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <form action={formAction} style={{ display: "contents" }}>
              <input
                className="lp-input"
                type="text"
                name="steamInput"
                placeholder="Steam ID, Steam64 or profile URL"
                autoComplete="off"
              />
              <button className="lp-btn" type="submit" disabled={isPending}>
                {isPending ? "RESOLVING..." : "UNWRAP"}
              </button>
            </form>
          </motion.div>

          {state?.error && (
            <p style={{ color: "#ef4444", fontSize: 13, marginTop: 8, position: "relative", zIndex: 1 }}>{state.error}</p>
          )}


        </main>

        <p className="lp-brand">Dotawrapped.gg</p>
      </div>
    </>
  );
}
