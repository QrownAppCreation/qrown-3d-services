export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ApprovalClient from "./ApprovalClient";
import { Heart } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ApprovalPage({ params }: Props) {
  const { token } = await params;

  const design = await db.design.findUnique({
    where: { approvalToken: token },
    include: {
      order: {
        include: { couple: true },
      },
    },
  });

  if (!design) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
              <span className="font-bold text-2xl">WedPrint</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Link not found</h1>
          <p className="text-muted-foreground">
            This approval link is invalid. Please check your email or contact us
            if you think this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = design.tokenExpiry
    ? design.tokenExpiry < new Date()
    : false;

  if (isExpired) {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
              <span className="font-bold text-2xl">WedPrint</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Link expired</h1>
          <p className="text-muted-foreground">
            This approval link has expired. Please contact us at{" "}
            <a
              href={`mailto:${process.env.FROM_EMAIL}`}
              className="underline underline-offset-4"
            >
              {process.env.FROM_EMAIL}
            </a>{" "}
            and we&apos;ll send you a new one.
          </p>
        </div>
      </div>
    );
  }

  if (design.status === "APPROVED") {
    return (
      <div className="min-h-screen wedding-gradient flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-wedprint-rose fill-wedprint-rose" />
              <span className="font-bold text-2xl">WedPrint</span>
            </Link>
          </div>
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">Already approved!</h1>
          <p className="text-muted-foreground">
            You&apos;ve already approved this design. It&apos;s in the print
            queue — we&apos;ll be in touch soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ApprovalClient
      design={{
        id: design.id,
        stlUrl: design.stlUrl,
        previewImageUrl: design.previewImageUrl,
        category: design.category,
        quantity: design.quantity,
        revisionRound: design.revisionRound,
        token,
      }}
      couple={{
        name: design.order.couple.name,
      }}
    />
  );
}
