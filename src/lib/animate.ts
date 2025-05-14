
import { cn } from "@/lib/utils";

// Define animation variants for scroll reveal
export const fadeIn = (delay: number = 0): string => {
  return cn(
    "opacity-0 translate-y-4 transition-all duration-700 ease-out",
    "data-[state=visible]:opacity-100 data-[state=visible]:translate-y-0",
    delay && `delay-${delay}`
  );
};

export const fadeInLeft = (delay: number = 0): string => {
  return cn(
    "opacity-0 -translate-x-8 transition-all duration-700 ease-out",
    "data-[state=visible]:opacity-100 data-[state=visible]:translate-x-0",
    delay && `delay-${delay}`
  );
};

export const fadeInRight = (delay: number = 0): string => {
  return cn(
    "opacity-0 translate-x-8 transition-all duration-700 ease-out",
    "data-[state=visible]:opacity-100 data-[state=visible]:translate-x-0",
    delay && `delay-${delay}`
  );
};

export const scaleIn = (delay: number = 0): string => {
  return cn(
    "opacity-0 scale-95 transition-all duration-700 ease-out",
    "data-[state=visible]:opacity-100 data-[state=visible]:scale-100",
    delay && `delay-${delay}`
  );
};

// Define animation variants for hover effects
export const pulseOnHover = (): string => {
  return cn("transition-transform duration-300 hover:scale-[1.02]");
};

export const glowOnHover = (color: string = "brain-purple"): string => {
  return cn(`transition-all duration-300 hover:shadow-lg hover:shadow-${color}/20`);
};
