export default function WrappedSkeleton() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0d1117" }}
    >
      <style>{`
        @keyframes skeletonShimmer {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        .skeleton-shimmer {
          animation: skeletonShimmer 1.8s ease-in-out infinite;
        }
      `}</style>

      <div className="w-full max-w-2xl flex flex-col gap-5">
        {/* Player header skeleton */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shrink-0 skeleton-shimmer"
            style={{ backgroundColor: "#1e2a3a" }}
          />
          <div
            className="w-36 h-3.5 rounded skeleton-shimmer"
            style={{ backgroundColor: "#1e2a3a" }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 8,
          }}
        >
          Loading your 2026 wrapped...
        </div>

        {/* Primary card skeleton — hero card height */}
        <div
          className="w-full rounded-2xl skeleton-shimmer"
          style={{ backgroundColor: "#161f2e", height: 320 }}
        />

        {/* Secondary card skeletons */}
        <div
          className="w-full rounded-2xl skeleton-shimmer"
          style={{ backgroundColor: "#161f2e", height: 180 }}
        />
        <div
          className="w-full rounded-2xl skeleton-shimmer"
          style={{ backgroundColor: "#161f2e", height: 180 }}
        />
      </div>
    </main>
  );
}
