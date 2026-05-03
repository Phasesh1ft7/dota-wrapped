export default function WrappedSkeleton() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0d1117" }}
    >
      <div className="w-full max-w-2xl flex flex-col gap-5">
        {/* Player header skeleton */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shrink-0 animate-pulse"
            style={{ backgroundColor: "#21262d" }}
          />
          <div
            className="w-36 h-3.5 rounded animate-pulse"
            style={{ backgroundColor: "#21262d" }}
          />
        </div>

        {/* Primary card skeleton — hero card height */}
        <div
          className="w-full rounded-2xl animate-pulse"
          style={{ backgroundColor: "#161b22", height: 320 }}
        />

        {/* Secondary card skeletons */}
        <div
          className="w-full rounded-2xl animate-pulse"
          style={{ backgroundColor: "#161b22", height: 180 }}
        />
        <div
          className="w-full rounded-2xl animate-pulse"
          style={{ backgroundColor: "#161b22", height: 180 }}
        />
      </div>
    </main>
  );
}
