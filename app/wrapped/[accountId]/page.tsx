import { fetchPlayerData } from "@/lib/opendota";
import WrappedClient from "@/components/WrappedClient";

interface Props {
  params: Promise<{ accountId: string }>;
}

export default async function WrappedPage({ params }: Props) {
  const { accountId } = await params;

  let data;
  try {
    data = await fetchPlayerData(accountId);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "UNKNOWN_ERROR";

    if (message === "PRIVATE_PROFILE") {
      return (
        <main
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: "#0d1117" }}
        >
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <p className="text-4xl">🔒</p>
            <h1 className="text-xl font-semibold text-white">
              Profile unavailable
            </h1>
            <p className="text-sm text-white/50">
              This profile is private or does not exist.
            </p>
            <a
              href="/"
              className="mt-2 text-sm text-blue-400 hover:underline"
            >
              ← Try another account
            </a>
          </div>
        </main>
      );
    }

    return (
      <main
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#0d1117" }}
      >
        <div className="flex flex-col items-center gap-3 text-center max-w-sm">
          <h1 className="text-xl font-semibold text-white">
            Something went wrong
          </h1>
          <p className="text-sm text-white/50">
            Could not load player data. Please try again later.
          </p>
          <a href="/" className="mt-2 text-sm text-blue-400 hover:underline">
            ← Back
          </a>
        </div>
      </main>
    );
  }

  return <WrappedClient data={data} />;
}
