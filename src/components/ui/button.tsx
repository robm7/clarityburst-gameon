import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline";
};

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-[var(--primary)] text-black hover:opacity-90",
  ghost: "bg-transparent text-[var(--foreground)] hover:bg-white/5",
  outline: "border border-white/20 text-[var(--foreground)] hover:bg-white/5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => (
    <button ref={ref} className={[base, variants[variant], className].join(" ")} {...props} />
  )
);
Button.displayName = "Button";
