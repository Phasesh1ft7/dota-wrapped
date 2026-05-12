import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const playerName = searchParams.get("playerName") ?? "Dota Player";
  const heroName = searchParams.get("heroName") ?? "Unknown Hero";
  const heroCleanName = searchParams.get("heroCleanName") ?? "";
  const rank = searchParams.get("rank") ?? "Unranked";
  const winRate = searchParams.get("winRate") ?? "0";
  const careerGames = searchParams.get("careerGames") ?? "0";

  const heroImageUrl = heroCleanName
    ? `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${heroCleanName}_full.png`
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(135deg, #0a0a0f 0%, #0d1a26 100%)",
          padding: "60px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Hero image background */}
        {heroImageUrl && (
          <img
            src={heroImageUrl}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "50%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, #0a0a0f 45%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              color: "#c8a84b",
              letterSpacing: "4px",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            DOTA WRAPPED 2026
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              display: "flex",
            }}
          >
            {playerName}
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#9ef01a",
              fontWeight: 700,
              display: "flex",
            }}
          >
            {rank}
          </div>

          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#fff",
                  display: "flex",
                }}
              >
                {careerGames}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#8a9bb0",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                CAREER GAMES
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#9ef01a",
                  display: "flex",
                }}
              >
                {winRate}%
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#8a9bb0",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                WIN RATE
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#fff",
                  display: "flex",
                }}
              >
                {heroName}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#8a9bb0",
                  letterSpacing: "2px",
                  display: "flex",
                }}
              >
                TOP HERO
              </div>
            </div>
          </div>
        </div>

        {/* Bottom watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "32px",
            fontSize: "14px",
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "3px",
            display: "flex",
          }}
        >
          DOTAWRAPPED.GG
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
