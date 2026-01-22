import AnimatedCounter from "./AnimatedCounter";

interface SavingsDisplayProps {
  current: number;
  goal: number;
  currency?: string;
}

const SavingsDisplay = ({ current, goal, currency = "€" }: SavingsDisplayProps) => {
  const formattedGoal = new Intl.NumberFormat('de-DE').format(goal);

  return (
    <div className="text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
      <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4 font-extralight">
        Épargné
      </p>
      <AnimatedCounter value={current} currency={currency} />
      <p className="text-muted-foreground text-lg mt-2 font-extralight">
        / {formattedGoal} {currency}
      </p>
    </div>
  );
};

export default SavingsDisplay;
