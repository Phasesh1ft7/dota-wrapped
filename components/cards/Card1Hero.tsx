"use client";

import type { ProfileData, ItemConstant, BestHeroMatchData, Match } from "@/lib/opendota";
import type { HeroStatEntry, BestHeroMatch } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  topHero: HeroStatEntry | undefined;
  bestHeroMatch: BestHeroMatch | null;
  bestHeroMatchDetails: BestHeroMatchData | null;
  itemConstants: Record<string, ItemConstant> | null;
  matches: Match[];
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card1Hero({
  profile,
  topHero,
  bestHeroMatch,
  bestHeroMatchDetails,
  itemConstants,
  matches,
}: Props) {
  if (!topHero) {
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
        <svg viewBox="0 0 300 80" style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", opacity: 0.1, pointerEvents: "none" }}>
          <path d="M-10,60 Q50,20 100,50 Q150,80 200,40 Q250,10 310,45" fill="none" stroke="white" strokeWidth="2" />
          <path d="M-10,70 Q80,40 140,65 Q200,85 310,55" fill="none" stroke="white" strokeWidth="1.5" />
        </svg>
        {/* Branding */}
        <div style={{ position: "absolute", top: 20, left: 22, right: 22, display: "flex", justifyContent: "space-between" }}>
          <span style={{ ...BRAND, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>Dota Wrapped</span>
          <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 800 }}>2026</span>
        </div>
        {/* DOTA WRAPPED bottom */}
        <p style={{ position: "absolute", bottom: 16, left: 22, fontSize: 10, letterSpacing: "0.15em", opacity: 0.35, color: "white", textTransform: "uppercase", margin: 0 }}>
          Dota Wrapped
        </p>
        {/* Content */}
        <p style={{ color: "rgba(255,255,255,0.08)", fontSize: 180, fontWeight: 900, lineHeight: 1, margin: 0, userSelect: "none" }}>?</p>
        <p style={{ color: "white", fontSize: 18, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.25em", textAlign: "center", margin: 0 }}>
          No Hero Data
        </p>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", maxWidth: 260, lineHeight: 1.5, margin: 0 }}>
          This player&apos;s hero stats aren&apos;t publicly available.
        </p>
      </div>
    );
  }

  const heroData = profile.heroList?.find((h) => h.id === topHero.hero_id);
  const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
  const imgUrl = `/api/hero-image?hero=${cleanName}`;
  const isGoodWr = parseFloat(topHero.winRate) >= 50;
  const wr = parseFloat(topHero.winRate);

  console.log('matches count:', matches?.length);
  console.log('topHero.hero_id:', topHero?.hero_id);
  console.log('filtered hero matches:', matches?.filter((m) => m.hero_id === topHero?.hero_id).length);

  // Fallback: compute best game directly from matches if prop is null
  const bestGame: BestHeroMatch | null = bestHeroMatch ?? (() => {
    if (!topHero || matches.length === 0) return null;
    const heroMatches = matches.filter((m) => m.hero_id === topHero.hero_id);
    if (heroMatches.length === 0) return null;
    const best = [...heroMatches].sort((a, b) => b.kills - a.kills)[0];
    const win =
      (best.radiant_win && best.player_slot < 128) ||
      (!best.radiant_win && best.player_slot >= 128);
    const m = Math.floor(best.duration / 60);
    const s = best.duration % 60;
    return {
      kills: best.kills,
      deaths: best.deaths,
      assists: best.assists,
      duration: `${m}m ${String(s).padStart(2, "0")}s`,
      isWin: win,
      matchId: best.match_id,
    };
  })();

  // Build item lookup map
  const itemById = new Map<number, { key: string; dname: string }>();
  for (const [key, item] of Object.entries(itemConstants ?? {})) {
    itemById.set(item.id, { key, dname: item.dname });
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Hero portrait — top 45% section */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(160deg, #1a0a2e, #0d0d1a)",
          overflow: "hidden",
        }}
      >
        {cleanName && (
          <img
            src={imgUrl}
            alt={topHero.heroName}
            onError={(e) => { e.currentTarget.style.opacity = "0"; }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 15%",
            }}
          />
        )}
      </div>

      {/* Gradient overlay — bottom 55% */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top,#000000 0%,#000000 45%,rgba(0,0,0,0.7) 58%,transparent 72%)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding row */}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ ...BRAND, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>Dota Wrapped</span>
        <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>2026</span>
      </div>

      {/* Bottom stats */}
      <div style={{ position: "relative" }}>

        {/* Hero label + name */}
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>
          Your Most Played Hero
        </p>
        <h2 style={{ color: "white", fontSize: 36, fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.04em", textTransform: "uppercase", marginBottom: 12 }}>
          {topHero.heroName}
        </h2>

        {/* ── KDA row ── */}
        {bestGame && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
              Best Game
            </p>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* K / D / A */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#B9FF33", fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>{bestGame.kills}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Kills</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, paddingBottom: 10 }}>/</span>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#FF4D30", fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>{bestGame.deaths}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Deaths</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 16, paddingBottom: 10 }}>/</span>
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "white", fontSize: 28, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.03em" }}>{bestGame.assists}</p>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Assists</p>
                </div>
              </div>

              {/* WIN/LOSS + duration pushed right */}
              <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{
                  backgroundColor: bestGame.isWin ? "#B9FF33" : "#FF4D30",
                  color: bestGame.isWin ? "#000" : "#fff",
                  fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "2px 8px", borderRadius: 10,
                }}>
                  {bestGame.isWin ? "WIN" : "LOSS"}
                </span>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 }}>
                  {bestGame.duration.split(" ")[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Stats grid (GPM / CS / Duration / Games) ── */}
        <div style={{ display: "flex", gap: 0, marginBottom: 10, borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, paddingBottom: 8 }}>
          {[
            {
              value: bestHeroMatchDetails?.isParsed && bestHeroMatchDetails.gpm !== null
                ? String(bestHeroMatchDetails.gpm) : "—",
              label: "GOLD/MIN",
            },
            {
              value: bestHeroMatchDetails?.isParsed && bestHeroMatchDetails.lastHits !== null
                ? String(bestHeroMatchDetails.lastHits) : "—",
              label: "CS",
            },
            {
              value: bestGame ? bestGame.duration.split(" ")[0] : "—",
              label: "DURATION",
            },
            {
              value: topHero.games.toLocaleString(),
              label: "GAMES",
            },
          ].map((stat, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
              <p style={{ color: "white", fontSize: 15, fontWeight: 800, lineHeight: 1, marginBottom: 3 }}>{stat.value}</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Items grid (3×2) ── */}
        {bestHeroMatchDetails?.isParsed && bestHeroMatchDetails.items.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5, marginBottom: 10 }}>
            {bestHeroMatchDetails.items.slice(0, 6).map((itemId: number, idx: number) => {
              const entry = itemById.get(itemId);
              return (
                <div key={idx} title={entry?.dname}
                  style={{ height: 34, borderRadius: 6, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {entry && (
                    <img
                      src={`${DOTA_CDN}/apps/dota2/images/dota_react/items/${entry.key}.png`}
                      alt={entry.dname}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : bestHeroMatchDetails && !bestHeroMatchDetails.isParsed ? (
          <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 10, fontStyle: "italic", marginBottom: 10 }}>
            Match not parsed — item data unavailable
          </p>
        ) : null}

        {/* ── Win rate bar ── */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Win Rate on This Hero
            </p>
            <p style={{ color: isGoodWr ? "#B9FF33" : "#FF4D30", fontSize: 13, fontWeight: 700 }}>
              {topHero.winRate}%
            </p>
          </div>
          <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${Math.min(wr, 100)}%`, backgroundColor: isGoodWr ? "#B9FF33" : "#FF4D30", borderRadius: 3 }} />
          </div>
        </div>

        {/* ── Lifetime W/L on this hero ── */}
        <div style={{ marginTop: 10, marginBottom: 6 }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontVariant: "small-caps", marginBottom: 6 }}>
            Lifetime on This Hero
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <p style={{ color: "#B9FF33", fontSize: 20, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                {topHero.wins.toLocaleString()}
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Wins</p>
            </div>
            <div>
              <p style={{ color: "#FF4D30", fontSize: 20, fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>
                {(topHero.games - topHero.wins).toLocaleString()}
              </p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 7, textTransform: "uppercase", letterSpacing: "0.12em" }}>Losses</p>
            </div>
          </div>
        </div>

        <p style={{ ...BRAND, textAlign: "center", color: "rgba(255,255,255,0.22)", marginTop: 4 }}>
          dotawrapped.gg
        </p>
      </div>
    </div>
  );
}
