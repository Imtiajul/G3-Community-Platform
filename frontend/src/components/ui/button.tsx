import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-mint text-black border border-mint hover:bg-[#72eab0] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[0px] active:translate-y-[0px] shadow-sm",
        primary:
          "bg-mint text-black border border-mint hover:bg-[#72eab0] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[0px] active:translate-y-[0px] shadow-sm",
        secondary:
          "bg-lime text-black border border-lime hover:bg-[#ebed6f] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[0px] active:translate-y-[0px] shadow-sm",
        destructive:
          "bg-neon text-black border border-neon hover:bg-[#ff67d9] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[0px] active:translate-y-[0px] shadow-sm",
        outline:
          "bg-white hover:bg-gray-50 text-black border border-[#e5e7eb] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[0px] active:translate-y-[0px] shadow-sm",
        ghost:
          "text-black hover:bg-lime/30 border border-transparent hover:border-[#e5e7eb] font-semibold",
        link: "text-black underline-offset-4 hover:underline hover:text-primary",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-7 text-base font-bold",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
