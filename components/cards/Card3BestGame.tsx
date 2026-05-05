"use client";

import { motion } from "framer-motion";
import type { BestGameData, BestGameBenchmarks, ItemConstant } from "@/lib/opendota";

interface Props {
  bestGame: BestGameData | null;
  itemConstants: Record<string, ItemConstant> | null;
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

function durationShort(d: string): string {
  // d is "42m 30s" — return just "42m"
  return d.split(" ")[0];
}

export default function Card3BestGame({ bestGame, itemConstants }: Props) {
  if (!bestGame) {
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
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "0 32px 88px",
        }}
      >
        {/* SVG scribble */}
        <svg
          viewBox="0 0 300 80"
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", opacity: 0.1, pointerEvents: "none" }}
        >
          <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
          <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
        {/* DOTA WRAPPED branding */}
        <p style={{ position: "absolute", bottom: 16, left: 28, fontSize: 10, letterSpacing: "0.15em", opacity: 0.35, color: "white", textTransform: "uppercase", margin: 0 }}>
          Dota Wrapped
        </p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 120, fontWeight: 900, lineHeight: 1, margin: 0 }}>?</p>
        <p style={{ color: "white", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", textAlign: "center", margin: 0 }}>
          No Match Data
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", maxWidth: 260, lineHeight: 1.5, margin: 0 }}>
          OpenDota hasn&apos;t tracked this player&apos;s matches yet.
        </p>
      </div>
    );
  }

  const {
    kills, deaths, assists, lastHits, gpm,
    heroCleanName, heroName, duration, isWin, isParsed, items, benchmarks,
  } = bestGame;

  // Pre-compute benchmark display items
  type BenchRow = { key: string; label: string; name: string; data: { raw: number; pct: number } };
  const benchRows: BenchRow[] = (
    [
      { key: "gold_per_min",        label: "GOLD / MIN",    name: "GPM",          data: benchmarks?.gold_per_min ?? null },
      { key: "last_hits_per_min",   label: "LAST HITS",     name: "CS",           data: benchmarks?.last_hits_per_min ?? null },
      { key: "hero_damage_per_min", label: "HERO DAMAGE",   name: "DAMAGE",       data: benchmarks?.hero_damage_per_min ?? null },
      { key: "tower_damage",        label: "TOWER DAMAGE",  name: "TOWER DAMAGE", data: benchmarks?.tower_damage ?? null },
    ] as Array<{ key: string; label: string; name: string; data: { raw: number; pct: number } | null }>
  ).filter((b): b is BenchRow => b.data !== null);

  const topBench: BenchRow | null = benchRows.length > 0
    ? [...benchRows].sort((a, b) => b.data.pct - a.data.pct)[0]
    : null;

  // Build id→{key, img} map for item icons
  const itemById = new Map<number, { key: string; img: string; dname: string }>();
  for (const [key, item] of Object.entries(itemConstants ?? {})) {
    itemById.set(item.id, { key, img: item.img, dname: item.dname });
  }

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
        padding: "20px 28px 0 28px",
      }}
    >
      {/* Hero image — full bleed */}
      {heroCleanName && (
        <img
          src={`/api/hero-image?hero=${heroCleanName}`}
          alt={heroName}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />
      )}

      {/* Heavy gradient overlay — bottom 65% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, #000000 0%, #000000 40%, rgba(0,0,0,0.8) 58%, transparent 78%)",
          pointerEvents: "none",
        }}
      />

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

      {/* Top branding */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          Your Best Game
        </p>
        <span
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 800,
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          2026
        </span>
      </div>

      {/* Spacer — lets hero portrait show through */}
      <div style={{ flex: 1, minHeight: 60 }} />

      {/* Bottom content — anchored below hero image */}
      <div style={{ position: "relative", zIndex: 2, flexShrink: 0 }}>

        {/* Hero name + WIN/LOSS badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            }}
          >
            {heroName}
          </p>
          <span
            style={{
              backgroundColor: isWin ? "#B9FF33" : "#FF4D30",
              color: isWin ? "#000" : "#fff",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            {isWin ? "WIN" : "LOSS"}
          </span>
        </div>

        {/* Middle stats row — 4 columns */}
        <div
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 14,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            paddingTop: 10,
            paddingBottom: 10,
          }}
        >
          {[
            {
              value: `${kills}/${deaths}/${assists}`,
              label: "KDA",
              color: "#B9FF33",
              mono: true,
            },
            {
              value: isParsed && gpm !== null
                ? String(gpm)
                : <span style={{ color: "#666", fontSize: "0.85em" }}>N/A</span>,
              label: "GOLD/MIN",
              color: "white",
              mono: false,
            },
            {
              value: isParsed && lastHits !== null
                ? String(lastHits)
                : <span style={{ color: "#666", fontSize: "0.85em" }}>N/A</span>,
              label: "CS",
              color: "white",
              mono: false,
            },
            {
              value: durationShort(duration),
              label: "DURATION",
              color: "white",
              mono: false,
            },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : undefined,
              }}
            >
              <p
                style={{
                  color: stat.color,
                  fontSize: stat.mono ? 13 : 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: stat.mono ? "-0.02em" : "-0.03em",
                  marginBottom: 4,
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Unparsed notice */}
        {!isParsed && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontStyle: "italic", marginBottom: 4 }}>
              Match not parsed — item data unavailable
            </p>
            <a
              href={`https://www.opendota.com/matches/${bestGame.matchId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#BFFF00", fontSize: 12, textDecoration: "none" }}
            >
              View on OpenDota →
            </a>
          </div>
        )}

        {/* Inventory section */}
        {isParsed && items.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 6,
              marginBottom: 0,
            }}
          >
            {items.slice(0, 6).map((itemId, idx) => {
              const entry = itemById.get(itemId);
              return (
                <div
                  key={idx}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    height: 44,
                  }}
                  title={entry?.dname}
                >
                  {entry && (
                    <img
                      src={`${DOTA_CDN}/apps/dota2/images/dota_react/items/${entry.key}.png`}
                      alt={entry.dname}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : null}

        {/* ── Benchmarks section ── */}
        {isParsed ? (
          benchRows.length > 0 ? (
            <div style={{ marginTop: 10 }}>
              {/* Headline */}
              {topBench && (
                <p style={{ color: "white", fontSize: 12, fontWeight: 700, lineHeight: 1.35, marginBottom: 8 }}>
                  YOUR {topBench.name} WAS BETTER THAN{" "}
                  {Math.round(topBench.data.pct * 100)}% OF PLAYERS
                </p>
              )}
              {/* Label */}
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontVariant: "small-caps", marginBottom: 8 }}>
                How You Compared
              </p>
              {/* Bars */}
              {benchRows.map((b, bIdx) => {
                const pct = b.data.pct;
                const color = pct >= 0.8 ? "#B9FF33" : pct >= 0.5 ? "white" : "#FF4D30";
                const topPct = Math.round((1 - pct) * 100);
                return (
                  <div key={b.key} style={{ marginBottom: 7 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {b.label}
                      </span>
                      <span style={{ color, fontSize: 10, fontWeight: 700 }}>
                        TOP {topPct}%
                      </span>
                    </div>
                    <div style={{ height: 4, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${Math.round(pct * 100)}%` }}
                        transition={{ duration: 0.8, delay: bIdx * 0.15, ease: "easeOut" }}
                        style={{ height: "100%", backgroundColor: color, borderRadius: 2 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontStyle: "italic", marginTop: 10, textAlign: "center" }}>
              Benchmark data unavailable
            </p>
          )
        ) : (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            Enable match parsing on opendota.com{"\n"}to see benchmark comparisons
          </p>
        )}

        {/* Spacer for share button + DOTA WRAPPED */}
        <div style={{ height: 88 }} />
      </div>
    </div>
  );
}
