import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-[#63DB9A] bg-[#63DB9A]/20 text-black",
        secondary:
          "border-[#E2E361] bg-[#E2E361]/25 text-black",
        destructive:
          "border-[#FF49D2] bg-[#FF49D2]/15 text-[#9c0a76]",
        outline:
          "border-[#e5e7eb] bg-white text-black",
        success:
          "border-[#63DB9A] bg-[#63DB9A]/20 text-[#0f5132] font-semibold",
        warning:
          "border-[#E2E361] bg-[#E2E361]/30 text-black font-semibold",
        teal:
          "border-[#63DB9A] bg-[#63DB9A] text-black font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
