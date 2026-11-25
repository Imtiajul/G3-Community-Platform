import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2 text-sm text-foreground ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-[#63DB9A] focus-visible:ring-1 focus-visible:ring-[#63DB9A] disabled:cursor-not-allowed disabled:opacity-50 transition-all font-bangla",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
