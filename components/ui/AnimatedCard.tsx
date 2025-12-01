"use client";

import { Card } from "./card";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className = "", delay = 0 }: AnimatedCardProps) {
  return (
    <Card
      className={`transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${className}`}
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
      }}
    >
      {children}
    </Card>
  );
}

