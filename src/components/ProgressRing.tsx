import { useMemo } from 'react';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  glowColor?: string; // HSL format: "h s% l%"
  children?: React.ReactNode;
}

const ProgressRing = ({ 
  progress, 
  size = 280, 
  strokeWidth = 2,
  glowColor = '0 0% 100%', // Default white
  children 
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  // Generate glow styles based on the dynamic color
  const glowStyles = useMemo(() => ({
    outerGlow: {
      boxShadow: `0 0 40px 8px hsla(${glowColor} / 0.2), 0 0 80px 20px hsla(${glowColor} / 0.1), 0 0 120px 40px hsla(${glowColor} / 0.05)`,
      transition: 'box-shadow 0.8s ease-out',
    },
    svgFilter: {
      filter: `drop-shadow(0 0 12px hsla(${glowColor} / 0.5)) drop-shadow(0 0 24px hsla(${glowColor} / 0.3))`,
      transition: 'filter 0.8s ease-out',
    },
  }), [glowColor]);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow layer */}
      <div 
        className="absolute inset-0 rounded-full"
        style={glowStyles.outerGlow}
      />
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={glowStyles.svgFilter}
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`hsl(${glowColor})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            '--progress-offset': offset,
          } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default ProgressRing;
