"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import type { PlayStyleStats } from "@/lib/transforms";

interface Props {
  playStyleStats: PlayStyleStats | null;
  playerName: string;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p
      style={{
        color: "#c8a84b",
        fontWeight: 700,
        fontSize: 9,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        margin: "0 0 2px",
      }}
    >
      {label}
    </p>
  );
}

function EmojiRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 32,
        padding: "0 4px",
        borderRadius: 3,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13 }}>{emoji}</span>
        <span style={{ color: "#8a9bb0", fontSize: 10 }}>{label}</span>
      </span>
      <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export default function CardPlayStyle({ playStyleStats, playerName }: Props) {
  if (!playStyleStats) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>No stats available</p>
      </div>
    );
  }

  const {
    avgGpm, avgXpm, avgLastHits,
    couriersKilled, stunsApplied, towerKills, wardsPlaced, tpScrollsUsed, actionsPerMin, heroHealing,
    fighting, farming, supporting, pushing, utility,
  } = playStyleStats;

  const radarData = [
    { axis: "FIGHTING",    value: fighting,   max: 100 },
    { axis: "FARMING",     value: farming,    max: 100 },
    { axis: "SUPPORTING",  value: supporting, max: 100 },
    { axis: "PUSHING",     value: pushing,    max: 100 },
    { axis: "UTILITY",     value: utility,    max: 100 },
  ];

  const formatHealing = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString();

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#0a0a0f",
        backgroundImage: "radial-gradient(rgba(200,168,75,0.12) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        display: "flex",
        flexDirection: "column",
        padding: "18px 18px 0 18px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12, flexShrink: 0 }}>
        <p
          style={{
            color: "white",
            fontSize: 18,
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          PLAY STYLE
        </p>
        <p
          style={{
            color: "#8a9bb0",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "2px",
            textTransform: "uppercase",
            margin: "3px 0 10px",
          }}
        >
          MOST RECENT YEAR
        </p>
        <div
          style={{
            height: 1,
            background: "linear-gradient(to right, #c8a84b, transparent)",
          }}
        />
      </div>

      {/* Two-column content */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* LEFT: Radar */}
        <div
          style={{
            width: "45%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at center, rgba(200,168,75,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={70}
            width={240}
            height={240}
            data={radarData}
          >
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: "#c8a84b", fontSize: 9, fontWeight: 700 }}
              tickLine={false}
            />
            <Radar
              name="max"
              dataKey="max"
              stroke="rgba(200,168,75,0.3)"
              strokeWidth={1}
              fill="transparent"
            />
            <Radar
              name="player"
              dataKey="value"
              stroke="#c8a84b"
              strokeWidth={2}
              fill="rgba(200,168,75,0.25)"
              dot={false}
            />
          </RadarChart>
        </div>

        {/* RIGHT: Stats */}
        <div
          style={{
            flex: 1,
            paddingLeft: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Section A — Averages */}
          <SectionHeader label="Averages" />
          <EmojiRow emoji="⚔️" label="Avg GPM"       value={avgGpm.toLocaleString()} />
          <EmojiRow emoji="✨" label="Avg XPM"        value={avgXpm.toLocaleString()} />
          <EmojiRow emoji="🌾" label="Avg Last Hits"  value={avgLastHits.toLocaleString()} />

          <div
            style={{
              height: 1,
              backgroundColor: "rgba(200,168,75,0.15)",
              margin: "6px 4px",
            }}
          />

          {/* Section B — Career Totals */}
          <SectionHeader label="Career Totals" />
          <EmojiRow emoji="🚚" label="Couriers Killed"  value={couriersKilled.toLocaleString()} />
          <EmojiRow emoji="⚡" label="Stuns Applied"    value={`${stunsApplied.toLocaleString()}s`} />
          <EmojiRow emoji="🏰" label="Tower Kills"      value={towerKills.toLocaleString()} />
          <EmojiRow emoji="👁️" label="Wards Placed"     value={wardsPlaced.toLocaleString()} />
          <EmojiRow emoji="🌀" label="TP Scrolls Used"  value={tpScrollsUsed.toLocaleString()} />
          <EmojiRow emoji="⚡" label="Actions Per Min"  value={`${actionsPerMin} APM`} />
          <EmojiRow emoji="💚" label="Hero Healing"     value={formatHealing(heroHealing)} />
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 4px",
          borderTop: "1px solid rgba(200,168,75,0.2)",
          marginTop: 10,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            backgroundColor: "#c8a84b",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: "#c8a84b",
            fontSize: 13,
            fontWeight: 700,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </span>
      </div>
    </div>
  );
}
