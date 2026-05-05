"use client";

import { useState } from "react";
import type { SignatureMoves } from "@/lib/transforms";

interface Props {
  signatureMoves: SignatureMoves;
}

const DOTA_CDN = "https://cdn.cloudflare.steamstatic.com";

const shareUrl = () =>
  typeof window !== "undefined" ? window.location.href : "";

export default function Card4Matchup({ signatureMoves }: Props) {
  const {
    totalKills,
    totalDeaths,
    totalAssists,
    topItemName,
    topItemGames,
    mostPlayedHeroName,
    mostPlayedHeroCleanName,
    mostPlayedHeroWinRate,
    overallWinRate,
    mostBuiltItemKey,
  } = signatureMoves;

  const [heroBgError, setHeroBgError] = useState(false);
  const [itemIconError, setItemIconError] = useState(false);

  const heroPortraitUrl = mostPlayedHeroCleanName
    ? `${DOTA_CDN}/apps/dota2/images/dota_react/heroes/panorama/images/${mostPlayedHeroCleanName}_vert.jpg`
    : null;

  const itemIconUrl = mostBuiltItemKey
    ? `${DOTA_CDN}/apps/dota2/images/dota_react/items/${mostBuiltItemKey}.png`
    : null;

  const heroWR = parseFloat(mostPlayedHeroWinRate);
  const overallWR = parseFloat(overallWinRate);
  const heroBetter = heroWR >= overallWR;
  const heroBarColor = heroBetter ? "#22C55E" : "#EF4444";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#111",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Hero portrait — top 35% */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "35%",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {heroPortraitUrl && !heroBgError && (
          <img
            src={heroPortraitUrl}
            alt={mostPlayedHeroName}
            onError={() => setHeroBgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        )}
        {/* Bottom fade to card bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(17,17,17,0.6) 65%, #111 100%)",
          }}
        />
        {/* Hero name */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 24px 14px",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              margin: "0 0 4px 0",
            }}
          >
            Signature hero
          </p>
          <h2
            style={{
              color: "white",
              fontSize: 28,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              margin: 0,
              textShadow: "0 2px 16px rgba(0,0,0,0.9)",
            }}
          >
            {mostPlayedHeroName}
          </h2>
        </div>
        {/* Year watermark */}
        <span
          style={{
            position: "absolute",
            right: 10,
            top: "40%",
            transform: "translateY(-50%) rotate(90deg)",
            fontSize: 9,
            letterSpacing: "0.3em",
            opacity: 0.3,
            textTransform: "uppercase",
            color: "white",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          2026
        </span>
      </div>

      {/* Stats section */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "14px 24px 0",
          overflow: "hidden",
        }}
      >
        {/* Year totals label */}
        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            margin: "0 0 6px 0",
          }}
        >
          Year totals
        </p>

        {/* Separator above K/D/A */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
            marginBottom: 12,
          }}
        />

        {/* K / D / A row */}
        <div style={{ display: "flex", marginBottom: 18 }}>
          {[
            { label: "K", value: totalKills.toLocaleString(), color: "#22C55E" },
            { label: "D", value: totalDeaths.toLocaleString(), color: "#EF4444" },
            { label: "A", value: totalAssists.toLocaleString(), color: "#38BDF8" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <p
                style={{
                  color,
                  fontSize: 32,
                  fontWeight: 900,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  margin: "0 0 4px 0",
                }}
              >
                {value}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.28)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Win rate comparison */}
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              margin: "0 0 8px 0",
            }}
          >
            Win rate
          </p>
          {/* Hero WR bar */}
          <div style={{ marginBottom: 7 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {mostPlayedHeroName}
              </span>
              <span
                style={{ color: heroBarColor, fontSize: 10, fontWeight: 700 }}
              >
                {mostPlayedHeroWinRate}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(heroWR, 100)}%`,
                  backgroundColor: heroBarColor,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
          {/* Overall WR bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                Overall
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {overallWinRate}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                backgroundColor: "rgba(255,255,255,0.07)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min(overallWR, 100)}%`,
                  backgroundColor: "rgba(255,255,255,0.28)",
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
            marginBottom: 12,
          }}
        />

        {/* Most built item */}
        {topItemName && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {itemIconUrl && !itemIconError ? (
              <img
                src={itemIconUrl}
                alt={topItemName}
                width={32}
                height={32}
                onError={() => setItemIconError(true)}
                style={{
                  borderRadius: 4,
                  objectFit: "contain",
                  flexShrink: 0,
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: "0 0 3px 0",
                }}
              >
                Most built
              </p>
              <p
                style={{
                  color: "white",
                  fontSize: 13,
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                {topItemName}
                <span
                  style={{
                    color: "rgba(255,255,255,0.28)",
                    fontWeight: 400,
                    fontSize: 11,
                  }}
                >
                  {" "}
                  · {topItemGames.toLocaleString()}g
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer spacer */}
      <div style={{ height: 88, flexShrink: 0 }} />

      {/* Share button */}
      <button
        onClick={() =>
          navigator.clipboard?.writeText(shareUrl()).catch(() => {})
        }
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

      {/* Branding */}
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
    </div>
  );
}
