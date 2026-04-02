"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveOrderDraft, getOrderDraft } from "@/lib/order-store";
import { ArrowLeft, ArrowRight, Upload, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PhotoType = "partner1" | "partner2" | "outfit" | "pet" | "inspiration";

interface PhotoSlot {
  type: PhotoType;
  label: string;
  description: string;
  required: boolean;
}

interface UploadEntry {
  url: string;     // permanent Supabase Storage public URL
  name: string;
  size: number;
  status: "done" | "error";
}

const PHOTO_SLOTS: PhotoSlot[] = [
  { type: "partner1",    label: "Partner 1 photo",   description: "Clear face photo, good lighting",      required: true  },
  { type: "partner2",    label: "Partner 2 photo",   description: "Clear face photo, good lighting",      required: true  },
  { type: "outfit",      label: "Outfit reference",  description: "Wedding attire or costume reference",  required: false },
  { type: "pet",         label: "Pet photo",         description: "If you want your pet included",        required: false },
  { type: "inspiration", label: "Inspiration image", description: "Any style reference you love",         required: false },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_MB = 20;

// One stable draft ID per browser session — groups all photos in the same
// Supabase Storage folder so they're easy to find by order.
function getOrCreateDraftId(): string {
  const KEY = "wedprint_draft_id";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

export default function Step3PhotosPage() {
  const router = useRouter();
  const [uploads, setUploads]           = useState<Partial<Record<PhotoType, UploadEntry>>>({});
  const [uploading, setUploading]       = useState<Partial<Record<PhotoType, boolean>>>({});
  const [dragOver, setDragOver]         = useState<PhotoType | null>(null);
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [weddingDate, setWeddingDate]   = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [styleNotes, setStyleNotes]     = useState("");
  const draftIdRef = useRef<string>("");

  const fileInputRefs = useRef<Partial<Record<PhotoType, HTMLInputElement>>>({});

  useEffect(() => {
    draftIdRef.current = getOrCreateDraftId();

    const draft = getOrderDraft();
    if (draft.partner1Name) setPartner1Name(draft.partner1Name);
    if (draft.partner2Name) setPartner2Name(draft.partner2Name);
    if (draft.weddingDate)  setWeddingDate(draft.weddingDate);
    if (draft.colorPalette) setColorPalette(draft.colorPalette);
    if (draft.styleNotes)   setStyleNotes(draft.styleNotes);

    // Restore previously uploaded photos (already Supabase URLs)
    if (draft.photoUrls) {
      const restored: Partial<Record<PhotoType, UploadEntry>> = {};
      for (const [k, v] of Object.entries(draft.photoUrls)) {
        if (v) {
          restored[k as PhotoType] = { url: v, name: "photo uploaded", size: 0, status: "done" };
        }
      }
      setUploads(restored);
    }
  }, []);

  // ── Core upload handler ───────────────────────────────────────────────────
  const acceptFile = useCallback(async (type: PhotoType, file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please use a JPG, PNG, WebP, or HEIC image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Mark this slot as uploading
    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const form = new FormData();
      form.append("file",      file);
      form.append("photoType", type);
      form.append("draftId",   draftIdRef.current);

      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      // data.url is the permanent Supabase Storage public URL
      setUploads((prev) => ({
        ...prev,
        [type]: { url: data.url, name: file.name, size: file.size, status: "done" },
      }));

      toast.success(`${PHOTO_SLOTS.find((s) => s.type === type)?.label} uploaded!`);
    } catch (err) {
      console.error("[step3-photos] Upload error:", err);
      toast.error(
        err instanceof Error ? err.message : "Upload failed — please try again."
      );
      setUploads((prev) => ({
        ...prev,
        [type]: { url: "", name: file.name, size: file.size, status: "error" },
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent, type: PhotoType) {
    e.preventDefault(); e.stopPropagation(); setDragOver(type);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation(); setDragOver(null);
  }
  function onDrop(e: React.DragEvent, type: PhotoType) {
    e.preventDefault(); e.stopPropagation(); setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(type, file);
  }

  function removeUpload(type: PhotoType) {
    setUploads((prev) => { const n = { ...prev }; delete n[type]; return n; });
  }

  function handleNext() {
    if (!uploads.partner1?.url || !uploads.partner2?.url) {
      toast.error("Please upload photos for both partners.");
      return;
    }
    if (!partner1Name || !partner2Name) {
      toast.error("Please enter both partner names.");
      return;
    }
    if (Object.values(uploading).some(Boolean)) {
      toast.error("Please wait for all uploads to finish.");
      return;
    }

    const photoUrls: Record<string, string> = {};
    for (const [k, v] of Object.entries(uploads)) {
      if (v?.url && v.status === "done") photoUrls[k] = v.url;
    }
    saveOrderDraft({ partner1Name, partner2Name, weddingDate, colorPalette, styleNotes, photoUrls });
    router.push("/order/step4-addons");
  }

  return (
    <WizardLayout currentStep={4}>
      <div className="space-y-8">

        <div>
          <h1 className="text-3xl font-bold mb-2">Tell us about yourselves</h1>
          <p className="text-muted-foreground">
            Upload your photos and share a few details so we can design something
            that truly looks like you two.
          </p>
        </div>

        {/* Photo upload slots */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Photos</h2>
          <p className="text-sm -mt-1" style={{ color: "var(--wp-muted)" }}>
            Click any slot or drag a photo directly onto it. JPG, PNG, WebP, and HEIC accepted.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {PHOTO_SLOTS.map((slot) => {
              const upload    = uploads[slot.type];
              const isLoading = !!uploading[slot.type];
              const isDone    = upload?.status === "done" && !!upload?.url;
              const isError   = upload?.status === "error";
              const isOver    = dragOver === slot.type;

              const fileSizeLabel = upload?.size
                ? upload.size < 1024 * 1024
                  ? `${Math.round(upload.size / 1024)} KB`
                  : `${(upload.size / (1024 * 1024)).toFixed(1)} MB`
                : null;

              return (
                <div
                  key={slot.type}
                  onDragOver={(e) => !isDone && !isLoading && onDragOver(e, slot.type)}
                  onDragLeave={(e) => !isDone && !isLoading && onDragLeave(e)}
                  onDrop={(e)      => !isDone && !isLoading && onDrop(e, slot.type)}
                  onClick={() => !isDone && !isLoading && fileInputRefs.current[slot.type]?.click()}
                  className={cn(
                    "rounded-2xl border-2 p-5 transition-all duration-150",
                    isDone
                      ? "border-[var(--wp-sage)] bg-[var(--wp-sage-light)]/40"
                      : isError
                      ? "border-red-300 bg-red-50"
                      : isLoading
                      ? "border-[var(--wp-sage)] bg-[var(--wp-sage-light)]/20 cursor-wait"
                      : isOver
                      ? "border-[var(--wp-sage)] bg-[var(--wp-sage-light)] scale-[1.01] shadow-md cursor-copy"
                      : "border-dashed border-border hover:border-[var(--wp-sage)] hover:bg-[var(--wp-sage-light)]/20 cursor-pointer"
                  )}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-sm" style={{ color: "var(--wp-charcoal)" }}>
                          {slot.label}
                        </p>
                        {slot.required && <span className="text-destructive text-xs font-bold">*</span>}
                      </div>
                      <p className="text-xs" style={{ color: "var(--wp-muted)" }}>{slot.description}</p>
                    </div>
                    {isDone && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeUpload(slot.type); }}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 p-0.5 rounded hover:bg-red-50"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Loading spinner */}
                  {isLoading && (
                    <div className="mt-4 py-8 flex flex-col items-center justify-center gap-3"
                         style={{ color: "var(--wp-sage)" }}>
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="text-sm font-medium">Uploading…</span>
                    </div>
                  )}

                  {/* Drop-active state */}
                  {isOver && !isDone && !isLoading && (
                    <div className="mt-4 py-6 flex flex-col items-center justify-center gap-2"
                         style={{ color: "var(--wp-sage)" }}>
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-semibold">Drop to upload</span>
                    </div>
                  )}

                  {/* Thumbnail after successful upload */}
                  {isDone && upload?.url && (
                    <div className="mt-4">
                      <img
                        src={upload.url}
                        alt={slot.label}
                        className="w-full h-36 rounded-xl object-cover border-2"
                        style={{ borderColor: "var(--wp-sage)" }}
                      />
                      <div className="mt-2 flex items-center gap-2"
                           style={{ color: "var(--wp-sage)" }}>
                        <Check className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs truncate font-medium">{upload.name}</span>
                        {fileSizeLabel && (
                          <span className="text-xs ml-auto flex-shrink-0" style={{ color: "var(--wp-muted)" }}>
                            {fileSizeLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error state */}
                  {isError && !isLoading && (
                    <div className="mt-4 py-4 flex flex-col items-center justify-center gap-2">
                      <p className="text-sm text-red-600 font-medium">Upload failed — click to retry</p>
                    </div>
                  )}

                  {/* Empty state prompt */}
                  {!isOver && !isDone && !isLoading && !isError && (
                    <div className="mt-4 py-5 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed"
                         style={{ borderColor: "var(--wp-border)" }}>
                      <Upload className="h-6 w-6" style={{ color: "var(--wp-sage)" }} />
                      <p className="text-xs text-center" style={{ color: "var(--wp-muted)" }}>
                        <span className="font-semibold" style={{ color: "var(--wp-sage)" }}>
                          Click or drag &amp; drop
                        </span>
                        <br />
                        JPG, PNG, WebP, HEIC · max 20 MB
                      </p>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={(el) => { if (el) fileInputRefs.current[slot.type] = el; }}
                    type="file"
                    accept={ALLOWED_TYPES.join(",")}
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) acceptFile(slot.type, file);
                      e.target.value = "";
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Details form */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Your details</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p1name">
                Partner 1 name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p1name"
                placeholder="e.g. Sarah"
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p2name">
                Partner 2 name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="p2name"
                placeholder="e.g. James"
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weddingDate">Wedding date (optional)</Label>
            <Input
              id="weddingDate"
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorPalette">Wedding colour palette (optional)</Label>
            <Input
              id="colorPalette"
              placeholder="e.g. sage green, warm gold, ivory"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="styleNotes">Any special notes? (optional, max 500 chars)</Label>
            <Textarea
              id="styleNotes"
              placeholder="Tell us anything that makes you two unique — pets, hobbies, inside jokes, specific poses..."
              maxLength={500}
              rows={4}
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">{styleNotes.length}/500</p>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/order/step3-color")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="lg"
            onClick={handleNext}
            disabled={Object.values(uploading).some(Boolean)}
            className="gap-2 px-8"
          >
            {Object.values(uploading).some(Boolean) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                Next: Add-ons
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
