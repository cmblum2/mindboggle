
import React from "react";
import { cn } from "@/lib/utils";

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: "slow" | "medium" | "fast";
  delay?: number;
}

const FloatingElement = ({
  children,
  className,
  speed = "medium",
  delay = 0,
}: FloatingElementProps) => {
  const speedMap = {
    slow: "animate-float-slow",
    medium: "animate-float",
    fast: "animate-float-fast",
  };

  return (
    <div 
      className={cn(
        speedMap[speed],
        delay && `animation-delay-${delay}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default FloatingElement;
