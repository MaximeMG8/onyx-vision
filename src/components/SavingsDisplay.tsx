interface SavingsDisplayProps {
  current: number;
  goal: number;
  currency?: string;
}

const SavingsDisplay = ({ current, goal, currency = "€" }: SavingsDisplayProps) => {
  const formattedCurrent = new Intl.NumberFormat('de-DE').format(current);
  const formattedGoal = new Intl.NumberFormat('de-DE').format(goal);

  return (
    <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-light">
        Saved
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-5xl md:text-6xl font-light tracking-tight text-foreground luxury-text-gradient">
          {formattedCurrent}
        </span>
        <span className="text-3xl md:text-4xl font-light text-foreground ml-1">
          {currency}
        </span>
      </div>
      <p className="text-muted-foreground text-lg mt-2 font-light">
        / {formattedGoal} {currency}
      </p>
    </div>
  );
};

export default SavingsDisplay;
