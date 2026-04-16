"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

export function ReviewModerationButtons({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function moderate(action: "approve" | "reject") {
    setBusy(action);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      toast.success(action === "approve" ? "Review approved" : "Review removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
        disabled={!!busy}
        onClick={() => moderate("reject")}
      >
        <X className="h-3.5 w-3.5" />
        {busy === "reject" ? "…" : "Reject"}
      </Button>
      <Button
        size="sm"
        className="gap-1 bg-green-600 hover:bg-green-700 text-white border-0"
        disabled={!!busy}
        onClick={() => moderate("approve")}
      >
        <Check className="h-3.5 w-3.5" />
        {busy === "approve" ? "…" : "Approve"}
      </Button>
    </div>
  );
}
