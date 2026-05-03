"use client";

import { useState, useRef, useCallback } from "react";
import type { ProfileData } from "@/lib/opendota";
import type { HeroStatEntry, Streaks, RoleBreakdown } from "@/lib/transforms";
import Card1Hero from "@/components/cards/Card1Hero";
import Card2Hours from "@/components/cards/Card2Hours";
import Card3Streak from "@/components/cards/Card3Streak";
import Card4Role from "@/components/cards/Card4Role";
import Card5Summary from "@/components/cards/Card5Summary";

interface Props {
  profile: ProfileData;
  heroStats: HeroStatEntry[];
  totalHours: number;
  streaks: Streaks;
  roleBreakdown: RoleBreakdown;
  totalGames: number;
  yearWinRate: string;
}

const TILES = [
  {
    id: 1,
    title: "Your Hero",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
  },
  {
    id: 2,
    title: "Hours Lost",
    gradient: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
  },
  {
    id: 3,
    title: "Your Streak",
    gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
  },
  {
    id: 4,
    title: "Your Role",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
  },
  {
    id: 5,
    title: "Year in Review",
    gradient: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
  },
] as const;

const ROLE_LABELS: Record<string, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  support: "Support",
};

export default function WrappedCards({
  profile,
  heroStats,
  totalHours,
  streaks,
  roleBreakdown,
  totalGames,
  yearWinRate,
}: Props) {
  const topHero = heroStats[0];
  const [openCard, setOpenCard] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = `dota-wrapped-${openCard}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, [openCard]);

  function tileStat(id: number): string {
    switch (id) {
      case 1:
        return topHero?.heroName ?? "—";
      case 2:
        return `${totalHours}h`;
      case 3:
        return String(streaks.bestWinStreak);
      case 4: {
        const dominant = (
          Object.entries(roleBreakdown) as [string, number][]
        ).sort((a, b) => b[1] - a[1])[0];
        return ROLE_LABELS[dominant?.[0] ?? ""] ?? "—";
      }
      case 5:
        return totalGames.toLocaleString();
      default:
        return "—";
    }
  }

  function renderCard(id: number): React.ReactNode {
    switch (id) {
      case 1:
        return <Card1Hero profile={profile} topHero={topHero} />;
      case 2:
        return <Card2Hours totalHours={totalHours} totalGames={totalGames} />;
      case 3:
        return <Card3Streak streaks={streaks} />;
      case 4:
        return <Card4Role roleBreakdown={roleBreakdown} />;
      case 5:
        return (
          <Card5Summary
            profile={profile}
            heroStats={heroStats}
            totalHours={totalHours}
            yearWinRate={yearWinRate}
            totalGames={totalGames}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      {/* ── Grid page ── */}
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0d1117",
          padding: "36px 20px 48px",
        }}
      >
        {/* Player header */}
        {profile.player && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 32,
            }}
          >
            <img
              src={profile.player.profile.avatarmedium}
              alt={profile.player.profile.personaname}
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.1)",
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                {profile.player.profile.personaname}
              </p>
              <p
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  margin: 0,
                }}
              >
                Dota Wrapped
              </p>
            </div>
          </div>
        )}

        {/* 2-column tile grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => setOpenCard(tile.id)}
              style={{
                gridColumn: tile.id === 5 ? "1 / -1" : undefined,
                background: tile.gradient,
                border: "none",
                borderRadius: 16,
                cursor: "pointer",
                padding: "18px 16px 20px",
                textAlign: "left",
                height: tile.id === 5 ? 110 : 186,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.12s ease, filter 0.12s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
                e.currentTarget.style.filter = "brightness(0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.filter = "brightness(1)";
              }}
            >
              {/* Decorative circle */}
              <div
                style={{
                  position: "absolute",
                  right: -24,
                  top: -24,
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.07)",
                  pointerEvents: "none",
                }}
              />

              <p
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {tile.title}
              </p>

              <p
                style={{
                  color: "white",
                  fontSize: tile.id === 5 ? 26 : 34,
                  fontWeight: 900,
                  lineHeight: 1,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {tileStat(tile.id)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {openCard !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            backgroundColor: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(14px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px 16px",
            overflowY: "auto",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenCard(null);
          }}
        >
          {/* Card wrapper — close button overlaid outside download ref */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setOpenCard(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                width: 34,
                height: 34,
                borderRadius: "50%",
                backgroundColor: "rgba(0,0,0,0.55)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "white",
                fontSize: 20,
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>

            {/* The 390×690 card — this ref is captured for download */}
            <div
              ref={cardRef}
              style={{ width: 390, height: 690, overflow: "hidden" }}
            >
              {renderCard(openCard)}
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            style={{
              marginTop: 18,
              padding: "13px 36px",
              backgroundColor: "white",
              color: "#0d1117",
              border: "none",
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            Download PNG
          </button>
        </div>
      )}
    </>
  );
}
