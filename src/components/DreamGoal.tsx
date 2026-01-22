import { useState } from "react";
import ProgressRing from "./ProgressRing";
import SavingsDisplay from "./SavingsDisplay";
import AddSavingsButton from "./AddSavingsButton";
import luxuryWatch from "@/assets/luxury-watch.jpg";

const DreamGoal = () => {
  const [saved, setSaved] = useState(1650);
  const goal = 10000;
  const increment = 15;
  
  const progress = Math.min((saved / goal) * 100, 100);

  const handleAddSavings = () => {
    setSaved((prev) => Math.min(prev + increment, goal));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between py-16 px-6">
      {/* Header */}
      <header className="text-center animate-fade-up">
        <h1 className="text-xs uppercase tracking-[0.4em] text-muted-foreground font-medium">
          MyDream
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-10 flex-1 justify-center">
        {/* Progress Ring with Watch */}
        <div className="animate-scale-in">
          <ProgressRing progress={progress} size={300} strokeWidth={2}>
            <div className="relative w-56 h-56 hero-image-overlay rounded-full overflow-hidden">
              <img
                src={luxuryWatch}
                alt="Luxury Watch Goal"
                className="w-full h-full object-cover opacity-70 grayscale"
              />
            </div>
          </ProgressRing>
        </div>

        {/* Progress Percentage */}
        <p 
          className="text-sm tracking-[0.2em] text-dim font-light animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          {Math.round(progress)}% COMPLETE
        </p>

        {/* Savings Display */}
        <SavingsDisplay current={saved} goal={goal} />
      </main>

      {/* CTA Button */}
      <footer className="w-full max-w-xs">
        <AddSavingsButton amount={increment} onClick={handleAddSavings} />
      </footer>
    </div>
  );
};

export default DreamGoal;
