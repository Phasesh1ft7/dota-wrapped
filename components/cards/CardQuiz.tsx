"use client";

import { useState, useMemo } from "react";
import type { Hero, QuizMatch, ItemConstant } from "@/lib/opendota";

interface Props {
  quizMatches: QuizMatch[];
  itemConstants: Record<string, ItemConstant> | null;
  heroList: Hero[] | null;
}

type QuizState = "question" | "correct" | "wrong";

const STEAM_CDN = "https://cdn.cloudflare.steamstatic.com";

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function CardQuiz({ quizMatches, itemConstants, heroList }: Props) {
  const [state, setState] = useState<QuizState>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredBtn, setHoveredBtn] = useState<number | null>(null);
  const [hoveredReplay, setHoveredReplay] = useState(false);

  const quizMatch = quizMatches[currentIndex] ?? null;
  const heroId = quizMatch?.heroId ?? -1;

  const itemById = useMemo(() => {
    const map = new Map<number, ItemConstant>();
    for (const item of Object.values(itemConstants ?? {})) {
      map.set(item.id, item);
    }
    return map;
  }, [itemConstants]);

  const correctHero = useMemo(
    () => (heroList ?? []).find((h) => h.id === heroId) ?? null,
    [heroId, heroList],
  );

  const options = useMemo(() => {
    if (!heroList || heroId === -1 || !correctHero) return [];
    const decoys = [...heroList]
      .filter((h) => h.id !== heroId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...decoys, correctHero].sort(() => Math.random() - 0.5);
  }, [heroId, heroList, correctHero]);

  const cleanName = correctHero?.name.replace("npc_dota_hero_", "") ?? "";

  const matchIsWin = quizMatch
    ? (quizMatch.radiant_win && quizMatch.player_slot < 128) ||
      (!quizMatch.radiant_win && quizMatch.player_slot >= 128)
    : false;

  function handlePlayAgain() {
    setCurrentIndex((i) => (i + 1) % Math.max(quizMatches.length, 1));
    setState("question");
  }

  // ── Shared absolute chrome (on all states) ────────────────────────────────
  const Chrome = ({ dark = true }: { dark?: boolean }) => (
    <>
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
        }}
      >
        2026
      </span>
      <svg
        viewBox="0 0 300 80"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          opacity: dark ? 0.12 : 0.08,
          pointerEvents: "none",
          zIndex: 1,
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
    </>
  );

  // ── No data fallback ──────────────────────────────────────────────────────
  if (!quizMatch || !correctHero) {
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
        <Chrome />
        <p
          style={{
            color: "rgba(255,255,255,0.28)",
            fontSize: 13,
            letterSpacing: "0.05em",
          }}
        >
          No match data available
        </p>
      </div>
    );
  }

  // ── QUESTION STATE ────────────────────────────────────────────────────────
  if (state === "question") {
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
        <Chrome />

        {/* Dramatic two-line header */}
        <div style={{ marginBottom: 20, flexShrink: 0, position: "relative", zIndex: 1 }}>
          <p
            style={{
              color: "white",
              fontSize: 36,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            WHAT HERO
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 36,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
            }}
          >
            DID YOU PLAY?
          </p>
        </div>

        {/* Item grid 3×2 — 88×88px */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 88px)",
            gridTemplateRows: "repeat(2, 88px)",
            gap: 8,
            marginBottom: 16,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {quizMatch.items.map((itemId, idx) => {
            const item = itemId !== 0 ? itemById.get(itemId) : null;
            return (
              <div
                key={idx}
                title={item?.dname}
                style={{
                  width: 88,
                  height: 60,
                  borderRadius: 10,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  overflow: "hidden",
                }}
              >
                {item?.img && (
                  <img
                    src={`${STEAM_CDN}${item.img}`}
                    alt={item.dname}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Hero choice buttons — full-width stacked */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            position: "relative",
            zIndex: 1,
          }}
        >
          {options.map((hero, idx) => {
            const active = hoveredBtn === idx;
            const optClean = hero.name.replace("npc_dota_hero_", "");
            return (
              <button
                key={hero.id}
                onClick={() =>
                  setState(hero.id === quizMatch.heroId ? "correct" : "wrong")
                }
                onMouseEnter={() => setHoveredBtn(idx)}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  height: 64,
                  width: "100%",
                  backgroundColor: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${active ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 14px",
                  transition: "border-color 0.12s, background-color 0.12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Hero portrait circle */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    {optClean && (
                      <img
                        src={`/api/hero-image?hero=${optClean}`}
                        alt={hero.localized_name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "top center",
                        }}
                      />
                    )}
                  </div>
                  {/* Hero name */}
                  <span
                    style={{
                      color: "white",
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      textAlign: "left",
                      lineHeight: 1.1,
                    }}
                  >
                    {hero.localized_name}
                  </span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, flexShrink: 0 }}>
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacer for share button + DOTA WRAPPED */}
        <div style={{ height: 88, flexShrink: 0 }} />
      </div>
    );
  }

  // ── CORRECT / WRONG STATE ─────────────────────────────────────────────────
  const isCorrect = state === "correct";
  const accent = isCorrect ? "#B9FF33" : "#FF4D30";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Chrome />

      {/* Hero portrait — top 65% */}
      {cleanName && (
        <img
          src={`/api/hero-image?hero=${cleanName}`}
          alt={correctHero.localized_name}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "65%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      )}

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 20%, #000000 62%)",
          zIndex: 1,
        }}
      />

      {/* Branding top */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 28,
          right: 28,
          display: "flex",
          justifyContent: "space-between",
          zIndex: 3,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
          }}
        >
          Dota Wrapped
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            fontWeight: 800,
            textShadow: "0 1px 6px rgba(0,0,0,0.9)",
          }}
        >
          2026
        </span>
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: "relative",
          marginTop: "auto",
          padding: "0 28px 88px",
          zIndex: 2,
        }}
      >
        <p
          style={{
            color: accent,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: isCorrect ? 8 : 4,
          }}
        >
          {isCorrect ? "CORRECT! 🎉" : "WRONG! 😭"}
        </p>

        {!isCorrect && (
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              marginBottom: 4,
            }}
          >
            It was
          </p>
        )}

        <p
          style={{
            color: "white",
            fontSize: 40,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            marginBottom: 14,
          }}
        >
          {correctHero.localized_name}
        </p>

        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "baseline",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {quizMatch.kills}/{quizMatch.deaths}/{quizMatch.assists}
          </p>
          <p
            style={{
              color: matchIsWin ? "#B9FF33" : "#FF4D30",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {matchIsWin ? "WIN" : "LOSS"}
          </p>
        </div>

        <button
          onClick={handlePlayAgain}
          onMouseEnter={() => setHoveredReplay(true)}
          onMouseLeave={() => setHoveredReplay(false)}
          style={{
            display: "block",
            width: "100%",
            backgroundColor: hoveredReplay
              ? "rgba(255,255,255,0.12)"
              : "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.65)",
            padding: "8px 16px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "background-color 0.12s",
          }}
        >
          Play again?
        </button>
      </div>
    </div>
  );
}
