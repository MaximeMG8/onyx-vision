import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  currency?: string;
}

const AnimatedCounter = ({ value, duration = 500, currency = "€" }: AnimatedCounterProps) => {
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

  return (
    <div className="flex items-baseline justify-center gap-1">
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
