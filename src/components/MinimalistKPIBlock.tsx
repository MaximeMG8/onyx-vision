import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MinimalistKPIBlockProps {
  icon?: LucideIcon;
  value: string | number;
  label: string;
  suffix?: string;
  accentColor?: string;
  delay?: number;
}

const MinimalistKPIBlock = ({ 
  icon: Icon,
  value, 
  label,
  suffix,
  accentColor,
  delay = 0
}: MinimalistKPIBlockProps) => {
  return (
    <motion.div 
      className="text-center p-4 border border-white/5 rounded-lg bg-white/[0.01]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {Icon && (
        <div className="flex justify-center mb-2">
          <Icon size={16} strokeWidth={1} className="text-white/40" />
        </div>
      )}
      <div className="flex items-baseline justify-center gap-1">
        <span 
          className="text-3xl font-thin tracking-tight"
          style={{ color: accentColor || 'white' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-lg font-thin text-white/40">
            {suffix}
          </span>
        )}
      </div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-extralight mt-1">
        {label}
      </p>
    </motion.div>
  );
};

export default MinimalistKPIBlock;
