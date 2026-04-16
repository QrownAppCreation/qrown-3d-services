import { cn } from "@/lib/utils";
import { NOT_EDIBLE_DISCLAIMER } from "@/lib/disclaimer";

export function NotEdibleDisclaimer({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        "text-muted-foreground border-l-4 border-[#C4622D] bg-[#faf8f5] pl-3 py-2 rounded-r-md",
        compact ? "text-xs" : "text-sm",
        className
      )}
    >
      <span className="font-semibold text-foreground/90">Important: </span>
      {NOT_EDIBLE_DISCLAIMER}
    </p>
  );
}
