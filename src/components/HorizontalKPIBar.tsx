import { motion } from 'framer-motion';

interface HorizontalKPIBarProps {
  label: string;
  value: number;
  maxValue: number;
  displayValue: string;
  accentColor?: string;
}

const HorizontalKPIBar = ({ 
  label, 
  value, 
  maxValue, 
  displayValue,
  accentColor 
}: HorizontalKPIBarProps) => {
  const progress = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight">
          {label}
        </span>
        <span 
          className="text-lg font-thin tracking-wide"
          style={{ color: accentColor || 'white' }}
        >
          {displayValue}
        </span>
      </div>
      <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: accentColor || 'white',
            boxShadow: `0 0 10px ${accentColor || 'white'}40`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

export default HorizontalKPIBar;
