import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-900/95 border border-slate-700/80 shadow-premium backdrop-blur-sm",
      outline: "border border-slate-800/60 shadow-sm",
    };

    return (
      <div
        ref={ref}
        className={`rounded-lg p-6 ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export { Card };

