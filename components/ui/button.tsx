import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-accent-gradient text-white hover:bg-accent-gradient-hover focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40",
      secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500 shadow-md",
      outline: "border border-slate-700/80 bg-slate-900/90 text-slate-100 hover:bg-slate-800/90 hover:border-slate-600 focus:ring-slate-500 shadow-sm",
      ghost: "text-slate-300 hover:bg-slate-900/50 focus:ring-slate-500",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };

