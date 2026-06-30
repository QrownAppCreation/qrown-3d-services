// ─────────────────────────────────────────────────────────────────────────────
// lib/reviews-data.ts
// Static review data shared between /reviews page and /start landing page.
// These show as fallback when the Supabase DB has no approved reviews yet.
// Replace placeholder entries (id 2–11) with real reviews as they come in.
// ⚠️  id: 1 (Jonathan & Shantay) is a REAL review — do not remove.
// ─────────────────────────────────────────────────────────────────────────────

export type StaticReview = {
  id: number;
  name: string;
  location: string;
  weddingDate?: string;
  quote: string;
  rating: number;
  image: string;
  featured?: boolean;
};

export const STATIC_REVIEWS: StaticReview[] = [
  {
    // ✅ REAL — Jonathan & Shantay
    id: 1,
    name: "Jonathan & Shantay",
    location: "Miami, FL",
    weddingDate: "September 2025",
    quote:
      "This cake topper is awesome! They really captured our personality and it looks so elegant. Our wedding is in September and we can't wait to show it off to everyone.",
    rating: 5,
    image: "/images/Couple6/couple6-jonathan-shantay.png",
    featured: true,
  },
  {
    id: 2,
    name: "Sarah & Marcus",
    location: "Miami, FL",
    quote:
      "We were nervous sending in casual photos but the topper looked exactly like us. Our guests couldn't stop talking about it all night. Worth every single penny.",
    rating: 5,
    image: "/images/hero-topper-header.png",
  },
  {
    id: 3,
    name: "Priya & James",
    location: "New York, NY",
    quote:
      "The approval step made all the difference. We got to see our render and request one small tweak before it printed. The final result was absolutely perfect.",
    rating: 5,
    image: "/images/Couple4/couple4-product-shot.png",
  },
  {
    id: 4,
    name: "Leila & David",
    location: "Atlanta, GA",
    quote:
      "Ordered 10 days before the wedding and it arrived in 6 days with time to spare. Absolutely beautiful. We already have it displayed on our mantle at home.",
    rating: 5,
    image: "/images/Couple5/couple5-product-shot1.png",
  },
  {
    id: 5,
    name: "Camille & André",
    location: "Houston, TX",
    quote:
      "I was skeptical that a 3D topper could actually look like us — I was completely wrong. The detail in the faces is unreal. Our families were obsessed with it.",
    rating: 5,
    image: "/images/couple3-final-print.png",
  },
  {
    id: 6,
    name: "Tanya & Robert",
    location: "Orlando, FL",
    quote:
      "We sent a casual beach photo and they turned it into the most beautiful keepsake. The process was so easy — upload, approve, receive. No stress at all.",
    rating: 5,
    image: "", // text-only card
  },
  {
    id: 7,
    name: "Ashley & Michael",
    location: "Charlotte, NC",
    quote:
      "I bought this as a surprise for my fiancé and he was completely speechless when he saw it. The likeness is incredible. Already planning to order a second one as a gift.",
    rating: 5,
    image: "", // text-only card
  },
  {
    id: 8,
    name: "Diana & Carlos",
    location: "Miami, FL",
    quote:
      "We chose the Heirloom finish and the quality blew us away. It sat on top of our three-tier cake and every single guest asked where we got it. Highly recommend.",
    rating: 5,
    image: "", // text-only card
  },
  {
    id: 9,
    name: "Keisha & Jerome",
    location: "Washington, D.C.",
    quote:
      "Fast, professional, and the result was beyond what we imagined. The shipping was quick and the packaging protected it perfectly. It arrived looking flawless.",
    rating: 5,
    image: "", // text-only card
  },
  {
    id: 10,
    name: "Nina & Thomas",
    location: "Los Angeles, CA",
    quote:
      "We ordered the 1-Color Classic and it was stunning. Clean, elegant, timeless. It matched our minimalist wedding aesthetic perfectly. Couldn't be happier.",
    rating: 5,
    image: "", // text-only card
  },
  {
    id: 11,
    name: "Brianna & Kevin",
    location: "Chicago, IL",
    quote:
      "I was worried it wouldn't arrive in time but it showed up 5 days after I approved the render. The team was responsive and patient with our revision requests. 10 out of 10.",
    rating: 5,
    image: "", // text-only card
  },
];
