"use client";

import type { ProfileData } from "@/lib/opendota";
import type { HeroStatEntry } from "@/lib/transforms";

interface HeroCardProps {
  profile: ProfileData;
  topHero: HeroStatEntry;
}

export default function HeroCard({ profile, topHero }: HeroCardProps) {
  // npc_dota_hero_templar_assassin → templar_assassin
  const heroInternalName = (
    profile.heroList?.find((h) => h.id === topHero.hero_id)?.name ?? ""
  ).replace("npc_dota_hero_", "");

  // Produces e.g. .../images/heroes/templar_assassin_full.png
  const portraitUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/heroes/${heroInternalName}_full.png`;

  return (
    <section
      style={{
        // Break out of any max-w parent — left: 50% + translateX(-50%) = full bleed
        position: "relative",
        width: "100vw",
        left: "50%",
        transform: "translateX(-50%)",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0d1117",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* Full-viewport portrait — no rounding, no constraints */}
      <img
        src={portraitUrl}
        alt={topHero.heroName}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          objectPosition: "top",
        }}
      />

      {/* Gradient — bottom third only */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "33%",
          background: "linear-gradient(to top, #0d1117 0%, transparent 100%)",
        }}
      />

      {/* Stats anchored to bottom-left */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          paddingBottom: "3rem",
          paddingLeft: "2rem",
        }}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
          Most Played Hero
        </p>

        <h2 className="text-5xl font-black text-white leading-none tracking-tight">
          {topHero.heroName}
        </h2>

        <div className="flex gap-10 items-end">
          <div className="flex flex-col gap-1">
            <span className="text-6xl font-black text-white leading-none">
              {topHero.games}
            </span>
            <span className="text-sm uppercase tracking-widest text-white/60">
              Games
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span
              className="text-6xl font-black leading-none"
              style={{
                color:
                  parseFloat(topHero.winRate) >= 50 ? "#3fb950" : "#f85149",
              }}
            >
              {topHero.winRate}%
            </span>
            <span className="text-sm uppercase tracking-widest text-white/60">
              Win Rate
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
