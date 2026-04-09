"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

const SUPPORT_EMAIL = "support@wedprint3d.com";

export default function ContactPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [message,  setMessage]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, orderRef: orderRef || undefined, message }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Something went wrong.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--wp-ivory)" }}>
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
           style={{ borderColor: "var(--wp-border)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo width={180} href="/" />
          <Link href="/" className="flex items-center gap-1.5 text-sm hover:underline"
                style={{ color: "var(--wp-sage)" }}>
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-5 gap-12">

          {/* Left — info */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
                Get in touch
              </h1>
              <p style={{ color: "var(--wp-muted)" }}>
                Have a question about your order, sizing, or materials?
                We&apos;re happy to help — usually within 24 hours.
              </p>
            </div>

            {/* Support email prominent display */}
            <div className="rounded-2xl p-6 space-y-2"
                 style={{ background: "var(--wp-sage-light)", border: "1px solid var(--wp-sage)" }}>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="h-5 w-5" style={{ color: "var(--wp-sage)" }} />
                <span className="font-semibold text-sm" style={{ color: "var(--wp-charcoal)" }}>
                  Support email
                </span>
              </div>
              <a href={`mailto:${SUPPORT_EMAIL}`}
                 className="font-bold text-base hover:underline block"
                 style={{ color: "var(--wp-sage)" }}>
                {SUPPORT_EMAIL}
              </a>
              <p className="text-xs" style={{ color: "var(--wp-muted)" }}>
                We reply within 24 hours on business days.
              </p>
            </div>

            <div className="space-y-3 text-sm" style={{ color: "var(--wp-muted)" }}>
              <p>📍 Serving the <strong style={{ color: "var(--wp-charcoal)" }}>Miami, FL</strong> area</p>
              <p>🕐 Mon – Fri, 9 am – 6 pm EST</p>
              <p>📦 Pickup &amp; local delivery available</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="rounded-2xl border bg-white p-12 text-center"
                   style={{ borderColor: "var(--wp-border)" }}>
                <CheckCircle className="h-14 w-14 mx-auto mb-4" style={{ color: "var(--wp-sage)" }} />
                <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--wp-charcoal)" }}>
                  Message sent!
                </h2>
                <p className="mb-6" style={{ color: "var(--wp-muted)" }}>
                  We&apos;ll get back to you within 24 hours at <strong>{email}</strong>.
                </p>
                <Link href="/">
                  <button className="btn-cta px-6 py-3 rounded-xl font-semibold text-sm text-white border-0">
                    Back to home
                  </button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}
                    className="rounded-2xl border bg-white p-8 space-y-5"
                    style={{ borderColor: "var(--wp-border)" }}>
                <h2 className="text-xl font-semibold" style={{ color: "var(--wp-charcoal)" }}>
                  Send us a message
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5"
                           style={{ color: "var(--wp-charcoal)" }}>
                      Your name <span style={{ color: "var(--wp-cta)" }}>*</span>
                    </label>
                    <input
                      type="text" required value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah & James"
                      className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "var(--wp-border)", "--tw-ring-color": "var(--wp-sage)" } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5"
                           style={{ color: "var(--wp-charcoal)" }}>
                      Email address <span style={{ color: "var(--wp-cta)" }}>*</span>
                    </label>
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: "var(--wp-border)", "--tw-ring-color": "var(--wp-sage)" } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5"
                         style={{ color: "var(--wp-charcoal)" }}>
                    Order reference <span style={{ color: "var(--wp-muted)" }}>(optional)</span>
                  </label>
                  <input
                    type="text" value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    placeholder="e.g. AB123456"
                    className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "var(--wp-border)", "--tw-ring-color": "var(--wp-sage)" } as React.CSSProperties}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5"
                         style={{ color: "var(--wp-charcoal)" }}>
                    Message <span style={{ color: "var(--wp-cta)" }}>*</span>
                  </label>
                  <textarea
                    required rows={5} value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{ borderColor: "var(--wp-border)", "--tw-ring-color": "var(--wp-sage)" } as React.CSSProperties}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full btn-cta border-0 py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send message"}
                </button>

                <p className="text-xs text-center" style={{ color: "var(--wp-muted)" }}>
                  We reply within 24 hours. You can also email us directly at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="underline"
                     style={{ color: "var(--wp-sage)" }}>{SUPPORT_EMAIL}</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
