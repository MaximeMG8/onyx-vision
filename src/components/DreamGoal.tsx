import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, History, Settings, BarChart2 } from "lucide-react";
import ProgressRing from "./ProgressRing";
import LuxuryProgressBar from "./LuxuryProgressBar";
import PalierControls from "./PalierControls";
import DailyHistory from "./DailyHistory";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import AnimatedCounter from "./AnimatedCounter";
import ProjectSelector from "./ProjectSelector";
import { useProjectManager } from "@/hooks/useProjectManager";
import { useToast } from "@/hooks/use-toast";
import luxuryWatch from "@/assets/luxury-watch.jpg";
const DreamGoal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const {
    isLoaded,
    projects,
    activeProject,
    activeProjectId,
    deposits,
    totalSaved,
    totalPaliers,
    currentPaliers,
    progress,
    depositDays,
    switchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectImage,
    addDeposit,
    removeDeposit,
    getRecentDeposits
  } = useProjectManager();
  const handleAddPaliers = (count: number) => {
    if (!activeProject) return;
    const amount = count * activeProject.palierValue;
    const deposit = addDeposit(amount);
    if (deposit) {
      toast({
        title: "Well done! 🎉",
        description: `+${count} milestone${count > 1 ? 's' : ''} (€${amount}) added!`,
        duration: 3000
      });
    }
  };
  const handleRemovePaliers = () => {
    const recentDeposits = getRecentDeposits(1);
    if (recentDeposits.length > 0) {
      removeDeposit(recentDeposits[0].id);
      toast({
        title: "Correction made",
        description: "Last deposit removed",
        duration: 3000
      });
    }
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        updateProjectImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Show loading state
  if (!isLoaded || !activeProject) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-extralight">Loading...</div>
      </div>;
  }
  const displayImage = activeProject.imageUrl || luxuryWatch;
  return <div className="min-h-screen bg-background flex flex-col items-center py-6 px-6 gap-6">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

      {/* Header with Project Selector, History, and Settings */}
      <header className="w-full flex items-center justify-between animate-fade-up">
        <ProjectSelector projects={projects} activeProjectId={activeProjectId} onSwitchProject={switchProject} onCreateProject={createProject} onDeleteProject={deleteProject} onUpdateProject={updateProject} />
        
        <h1 className="uppercase tracking-[0.5em] text-muted-foreground font-extralight text-xs">
          {activeProject.name}
        </h1>
        
        <div className="flex items-center gap-1">
          <button onClick={() => navigate("/master-analytics")} className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50" aria-label="Global Analytics">
            <BarChart2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          
          <DepositHistory deposits={getRecentDeposits(20)} onRemoveDeposit={removeDeposit}>
            <button className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50" aria-label="Historique">
              <History className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            </button>
          </DepositHistory>
          
          <button onClick={() => navigate("/settings")} className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50" aria-label="Paramètres">
            <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Paliers Counter - Big Display */}
      <div className="text-center animate-fade-up" style={{
      animationDelay: '0.1s'
    }}>
        <div className="flex items-baseline justify-center gap-2">
          <AnimatedCounter value={currentPaliers} showCurrency={false} className="text-5xl font-extralight tracking-tight" style={{
          color: 'hsl(var(--accent-color))'
        }} />
          <span className="text-2xl font-extralight text-muted-foreground">
            / {totalPaliers}
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight mt-2">
          milestones achieved
        </p>
      </div>

      {/* Luxury Progress Bar */}
      <div className="w-full max-w-sm animate-fade-up" style={{
      animationDelay: '0.15s'
    }}>
        <LuxuryProgressBar current={currentPaliers} total={totalPaliers} />
        <div className="flex justify-between mt-3 text-xs text-muted-foreground font-extralight tracking-wide">
          <span>0€</span>
          <span style={{
          color: 'hsl(var(--accent-color))'
        }}>{totalSaved.toLocaleString('fr-FR')}€</span>
          <span>{activeProject.targetAmount.toLocaleString('fr-FR')}€</span>
        </div>
      </div>

      {/* Progress Ring with Image */}
      <div className="animate-scale-in relative">
        <ProgressRing progress={progress} size={Math.min(window.innerWidth * 0.6, 280)} strokeWidth={2}>
          <div className="relative hero-image-overlay rounded-full overflow-hidden" style={{
          width: Math.min(window.innerWidth * 0.52, 250),
          height: Math.min(window.innerWidth * 0.52, 250)
        }}>
            <img src={displayImage} alt={activeProject.name} className="w-full h-full object-cover opacity-75 grayscale" />
          </div>
        </ProgressRing>
        
        {/* Camera button overlay */}
        <button onClick={triggerImageUpload} className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-300 hover:bg-background hover:scale-110 hover:border-foreground/30" aria-label="Modifier la photo">
          <Camera className="w-4 h-4 text-foreground" strokeWidth={1.5} />
        </button>
      </div>

      {/* Palier Controls */}
      <div className="w-full max-w-sm animate-fade-up" style={{
      animationDelay: '0.3s'
    }}>
        <PalierControls onAdd={handleAddPaliers} onRemove={handleRemovePaliers} palierValue={activeProject.palierValue} />
      </div>

      {/* Daily History */}
      <div className="w-full max-w-sm animate-fade-up" style={{
      animationDelay: '0.4s'
    }}>
        <DailyHistory deposits={deposits} palierValue={activeProject.palierValue} />
      </div>

      {/* Calendar */}
      <div className="w-full mt-2 animate-fade-up" style={{
      animationDelay: '0.5s'
    }}>
        <DepositCalendar depositDays={depositDays} />
      </div>
    </div>;
};
export default DreamGoal;