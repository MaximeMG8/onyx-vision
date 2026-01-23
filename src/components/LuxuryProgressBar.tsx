import { motion } from "framer-motion";

interface LuxuryProgressBarProps {
  current: number;
  total: number;
}

const LuxuryProgressBar = ({ current, total }: LuxuryProgressBarProps) => {
  const progress = Math.min((current / total) * 100, 100);

  return (
    <div className="w-full">
      <div className="relative h-1 bg-muted rounded-full overflow-hidden border border-border/20">
        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
          style={{
            boxShadow: "0 0 8px hsl(var(--foreground) / 0.3)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default LuxuryProgressBar;
