"use client";

import type { RoleBreakdown } from "@/lib/transforms";

interface Props {
  roleBreakdown: RoleBreakdown;
}

const ROLE_LABELS: Record<keyof RoleBreakdown, string> = {
  carry: "Carry",
  mid: "Mid",
  offlane: "Offlane",
  support: "Support",
};

const BRAND: React.CSSProperties = {
  color: "rgba(255,255,255,0.5)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
};

export default function Card4Role({ roleBreakdown }: Props) {
  const entries = (
    Object.entries(roleBreakdown) as [keyof RoleBreakdown, number][]
  ).sort((a, b) => b[1] - a[1]);

  const hasData = entries.some(([, pct]) => pct > 0);
  const [dominantRole, dominantPct] = entries[0] ?? (["carry", 0] as const);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#16213e",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 22px 24px",
      }}
    >
      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          right: -60,
          top: "10%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          border: "1px solid rgba(245,158,11,0.2)",
          pointerEvents: "none",
        }}
      />

      {/* Top branding */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={BRAND}>Dota Wrapped</span>
        <span
          style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 800 }}
        >
          2026
        </span>
      </div>

      {/* Main content */}
      {hasData ? (
        <div>
          <p
            style={{
              color: "#f59e0b",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Your Role
          </p>

          <p
            style={{
              color: "white",
              fontSize: 72,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            {ROLE_LABELS[dominantRole]}
          </p>

          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 17,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            {dominantPct}% of games
          </p>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <p
            style={{
              color: "#f59e0b",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Your Role
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            Insufficient lane data
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            Lane role not tracked for these matches
          </p>
        </div>
      )}

      {/* Role bars */}
      <div>
        {hasData && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              borderTop: "1px solid rgba(255,255,255,0.07)",
              paddingTop: 18,
              marginBottom: 14,
            }}
          >
            {entries.map(([role, pct]) => (
              <div key={role}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                  }}
                >
                  <span
                    style={{
                      color:
                        role === dominantRole
                          ? "#f59e0b"
                          : "rgba(255,255,255,0.55)",
                      fontSize: 12,
                      fontWeight: role === dominantRole ? 700 : 500,
                    }}
                  >
                    {ROLE_LABELS[role]}
                  </span>
                  <span
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: 3,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      backgroundColor:
                        role === dominantRole
                          ? "#f59e0b"
                          : "rgba(255,255,255,0.22)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <p
          style={{ ...BRAND, color: "rgba(255,255,255,0.25)", textAlign: "center" }}
        >
          dotawrapped.gg
        </p>
      </div>
    </div>
  );
}
