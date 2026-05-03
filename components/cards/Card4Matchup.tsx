"use client";

import type { PlayerHeroStats, Hero } from "@/lib/opendota";

interface Props {
  playerHeroes: PlayerHeroStats[];
  heroList: Hero[] | null;
}

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

function resolveHero(heroId: string, heroList: Hero[] | null) {
  const data = heroList?.find((h) => h.id === parseInt(heroId));
  return {
    cleanName: data?.name.replace("npc_dota_hero_", "") ?? "",
    heroName: data?.localized_name ?? "Unknown",
  };
}

export default function Card4Matchup({ playerHeroes, heroList }: Props) {
  const qualified = playerHeroes.filter((h) => h.against_games > 5);

  const nemesis = qualified.length > 0
    ? [...qualified].sort(
        (a, b) =>
          (b.against_games - b.against_win) / b.against_games -
          (a.against_games - a.against_win) / a.against_games,
      )[0]
    : null;

  const punchingBag = qualified.length > 0
    ? [...qualified].sort(
        (a, b) => b.against_win / b.against_games - a.against_win / a.against_games,
      )[0]
    : null;

  const nemesisHero = nemesis ? resolveHero(nemesis.hero_id, heroList) : null;
  const bagHero = punchingBag ? resolveHero(punchingBag.hero_id, heroList) : null;

  const nemesisLossPct = nemesis
    ? (((nemesis.against_games - nemesis.against_win) / nemesis.against_games) * 100).toFixed(0)
    : "0";
  const bagWinPct = punchingBag
    ? ((punchingBag.against_win / punchingBag.against_games) * 100).toFixed(0)
    : "0";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#0d0d1a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Global top branding */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 22px 0",
          zIndex: 10,
          pointerEvents: "none",
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

      {/* TOP HALF — Nemesis */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {nemesisHero?.cleanName && (
          <img
            src={`/api/hero-image?hero=${nemesisHero.cleanName}`}
            alt={nemesisHero.heroName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              filter: "saturate(0.7) brightness(0.55)",
            }}
          />
        )}
        {/* Red tint overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom,rgba(239,68,68,0.18) 0%,rgba(0,0,0,0.65) 100%)",
          }}
        />
        {/* Text — bottom-left of this half */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            left: 22,
            right: 22,
          }}
        >
          <p
            style={{
              color: "#ef4444",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Your Nemesis
          </p>
          <p
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {nemesisHero?.heroName ?? "—"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}>
            You lose{" "}
            <span style={{ color: "#ef4444", fontWeight: 800 }}>
              {nemesisLossPct}%
            </span>{" "}
            against them
          </p>
        </div>
        {/* Divider line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      </div>

      {/* BOTTOM HALF — Punching Bag */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {bagHero?.cleanName && (
          <img
            src={`/api/hero-image?hero=${bagHero.cleanName}`}
            alt={bagHero.heroName}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              filter: "saturate(0.7) brightness(0.55)",
            }}
          />
        )}
        {/* Green tint overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom,rgba(34,197,94,0.12) 0%,rgba(0,0,0,0.65) 100%)",
          }}
        />
        {/* Text — bottom-left of this half */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 22,
            right: 22,
          }}
        >
          <p
            style={{
              color: "#22c55e",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Your Punching Bag
          </p>
          <p
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            {bagHero?.heroName ?? "—"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 500 }}>
            You win{" "}
            <span style={{ color: "#22c55e", fontWeight: 800 }}>
              {bagWinPct}%
            </span>{" "}
            against them
          </p>
        </div>
      </div>

      {/* Global bottom branding */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <span style={{ ...BRAND, color: "rgba(255,255,255,0.22)" }}>
          dotawrapped.gg
        </span>
      </div>
    </div>
  );
}
