"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Send, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Design {
  id: string;
  category: string;
  quantity: number;
  status: string;
  previewImageUrl: string | null;
  stlUrl: string | null;
  partner1Name: string | null;
  partner2Name: string | null;
  revisionRound: number;
  clientNotes: string | null;
  approvalToken: string | null;
  photoUrls: unknown;
}

interface Props {
  order: {
    id: string;
    designs: Design[];
  };
}

const DESIGN_STATUS_COLORS: Record<string, string> = {
  QUEUED: "bg-gray-100 text-gray-600",
  GENERATING: "bg-blue-100 text-blue-700",
  REVIEW: "bg-orange-100 text-orange-700",
  CLIENT_SENT: "bg-purple-100 text-purple-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  PRINT_READY: "bg-cyan-100 text-cyan-700",
  FAILED: "bg-red-200 text-red-800",
};

export default function OrderDetailClient({ order }: Props) {
  const [designs, setDesigns] = useState(order.designs);
  const [uploadingDesignId, setUploadingDesignId] = useState<string | null>(null);
  const [sendingApprovalId, setSendingApprovalId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  async function handleSTLUpload(designId: string, file: File) {
    if (!file.name.endsWith(".stl") && !file.name.endsWith(".obj")) {
      toast.error("Please upload an STL or OBJ file.");
      return;
    }

    setUploadingDesignId(designId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("designId", designId);
      formData.append("orderId", order.id);

      const res = await fetch(`/api/designs/${designId}/stl`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      setDesigns((prev) =>
        prev.map((d) =>
          d.id === designId ? { ...d, stlUrl: data.stlUrl, status: "REVIEW" } : d
        )
      );

      toast.success("STL uploaded successfully! Status updated to REVIEW.");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingDesignId(null);
    }
  }

  async function handleSendApproval(designId: string) {
    setSendingApprovalId(designId);
    try {
      const res = await fetch(`/api/designs/${designId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_approval" }),
      });

      if (!res.ok) throw new Error("Failed to send approval");

      setDesigns((prev) =>
        prev.map((d) =>
          d.id === designId ? { ...d, status: "CLIENT_SENT" } : d
        )
      );

      toast.success("Approval email sent to the couple!");
    } catch {
      toast.error("Could not send approval email. Please try again.");
    } finally {
      setSendingApprovalId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-lg">Designs</h2>

      {designs.map((design) => {
        const photoUrls = design.photoUrls as Record<string, string> | null;

        return (
          <div
            key={design.id}
            className="bg-white rounded-2xl border border-border p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">
                    {design.category.replace(/_/g, " ")} ×{design.quantity}
                  </h3>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      DESIGN_STATUS_COLORS[design.status] ??
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    {design.status.replace(/_/g, " ")}
                  </span>
                </div>
                {(design.partner1Name || design.partner2Name) && (
                  <p className="text-sm text-muted-foreground">
                    {design.partner1Name}{" "}
                    {design.partner2Name && `& ${design.partner2Name}`}
                  </p>
                )}
                {design.revisionRound > 1 && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    Revision round {design.revisionRound}
                  </p>
                )}
              </div>

              {design.stlUrl && (
                <a
                  href={design.stlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Download STL
                  </Button>
                </a>
              )}
            </div>

            {/* Photos uploaded by couple */}
            {photoUrls && Object.keys(photoUrls).length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">
                  Reference photos from couple
                </p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(photoUrls).map(([type, url]) => (
                    <a
                      key={type}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground hover:border-primary transition-colors">
                        <img
                          src={url}
                          alt={type}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-1 capitalize">
                        {type}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Client notes from revision */}
            {design.clientNotes && (
              <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Client revision notes:
                </p>
                <p className="text-sm text-orange-700">{design.clientNotes}</p>
              </div>
            )}

            {/* Preview image */}
            {design.previewImageUrl && (
              <div className="mb-5">
                <p className="text-sm font-medium mb-2">Design preview</p>
                <img
                  src={design.previewImageUrl}
                  alt="Design preview"
                  className="max-w-xs rounded-xl border border-border"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
              {/* Upload STL */}
              <div>
                <input
                  ref={(el) => {
                    if (el) fileInputRefs.current[design.id] = el;
                  }}
                  type="file"
                  accept=".stl,.obj"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSTLUpload(design.id, file);
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={uploadingDesignId === design.id}
                  onClick={() => fileInputRefs.current[design.id]?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingDesignId === design.id
                    ? "Uploading..."
                    : "Upload cleaned STL"}
                </Button>
              </div>

              {/* Send for approval */}
              {design.stlUrl &&
                design.status !== "CLIENT_SENT" &&
                design.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={sendingApprovalId === design.id}
                    onClick={() => handleSendApproval(design.id)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {sendingApprovalId === design.id
                      ? "Sending..."
                      : "Send for approval"}
                  </Button>
                )}

              {design.status === "CLIENT_SENT" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  Approval email sent — waiting for client response
                </div>
              )}

              {design.status === "APPROVED" && (
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <Check className="h-4 w-4" />
                  Design approved — ready to print
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
