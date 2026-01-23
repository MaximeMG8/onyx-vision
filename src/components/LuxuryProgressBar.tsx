import { motion } from "framer-motion";

interface LuxuryProgressBarProps {
  current: number;
  total: number;
}

const LuxuryProgressBar = ({ current, total }: LuxuryProgressBarProps) => {
  const progress = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div className="relative h-3 bg-card rounded-full overflow-hidden border border-luxury-gold/30">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-card to-black opacity-50" />
        
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, hsl(var(--luxury-gold)) 0%, hsl(45, 80%, 60%) 50%, hsl(var(--luxury-gold)) 100%)",
            boxShadow: "0 0 10px hsl(var(--luxury-gold) / 0.5), 0 0 20px hsl(var(--luxury-gold) / 0.3)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Shine effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </div>
    </div>
  );
};

export default LuxuryProgressBar;
