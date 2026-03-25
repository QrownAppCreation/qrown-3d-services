"use client";

import { useState } from "react";

export default function RequestTrackingLink() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/auth/request-magic-link", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center bg-white rounded-xl border border-border p-8">
        <p className="text-3xl mb-3">📬</p>
        <h2 className="font-bold text-lg mb-2" style={{ color: "var(--wp-charcoal)" }}>
          Check your inbox!
        </h2>
        <p className="text-sm text-gray-500">
          If we have an order for <strong>{email}</strong>, we've sent a link your way.
          It may take a minute to arrive.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-8 space-y-4">
      <div>
        <label htmlFor="track-email"
               className="block text-sm font-medium mb-1"
               style={{ color: "var(--wp-charcoal)" }}>
          Email address
        </label>
        <input
          id="track-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          required
          className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "var(--wp-sage)" } as React.CSSProperties}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-cta border-0 py-3 rounded-lg font-semibold text-sm text-white disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send me my order link"}
      </button>
    </form>
  );
}
