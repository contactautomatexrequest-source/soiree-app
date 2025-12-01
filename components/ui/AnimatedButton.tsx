"use client";

import { Button } from "./button";
import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "outline" | "ghost";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AnimatedButton({
  children,
  onClick,
  disabled,
  loading,
  variant = "default",
  className = "",
  size = "md",
}: AnimatedButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant === "default" ? "primary" : variant}
      size={size}
      className={`transition-all duration-200 ease-out active:scale-[0.98] hover:shadow-md ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></span>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

