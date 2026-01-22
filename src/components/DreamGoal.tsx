import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import ProgressRing from "./ProgressRing";
import SavingsDisplay from "./SavingsDisplay";
import AddSavingsButton from "./AddSavingsButton";
import luxuryWatch from "@/assets/luxury-watch.jpg";

const DreamGoal = () => {
  const [saved, setSaved] = useState(1650);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const goal = 10000;
  const increment = 15;
  
  const progress = Math.min((saved / goal) * 100, 100);

  const handleAddSavings = () => {
    setSaved((prev) => Math.min(prev + increment, goal));
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
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-between py-10 px-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header */}
      <header className="text-center animate-fade-up">
        <h1 className="text-xs uppercase tracking-[0.5em] text-muted-foreground font-extralight">
          MyDream
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center gap-6 flex-1 justify-center">
        {/* Progress Ring with Watch - 50vh height */}
        <div className="animate-scale-in relative">
          <ProgressRing progress={progress} size={Math.min(window.innerWidth * 0.85, 420)} strokeWidth={2}>
            <div 
              className="relative hero-image-overlay rounded-full overflow-hidden"
              style={{ 
                width: Math.min(window.innerWidth * 0.75, 380),
                height: Math.min(window.innerWidth * 0.75, 380),
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
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110 hover:border-foreground/30"
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
