import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  currency?: string;
  showCurrency?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const AnimatedCounter = ({ 
  value, 
  duration = 500, 
  currency = "€",
  showCurrency = true,
  className,
  style
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const difference = endValue - startValue;
    
    if (difference === 0) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = Math.round(startValue + difference * easeOutQuart);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formattedValue = new Intl.NumberFormat('de-DE').format(displayValue);

  if (!showCurrency) {
    return (
      <span className={cn("text-5xl md:text-6xl font-extralight tracking-tight text-foreground", className)} style={style}>
        {formattedValue}
      </span>
    );
  }

  return (
    <div className={cn("flex items-baseline justify-center gap-1", className)}>
      <span className="text-5xl md:text-6xl font-extralight tracking-tight text-foreground luxury-text-gradient">
        {formattedValue}
      </span>
      <span className="text-3xl md:text-4xl font-extralight text-foreground ml-1">
        {currency}
      </span>
    </div>
  );
};

export default AnimatedCounter;
