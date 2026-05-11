"use client";

import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

const CDN = "https://cdn.cloudflare.steamstatic.com";

const FALLBACK_HEROES = [
  "invoker", "pudge", "juggernaut", "axe", "crystal_maiden",
  "lion", "shadow_fiend", "antimage", "phantom_assassin",
  "storm_spirit", "templar_assassin", "rubick", "earthshaker",
  "lina", "drow_ranger", "morphling", "ember_spirit", "slark",
  "void_spirit", "lone_druid",
];

function formatHeroName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function HeroMosaicBackground() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [heroNames, setHeroNames] = useState<string[]>([]);
  const outerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;
    fetch("https://api.opendota.com/api/constants/heroes")
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        const names = Object.keys(data)
          .map((key) => key.replace("npc_dota_hero_", ""))
          .filter(Boolean);
        const resolved = names.length > 0 ? names : FALLBACK_HEROES;
        console.log("[Mosaic] heroes loaded:", resolved.length);
        setHeroNames(resolved);
      })
      .catch(() => {
        console.log("[Mosaic] heroes loaded:", FALLBACK_HEROES.length);
        setHeroNames(FALLBACK_HEROES);
      });
  }, [shouldReduceMotion]);

  if (shouldReduceMotion || heroNames.length === 0) return null;

  const reps = Math.ceil(1000 / heroNames.length);
  const icons = Array.from({ length: reps }, () => heroNames).flat().slice(0, 1000);

  return (
    <div
      ref={outerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        opacity: 0.25,
        zIndex: 1,
      }}
    >
      <style>{`
        .mosaic-img {
          display: block;
          width: 48px;
          height: 48px;
          object-fit: cover;
          transition: transform 0.15s ease, filter 0.15s ease;
          cursor: default;
        }
        .mosaic-img:hover {
          transform: scale(1.4);
          filter: brightness(1.5);
          position: relative;
          z-index: 10;
        }
      `}</style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 48px)",
          width: "100%",
          height: "100%",
        }}
      >
        {icons.map((name, i) => (
          <img
            key={`${name}-${i}`}
            className="mosaic-img"
            src={`${CDN}/apps/dota2/images/dota_react/heroes/icons/${name}.png`}
            alt=""
            width={48}
            height={48}
            onMouseEnter={(e) => {
              const tooltip = tooltipRef.current;
              const outer = outerRef.current;
              if (!tooltip || !outer) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const oRect = outer.getBoundingClientRect();
              tooltip.style.display = "block";
              tooltip.style.left = `${rect.left - oRect.left + 24}px`;
              tooltip.style.top = `${rect.bottom - oRect.top + 4}px`;
              tooltip.textContent = formatHeroName(name);
            }}
            onMouseLeave={() => {
              if (tooltipRef.current) tooltipRef.current.style.display = "none";
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ))}
      </div>

      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Tooltip — positioned via ref, never in React state to avoid 1000-item re-renders */}
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          fontSize: 10,
          color: "#fff",
          background: "rgba(0,0,0,0.8)",
          borderRadius: 4,
          padding: "2px 6px",
          pointerEvents: "none",
          zIndex: 20,
          whiteSpace: "nowrap",
        }}
      />
    </div>
  );
}
