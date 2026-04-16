/** Shown on pricing, order flow, and order emails. */
export const NOT_EDIBLE_DISCLAIMER = "For decorative use only — not edible.";

/** Inline HTML block for transactional emails (order confirmation). */
export function notEdibleDisclaimerEmailHtml(): string {
  return `
    <p style="font-size:12px;color:#666;line-height:1.6;border-left:3px solid #C4622D;padding:12px 16px;margin:24px 0;background:#faf8f5;border-radius:0 8px 8px 0;">
      <strong style="color:#2d2d2a;">Important:</strong> ${NOT_EDIBLE_DISCLAIMER}
    </p>
  `;
}
