"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmed = accountId.trim();
    if (!trimmed) {
      setError("Please enter an account ID.");
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError("Account ID must be a number.");
      return;
    }
    router.push(`/wrapped/${trimmed}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0d1117" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dota Wrapped
          </h1>
          <p className="text-sm text-white/50">
            Enter your Dota 2 account ID to see your year in review.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Account ID (e.g. 87278757)"
            value={accountId}
            onChange={(e) => {
              setAccountId(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:ring-2 focus:ring-white/20"
            style={{ backgroundColor: "#161b22", border: "1px solid #30363d" }}
          />
          {error && (
            <p className="text-xs text-red-400 pl-1">{error}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 active:opacity-60"
          style={{ backgroundColor: "#1f6feb" }}
        >
          View Wrapped
        </button>
      </div>
    </main>
  );
}
