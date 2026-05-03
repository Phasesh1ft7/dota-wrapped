"use client";

import type { ProfileData } from "@/lib/opendota";
import type { HeroStatEntry } from "@/lib/transforms";

interface Props {
  profile: ProfileData;
  topHero: HeroStatEntry | undefined;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card1Hero({ profile, topHero }: Props) {
  // NOTE: profile is ProfileData — no .heroes field. Hero data arrives via topHero (HeroStatEntry).
  console.log('CARD1 HEROES:', 'topHero:', JSON.stringify(topHero), 'heroList length:', profile?.heroList?.length, 'first heroList:', JSON.stringify(profile?.heroList?.[0]));
  if (!topHero) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(160deg,#2e1065,#4f46e5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
          No hero data
        </p>
      </div>
    );
  }

  const heroData = profile.heroList?.find((h) => h.id === topHero.hero_id);
  if (!heroData) {
    console.log("[Card1Hero] heroData not found for hero_id:", topHero.hero_id, "heroList length:", profile.heroList?.length ?? 0);
  }
  const cleanName = heroData?.name.replace("npc_dota_hero_", "") ?? "";
  const imgUrl = `/api/hero-image?hero=${cleanName}`;
  const isGoodWr = parseFloat(topHero.winRate) >= 50;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#0d1117",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Hero portrait — full bleed behind */}
      {cleanName && (
        <img
          src={imgUrl}
          alt={topHero.heroName}
          crossOrigin="anonymous"
          onLoad={() => console.log("Final image URL:", imgUrl)}
          onError={(e) => console.log("Failed URL:", e.currentTarget.src)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
      )}

      {/* Gradient overlay — bottom 50% */}
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "55%",
          background:
            "linear-gradient(to top,#000 0%,rgba(0,0,0,0.75) 55%,transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding row */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <span style={{ ...BRAND, textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}>
          Dota Wrapped
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.65)",
            fontSize: 13,
            fontWeight: 800,
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}
        >
          2026
        </span>
      </div>

      {/* Bottom stats */}
      <div style={{ position: "relative" }}>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          Your Most Played Hero
        </p>

        <h2
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}
        >
          {topHero.heroName}
        </h2>

        <div style={{ display: "flex", gap: 36, marginBottom: 20 }}>
          <div>
            <p
              style={{
                color: "white",
                fontSize: 46,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {topHero.games}
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Games
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 46,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 4,
                color: isGoodWr ? "#4ade80" : "#f87171",
              }}
            >
              {topHero.winRate}%
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Win Rate
            </p>
          </div>
        </div>

        <p
          style={{
            ...BRAND,
            textAlign: "center",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          dotawrapped.gg
        </p>
      </div>
    </div>
  );
}
