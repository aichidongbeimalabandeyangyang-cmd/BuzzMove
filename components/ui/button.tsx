import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", className, disabled, children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";

    const variantClasses =
      variant === "primary"
        ? "bg-[var(--primary)] text-[var(--background)] hover:brightness-110"
        : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--primary-10)] hover:text-[var(--primary)]";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(base, sizeClasses[size], variantClasses, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
