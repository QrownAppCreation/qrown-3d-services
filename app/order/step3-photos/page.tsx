"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import WizardLayout from "@/components/order/WizardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveOrderDraft, getOrderDraft } from "@/lib/order-store";
import { ArrowLeft, ArrowRight, Upload, X, Check, Info } from "lucide-react";
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
  /** Object URL (blob:) for local preview, or a real https:// URL when R2 is live */
  url: string;
  name: string;
  status: "done" | "error";
}

const PHOTO_SLOTS: PhotoSlot[] = [
  {
    type: "partner1",
    label: "Partner 1 photo",
    description: "Clear face photo, good lighting",
    required: true,
  },
  {
    type: "partner2",
    label: "Partner 2 photo",
    description: "Clear face photo, good lighting",
    required: true,
  },
  {
    type: "outfit",
    label: "Outfit reference",
    description: "Wedding attire or costume reference",
    required: false,
  },
  {
    type: "pet",
    label: "Pet photo",
    description: "If you want your pet included",
    required: false,
  },
  {
    type: "inspiration",
    label: "Inspiration image",
    description: "Any style reference you love",
    required: false,
  },
];

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_MB = 20;

export default function Step3PhotosPage() {
  const router = useRouter();
  const [uploads, setUploads] = useState<Partial<Record<PhotoType, UploadEntry>>>({});
  const [partner1Name, setPartner1Name] = useState("");
  const [partner2Name, setPartner2Name] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [colorPalette, setColorPalette] = useState("");
  const [styleNotes, setStyleNotes] = useState("");
  const fileInputRefs = useRef<Partial<Record<PhotoType, HTMLInputElement>>>({});

  // Track object URLs we created so we can revoke them on unmount to free memory
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const draft = getOrderDraft();
    if (draft.partner1Name) setPartner1Name(draft.partner1Name);
    if (draft.partner2Name) setPartner2Name(draft.partner2Name);
    if (draft.weddingDate) setWeddingDate(draft.weddingDate);
    if (draft.colorPalette) setColorPalette(draft.colorPalette);
    if (draft.styleNotes) setStyleNotes(draft.styleNotes);

    // Restore any previously selected photos from the draft.
    // Object URLs only survive within the same tab session, so blob: URLs
    // saved in sessionStorage will still work when navigating between steps.
    if (draft.photoUrls) {
      const restored: Partial<Record<PhotoType, UploadEntry>> = {};
      for (const [k, v] of Object.entries(draft.photoUrls)) {
        if (v) {
          restored[k as PhotoType] = { url: v, name: "photo selected", status: "done" };
        }
      }
      setUploads(restored);
    }

    // Revoke object URLs on unmount to avoid memory leaks
    return () => {
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  function handleFileSelect(type: PhotoType, file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or HEIC image.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }

    // Create a local preview URL — no network call needed
    const objectUrl = URL.createObjectURL(file);
    objectUrlsRef.current.push(objectUrl);

    setUploads((prev) => ({
      ...prev,
      [type]: { url: objectUrl, name: file.name, status: "done" },
    }));

    toast.success(`${PHOTO_SLOTS.find((s) => s.type === type)?.label} added!`);
  }

  function removeUpload(type: PhotoType) {
    const existing = uploads[type];
    if (existing?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(existing.url);
    }
    setUploads((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }

  function handleNext() {
    if (!uploads.partner1?.url || !uploads.partner2?.url) {
      toast.error("Please add photos for both partners.");
      return;
    }
    if (!partner1Name || !partner2Name) {
      toast.error("Please enter both partner names.");
      return;
    }

    const photoUrls: Record<string, string> = {};
    for (const [k, v] of Object.entries(uploads)) {
      if (v?.url) photoUrls[k] = v.url;
    }

    saveOrderDraft({
      partner1Name,
      partner2Name,
      weddingDate,
      colorPalette,
      styleNotes,
      photoUrls,
    });

    router.push("/order/step4-addons");
  }

  return (
    <WizardLayout currentStep={3}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tell us about yourselves</h1>
          <p className="text-muted-foreground">
            Upload your photos and share a few details so we can design
            something that truly looks like you two.
          </p>
        </div>

        {/* Dev mode notice */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            <span className="font-medium">Note:</span> Photo storage will be
            configured before launch. Photos are held locally in your browser
            session for now and will not be uploaded until Cloudflare R2 is
            connected.
          </p>
        </div>

        {/* Photo uploads */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Photos</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PHOTO_SLOTS.map((slot) => {
              const upload = uploads[slot.type];
              const isDone = upload?.status === "done";

              return (
                <div
                  key={slot.type}
                  className={cn(
                    "rounded-xl border-2 p-4 transition-colors",
                    isDone
                      ? "border-green-500 bg-green-50"
                      : "border-dashed border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-medium text-sm">{slot.label}</p>
                        {slot.required && (
                          <span className="text-destructive text-xs">*</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {slot.description}
                      </p>
                    </div>
                    {isDone && (
                      <button
                        onClick={() => removeUpload(slot.type)}
                        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                        aria-label="Remove photo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Thumbnail preview */}
                  {isDone && upload?.url && (
                    <div className="mt-3">
                      <img
                        src={upload.url}
                        alt={slot.label}
                        className="h-20 w-20 rounded-lg object-cover border border-green-300"
                      />
                    </div>
                  )}

                  <div className="mt-3">
                    {isDone ? (
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-xs">{upload?.name}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRefs.current[slot.type]?.click()}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Upload className="h-4 w-4" />
                        Choose file
                      </button>
                    )}

                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current[slot.type] = el;
                      }}
                      type="file"
                      accept={ALLOWED_TYPES.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(slot.type, file);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details */}
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
            <Label htmlFor="colorPalette">
              Wedding colour palette (optional)
            </Label>
            <Input
              id="colorPalette"
              placeholder="e.g. dusty rose, sage green, ivory"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="styleNotes">
              Any special notes? (optional, max 500 chars)
            </Label>
            <Textarea
              id="styleNotes"
              placeholder="Tell us anything that makes you two unique — pets, hobbies, inside jokes, specific poses..."
              maxLength={500}
              rows={4}
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground text-right">
              {styleNotes.length}/500
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/order/step2-products")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button size="lg" onClick={handleNext} className="gap-2 px-8">
            Next: Add-ons
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </WizardLayout>
  );
}
