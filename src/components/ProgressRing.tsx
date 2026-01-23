interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const ProgressRing = ({ 
  progress, 
  size = 280, 
  strokeWidth = 2,
  children 
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow layer */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: '0 0 40px 8px rgba(255, 255, 255, 0.15), 0 0 80px 20px rgba(255, 255, 255, 0.08)',
        }}
      />
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.2))',
        }}
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
          stroke="hsl(var(--accent-color))"
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
