import { useState, useRef } from "react";
import { Camera, History } from "lucide-react";
import ProgressRing from "./ProgressRing";
import LuxuryProgressBar from "./LuxuryProgressBar";
import PalierControls from "./PalierControls";
import DailyHistory from "./DailyHistory";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import AnimatedCounter from "./AnimatedCounter";
import { useDepositManager } from "@/hooks/useDepositManager";
import { useToast } from "@/hooks/use-toast";
import luxuryWatch from "@/assets/luxury-watch.jpg";

const DreamGoal = () => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const goal = 10000;
  const palierValue = 15;
  const totalPaliers = Math.ceil(goal / palierValue); // 667 paliers
  
  const {
    deposits,
    totalSaved,
    timeUntilMidnight,
    depositDays,
    addDeposit,
    removeDeposit,
    getRecentDeposits,
  } = useDepositManager(0);
  
  const currentPaliers = Math.floor(totalSaved / palierValue);
  const progress = Math.min((currentPaliers / totalPaliers) * 100, 100);

  const handleAddPaliers = (count: number) => {
    const amount = count * palierValue;
    const deposit = addDeposit(amount);
    if (deposit) {
      toast({
        title: "Bravo ! 🎉",
        description: `+${count} palier${count > 1 ? 's' : ''} (${amount}€) ajouté${count > 1 ? 's' : ''} !`,
        duration: 3000,
      });
    }
  };

  const handleRemovePaliers = (count: number) => {
    const recentDeposits = getRecentDeposits(1);
    if (recentDeposits.length > 0) {
      removeDeposit(recentDeposits[0].id);
      toast({
        title: "Correction effectuée",
        description: "Dernier dépôt supprimé",
        duration: 3000,
      });
    }
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
    <div className="min-h-screen bg-[#000000] flex flex-col items-center py-6 px-6 gap-6">
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
        <div className="w-10" />
        <h1 className="text-xs uppercase tracking-[0.5em] text-muted-foreground font-extralight">
          MyDream
        </h1>
        <DepositHistory 
          deposits={getRecentDeposits(20)} 
          onRemoveDeposit={removeDeposit}
        >
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Historique"
          >
            <History className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </DepositHistory>
      </header>

      {/* Paliers Counter - Big Display */}
      <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-baseline justify-center gap-2">
          <AnimatedCounter 
            value={currentPaliers}
            showCurrency={false}
            className="text-5xl font-extralight text-foreground tracking-tight"
          />
          <span className="text-2xl font-extralight text-muted-foreground">
            / {totalPaliers}
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight mt-2">
          paliers franchis
        </p>
      </div>

      {/* Luxury Progress Bar */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <LuxuryProgressBar current={currentPaliers} total={totalPaliers} />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground font-extralight">
          <span>0€</span>
          <span className="text-luxury-gold">{totalSaved.toLocaleString('fr-FR')}€</span>
          <span>{goal.toLocaleString('fr-FR')}€</span>
        </div>
      </div>

      {/* Progress Ring with Watch */}
      <div className="animate-scale-in relative">
        <ProgressRing progress={progress} size={Math.min(window.innerWidth * 0.6, 280)} strokeWidth={2}>
          <div 
            className="relative hero-image-overlay rounded-full overflow-hidden"
            style={{ 
              width: Math.min(window.innerWidth * 0.52, 250),
              height: Math.min(window.innerWidth * 0.52, 250),
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
          className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110 hover:border-foreground/30"
          aria-label="Modifier la photo"
        >
          <Camera className="w-4 h-4 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* Palier Controls */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <PalierControls 
          onAdd={handleAddPaliers}
          onRemove={handleRemovePaliers}
        />
      </div>

      {/* Daily History */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <DailyHistory deposits={deposits} palierValue={palierValue} />
      </div>

      {/* Calendar */}
      <div className="w-full mt-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
        <DepositCalendar depositDays={depositDays} />
      </div>
    </div>
  );
};

export default DreamGoal;
