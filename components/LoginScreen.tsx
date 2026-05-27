"use client";
import { useState } from "react";

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError("Wrong passcode. Try again.");
        setPasscode("");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-600/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="glass-card rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">📅</div>
            <h1 className="text-xl font-semibold text-stone-100">Calendra</h1>
            <p className="text-sm text-stone-500 mt-1">Your personal voice calendar</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wider mb-1.5 block">Passcode</label>
              <input
                type="password"
                className="glass-input w-full text-center text-lg tracking-widest"
                placeholder="••••••"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={!passcode || loading}
              className="w-full py-3 rounded-xl text-sm font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Checking..." : "Enter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
