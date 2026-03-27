"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircleHeart, X, ArrowRight } from "lucide-react";

const SUPPORT_EMAIL = "support@wedprint3d.com";

interface Message {
  role: "bot" | "user";
  text: string;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: "How long does it take?",
    a: "Standard orders take 7–10 business days from design approval. Rush orders are ready in 72 hours for an additional 50% fee.",
  },
  {
    q: "What photos do I need?",
    a: "We need clear, well-lit face photos of both partners. Front-facing or slight angle works best. You can also send outfit photos, pet photos, or any inspiration images.",
  },
  {
    q: "Can I see a preview before you print?",
    a: "Yes! We always send a 3D design preview for your approval before printing. Nothing gets printed until you say you love it.",
  },
  {
    q: "What if I don't like the design?",
    a: "We offer revision rounds based on your tier. Standard includes 1 revision, Premium includes 3, and Elite includes unlimited revisions until you're happy.",
  },
  {
    q: "Do you ship or is it pickup only?",
    a: `We currently serve the Miami area. Contact us at ${SUPPORT_EMAIL} to discuss delivery options.`,
  },
  {
    q: "Can I add my pet?",
    a: "Absolutely! Many couples include their pets. Just upload a clear photo of your pet in the photo upload step.",
  },
  {
    q: "How does the rush order work?",
    a: "Select the Rush Order add-on at checkout. Your order gets prioritized and delivered in 72 hours. A 50% surcharge applies to the total order.",
  },
  {
    q: "What materials do you use?",
    a: "We use premium PLA filament on Bambu Lab printers for fine detail. Cake toppers receive a food-safe coating. All prints can be hand-painted for an additional fee.",
  },
];

const WELCOME: Message = {
  role: "bot",
  text: "Hi! 👋 Welcome to WedPrint. Ask me anything about our products, process, or pricing — or pick a question below.",
};

export default function ChatWidget() {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [badge,    setBadge]    = useState(true); // unread dot
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setBadge(false);
    }
  }, [messages, open]);

  function pickFaq(faq: { q: string; a: string }) {
    setMessages((prev) => [
      ...prev,
      { role: "user", text: faq.q },
      { role: "bot",  text: faq.a },
    ]);
  }

  return (
    <>
      {/* ── Chat panel ── */}
      {open && (
        <div
          className="fixed bottom-24 right-4 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: "min(360px, calc(100vw - 32px))",
            height: "min(520px, calc(100vh - 140px))",
            background: "#FAFAF7",
            border: "1px solid #E8E5DF",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
               style={{ background: "var(--wp-charcoal)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                   style={{ background: "var(--wp-cta)" }}>
                <MessageCircleHeart className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">WedPrint</p>
                <p className="text-white/50 text-xs">Usually replies in minutes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
                    className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "var(--wp-cta)", color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "var(--wp-charcoal)", border: "1px solid var(--wp-border)", borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* FAQ chips */}
          <div className="flex-shrink-0 px-4 pt-2 pb-1 border-t" style={{ borderColor: "var(--wp-border)", background: "#fff" }}>
            <p className="text-xs mb-2" style={{ color: "var(--wp-muted)" }}>Common questions:</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1">
              {FAQS.map((faq) => (
                <button
                  key={faq.q}
                  onClick={() => pickFaq(faq)}
                  className="text-xs rounded-full px-3 py-1 border transition-all hover:scale-[1.02]"
                  style={{
                    borderColor: "var(--wp-sage)",
                    color:       "var(--wp-sage)",
                    background:  "var(--wp-sage-light)",
                  }}
                >
                  {faq.q}
                </button>
              ))}
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="flex-shrink-0 px-4 py-3 space-y-2 border-t bg-white"
               style={{ borderColor: "var(--wp-border)" }}>
            <p className="text-xs" style={{ color: "var(--wp-muted)" }}>
              Still have questions?{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-medium"
                 style={{ color: "var(--wp-sage)" }}>
                Email us at {SUPPORT_EMAIL}
              </a>
            </p>
            <Link
              href="/order/step1-style"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white border-0 btn-cta"
            >
              Start your order
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button
        onClick={() => { setOpen((o) => !o); setBadge(false); }}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ background: "var(--wp-cta)" }}
        aria-label="Open chat"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircleHeart className="h-6 w-6 text-white" />
        )}
        {/* Unread dot */}
        {!open && badge && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
