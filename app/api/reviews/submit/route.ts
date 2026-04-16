import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { uploadToStorage } from "@/lib/supabase-storage";

const NOTIFY_TO = "hello@wedprint3d.com";
const FROM = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function extFromFilename(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : ".jpg";
}

export async function POST(req: NextRequest) {
  console.log("[reviews/submit] POST");

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (e) {
      console.error("[reviews/submit] formData failed:", e);
      return jsonError("Could not read form data.", 400);
    }

    const coupleName = String(formData.get("coupleName") ?? "").trim();
    const comment = String(formData.get("comment") ?? "").trim();
    const weddingDateRaw = String(formData.get("weddingDate") ?? "").trim();
    const ratingRaw = formData.get("rating");

    const weddingPhoto = formData.get("weddingPhoto") as File | null;
    const cakePhoto = formData.get("cakePhoto") as File | null;

    const rating =
      typeof ratingRaw === "string"
        ? parseInt(ratingRaw, 10)
        : Number(ratingRaw);

    console.log("[reviews/submit] fields", {
      coupleName: coupleName.slice(0, 40),
      rating,
      hasWedding: !!weddingPhoto?.size,
      hasCake: !!cakePhoto?.size,
      commentLen: comment.length,
    });

    if (!coupleName || !comment) {
      return jsonError("Name and review comment are required.", 400);
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return jsonError("Please choose a rating from 1 to 5 stars.", 400);
    }
    if (!weddingPhoto?.size || !cakePhoto?.size) {
      return jsonError("Please upload both photos.", 400);
    }

    const folder = randomUUID();
    const wExt = extFromFilename(weddingPhoto.name);
    const cExt = extFromFilename(cakePhoto.name);

    const wMime = weddingPhoto.type || "image/jpeg";
    const cMime = cakePhoto.type || "image/jpeg";

    const wBuf = Buffer.from(await weddingPhoto.arrayBuffer());
    const cBuf = Buffer.from(await cakePhoto.arrayBuffer());

    const weddingPath = `reviews/${folder}/wedding${wExt}`;
    const cakePath = `reviews/${folder}/cake${cExt}`;

    console.log("[reviews/submit] uploading", weddingPath, cakePath);

    const [photoUrl, cakePhotoUrl] = await Promise.all([
      uploadToStorage(weddingPath, wBuf, wMime),
      uploadToStorage(cakePath, cBuf, cMime),
    ]);

    let weddingDate: Date | null = null;
    if (weddingDateRaw) {
      const d = new Date(`${weddingDateRaw}T12:00:00`);
      if (Number.isNaN(d.getTime())) {
        return jsonError("Invalid wedding date.", 400);
      }
      weddingDate = d;
    }

    const review = await db.review.create({
      data: {
        coupleName,
        rating,
        comment,
        photoUrl,
        cakePhotoUrl,
        weddingDate,
        approved: false,
      },
    });

    console.log("[reviews/submit] saved review", review.id);

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: FROM,
          to: NOTIFY_TO,
          subject: `[WedPrint] New “Share your moment” submission — ${coupleName}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;line-height:1.6;color:#333;">
              <h2 style="margin-top:0;">New review pending approval</h2>
              <p><strong>Couple:</strong> ${escapeHtml(coupleName)}</p>
              <p><strong>Rating:</strong> ${rating} / 5</p>
              <p><strong>Wedding date:</strong> ${weddingDateRaw || "—"}</p>
              <p><strong>Comment:</strong></p>
              <p style="white-space:pre-wrap;background:#f5f5f0;padding:12px;border-radius:8px;">${escapeHtml(comment)}</p>
              <p><a href="${APP_URL}/operator/dashboard">Open operator dashboard →</a></p>
              <p style="font-size:12px;color:#888;">Review id: ${review.id}</p>
            </div>
          `,
        });
        console.log("[reviews/submit] notification email sent to", NOTIFY_TO);
      } catch (mailErr) {
        console.error("[reviews/submit] email notify failed:", mailErr);
      }
    } else {
      console.warn("[reviews/submit] RESEND_API_KEY missing — skip notify email");
    }

    return NextResponse.json({
      success: true,
      id: review.id,
      message: "Thank you! Your story was submitted for review.",
    });
  } catch (err) {
    console.error("[reviews/submit] error:", err);
    return jsonError(
      err instanceof Error ? err.message : "Something went wrong.",
      500
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
