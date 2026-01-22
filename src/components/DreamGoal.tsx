import { useState, useRef } from "react";
import { Camera, History } from "lucide-react";
import ProgressRing from "./ProgressRing";
import SavingsDisplay from "./SavingsDisplay";
import AddSavingsButton from "./AddSavingsButton";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import { useDepositManager } from "@/hooks/useDepositManager";
import { useToast } from "@/hooks/use-toast";
import luxuryWatch from "@/assets/luxury-watch.jpg";

const DreamGoal = () => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const goal = 10000;
  const increment = 15;
  
  const {
    totalSaved,
    hasDepositedToday,
    timeUntilMidnight,
    depositDays,
    addDeposit,
    removeDeposit,
    getRecentDeposits,
  } = useDepositManager(1650);
  
  const progress = Math.min((totalSaved / goal) * 100, 100);

  const handleAddSavings = () => {
    if (hasDepositedToday) return;
    
    const deposit = addDeposit(increment);
    if (deposit) {
      toast({
        title: "Bravo ! 🎉",
        description: `+${increment}€ ajoutés à ton rêve`,
        duration: 3000,
      });
    }
  };

  const handleRemoveDeposit = (id: string) => {
    removeDeposit(id);
    toast({
      title: "Dépôt supprimé",
      description: "Le dernier dépôt a été annulé",
      duration: 3000,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const displayImage = customImage || luxuryWatch;

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between py-8 px-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header with History button */}
      <header className="w-full flex items-center justify-between animate-fade-up">
        <div className="w-10" /> {/* Spacer for centering */}
        <h1 className="text-xs uppercase tracking-[0.5em] text-muted-foreground font-extralight">
          MyDream
        </h1>
        <DepositHistory 
          deposits={getRecentDeposits(20)} 
          onRemoveDeposit={handleRemoveDeposit}
        >
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Historique"
          >
            <History className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </DepositHistory>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-4 flex-1 justify-center">
        {/* Progress Ring with Watch */}
        <div className="animate-scale-in relative">
          <ProgressRing progress={progress} size={Math.min(window.innerWidth * 0.8, 380)} strokeWidth={2}>
            <div 
              className="relative hero-image-overlay rounded-full overflow-hidden"
              style={{ 
                width: Math.min(window.innerWidth * 0.7, 340),
                height: Math.min(window.innerWidth * 0.7, 340),
              }}
            >
              <img
                src={displayImage}
                alt="Mon Objectif Luxe"
                className="w-full h-full object-cover opacity-75 grayscale"
              />
            </div>
          </ProgressRing>
          
          {/* Camera button overlay */}
          <button
            onClick={triggerImageUpload}
            className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110 hover:border-foreground/30"
            aria-label="Modifier la photo"
          >
            <Camera className="w-5 h-5 text-foreground" strokeWidth={1.5} />
          </button>
        </div>

        {/* Progress Percentage */}
        <p 
          className="text-xs tracking-[0.3em] text-dim font-extralight animate-fade-up uppercase"
          style={{ animationDelay: '0.2s' }}
        >
          {Math.round(progress)}% Complété
        </p>

        {/* Savings Display */}
        <SavingsDisplay current={totalSaved} goal={goal} />
      </main>

      {/* CTA Button with Timer */}
      <footer className="w-full max-w-xs space-y-3">
        <AddSavingsButton 
          amount={increment} 
          onClick={handleAddSavings}
          disabled={hasDepositedToday}
          completedText="Objectif du jour atteint !"
        />
        
        {hasDepositedToday && (
          <p className="text-xs text-center text-muted-foreground font-extralight tracking-wide animate-fade-up">
            Prochain dépôt dans {timeUntilMidnight}
          </p>
        )}
      </footer>

      {/* Calendar */}
      <div className="w-full mt-6 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <DepositCalendar depositDays={depositDays} />
      </div>
    </div>
  );
};

export default DreamGoal;
