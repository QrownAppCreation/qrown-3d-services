import { getStripe } from "@/lib/stripe";

/**
 * Refund part or all of the deposit charge via Stripe (PaymentIntent).
 * @param refundCents Amount to refund in cents; 0 skips the API call.
 * @returns Actual refunded amount in cents (from Stripe).
 */
export async function refundDepositViaStripe(
  stripePaymentId: string | null,
  refundCents: number
): Promise<number> {
  if (refundCents <= 0) return 0;
  if (!stripePaymentId) {
    throw new Error("No card payment on file for this order — cannot process a refund.");
  }

  const refund = await getStripe().refunds.create({
    payment_intent: stripePaymentId,
    amount: refundCents,
  });

  return refund.amount;
}
