"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, Send, ExternalLink, Check, CheckCircle2, CreditCard, Link2, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import OperatorCancelDialog from "./OperatorCancelDialog";

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

interface UploadMeta { fileName: string; uploadedAt: string; }
interface ApprovalMeta { sentAt: string; }

interface Props {
  order: {
    id: string;
    status: string;
    balanceCents: number;
    depositCents: number;
    coupleEmail: string;
    coupleName: string;
    paymentIntentId: string | null;
    /** Public URL of operator-uploaded STL in Supabase (stl-files bucket). */
    stlFileUrl: string | null;
    designs: Design[];
  };
}

/** Last path segment of a Supabase public object URL (filename). */
function fileNameFromPublicUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const seg = path.split("/").filter(Boolean).pop();
    return seg ? decodeURIComponent(seg) : "file.stl";
  } catch {
    return "file.stl";
  }
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
  const router = useRouter();
  const [designs, setDesigns] = useState(order.designs);
  const [orderStlUrl, setOrderStlUrl] = useState(order.stlFileUrl);
  const [orderStatus, setOrderStatus] = useState(order.status);
  const [uploadingDesignId, setUploadingDesignId] = useState<string | null>(null);
  const [sendingApprovalId, setSendingApprovalId] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [stlMeta,    setStlMeta]    = useState<Record<string, UploadMeta>>({});
  const [approvalMeta, setApprovalMeta] = useState<Record<string, ApprovalMeta>>({});
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [collectingBalance, setCollectingBalance] = useState(false);
  const [balanceLinkSent, setBalanceLinkSent] = useState(false);
  const [balancePaymentUrl, setBalancePaymentUrl] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});

  /** Prefer order.stlFileUrl; fall back to any design STL (legacy rows). */
  const orderLevelStlDownloadUrl =
    orderStlUrl || designs.find((d) => d.stlUrl)?.stlUrl || null;

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
        method:      "POST",
        body:        formData,
        credentials: "include",
      });

      const rawText = await res.text();
      let data: {
        url?: string;
        stlUrl?: string;
        stlFileUrl?: string;
        fileName?: string;
        uploadedAt?: string;
        error?: string;
        detail?: string;
      };
      try {
        data = JSON.parse(rawText) as typeof data;
      } catch {
        throw new Error(
          `Server returned non-JSON (${res.status}): ${rawText.slice(0, 160)}`
        );
      }
      if (!res.ok) {
        throw new Error(data.error ?? data.detail ?? "Upload failed");
      }

      const uploadedUrl = data.url ?? data.stlFileUrl ?? data.stlUrl ?? null;
      setDesigns((prev) =>
        prev.map((d) =>
          d.id === designId
            ? { ...d, stlUrl: uploadedUrl, status: "REVIEW" }
            : d
        )
      );
      if (uploadedUrl) setOrderStlUrl(uploadedUrl);
      setStlMeta((prev) => ({
        ...prev,
        [designId]: { fileName: data.fileName ?? file.name, uploadedAt: data.uploadedAt ?? new Date().toISOString() },
      }));

      toast.success("STL uploaded to Supabase (stl-files). Status updated to REVIEW.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadingDesignId(null);
    }
  }

  async function handleMarkComplete() {
    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      setOrderStatus("COMPLETE");
      setCompletedAt(new Date().toISOString());
      toast.success("Order marked as complete! Completion email sent to couple.");
      router.refresh();
    } catch {
      toast.error("Could not mark order as complete. Please try again.");
    } finally {
      setMarkingComplete(false);
    }
  }

  async function handleCollectBalance() {
    setCollectingBalance(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/payment-link`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setBalanceLinkSent(true);
      setBalancePaymentUrl(data.paymentUrl);
      toast.success(`Balance payment link emailed to ${order.coupleEmail}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send balance link.");
    } finally {
      setCollectingBalance(false);
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
      setApprovalMeta((prev) => ({
        ...prev,
        [designId]: { sentAt: new Date().toISOString() },
      }));

      toast.success("Approval email sent to the couple!");
    } catch {
      toast.error("Could not send approval email. Please try again.");
    } finally {
      setSendingApprovalId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-lg">Designs</h2>

        <div className="flex flex-wrap gap-2">
          {/* Collect balance — shown when design is approved and balance not yet paid */}
          {orderStatus === "APPROVED" && order.balanceCents > 0 && (
            balanceLinkSent ? (
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                  <Check className="h-3.5 w-3.5" />
                  Balance link emailed to {order.coupleEmail}
                </span>
                {balancePaymentUrl && (
                  <a
                    href={balancePaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline px-1"
                  >
                    <Link2 className="h-3 w-3" />
                    Copy / open link
                  </a>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                className="gap-2 border-0 text-white"
                style={{ backgroundColor: "var(--wp-cta)" }}
                disabled={collectingBalance}
                onClick={handleCollectBalance}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {collectingBalance ? "Sending..." : "Collect balance payment"}
              </Button>
            )
          )}

          {/* Mark as complete */}
          {orderStatus !== "COMPLETE" && orderStatus !== "CANCELLED" && (
            <Button
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white border-0"
              disabled={markingComplete}
              onClick={handleMarkComplete}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {markingComplete ? "Updating..." : "Mark as complete"}
            </Button>
          )}

          {orderStatus === "COMPLETE" && (
            <div className="flex flex-col items-end gap-0.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Order complete
              </span>
              {completedAt && (
                <span className="text-[11px] text-muted-foreground">
                  Completed {new Date(completedAt).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Cancel order — opens refund modal */}
          {orderStatus !== "COMPLETE" && orderStatus !== "CANCELLED" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={() => setCancelDialogOpen(true)}
            >
              <XCircle className="h-3.5 w-3.5" />
              Cancel order…
            </Button>
          )}

          {orderStatus === "CANCELLED" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
              <XCircle className="h-3.5 w-3.5" />
              Order cancelled
            </span>
          )}
        </div>
      </div>

      <OperatorCancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderId={order.id}
        depositCents={order.depositCents}
        paymentIntentId={order.paymentIntentId}
        onSuccess={() => {
          setOrderStatus("CANCELLED");
          toast.success("Order cancelled. Customer notified by email.");
          router.refresh();
        }}
      />

      {orderLevelStlDownloadUrl && (
        <div
          className="rounded-xl border border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3"
          style={{ background: "var(--wp-sage-light)" }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "var(--wp-charcoal)" }}>
              Cleaned STL on file
            </p>
            <p
              className="text-xs text-muted-foreground mt-0.5 truncate"
              title={fileNameFromPublicUrl(orderLevelStlDownloadUrl)}
            >
              <span className="font-medium text-foreground/80">
                {fileNameFromPublicUrl(orderLevelStlDownloadUrl)}
              </span>
              <span className="mx-1.5">·</span>
              <code className="text-[11px]">{order.id}/</code>
            </p>
          </div>
          <a
            href={orderLevelStlDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={fileNameFromPublicUrl(orderLevelStlDownloadUrl)}
          >
            <Button variant="outline" size="sm" className="gap-1.5 bg-white shrink-0">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </a>
        </div>
      )}

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
                <div className="flex flex-col items-end gap-0.5">
                  <a href={design.stlUrl} target="_blank" rel="noopener noreferrer" download>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Download STL
                    </Button>
                  </a>
                  {stlMeta[design.id] && (
                    <span className="text-[11px] text-muted-foreground text-right">
                      {stlMeta[design.id].fileName} · uploaded {new Date(stlMeta[design.id].uploadedAt).toLocaleString()}
                    </span>
                  )}
                </div>
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
              {/* Upload STL when this design has no file (API also sets order.stlFileUrl) */}
              {!design.stlUrl && (
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
                      : orderStlUrl
                        ? "Replace cleaned STL"
                        : "Upload cleaned STL"}
                  </Button>
                </div>
              )}

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
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-500" />
                    Approval email sent — waiting for client
                  </div>
                  {approvalMeta[design.id] && (
                    <span className="text-[11px] text-muted-foreground ml-6">
                      Sent {new Date(approvalMeta[design.id].sentAt).toLocaleString()}
                    </span>
                  )}
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
