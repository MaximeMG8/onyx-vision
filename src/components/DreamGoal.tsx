import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, History, Settings, BarChart2, Target, TrendingUp, Wallet } from "lucide-react";
import LuxuryProgressBar from "./LuxuryProgressBar";
import PalierControls from "./PalierControls";
import DailyHistory from "./DailyHistory";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import AnimatedCounter from "./AnimatedCounter";
import ProjectSelector from "./ProjectSelector";
import HeroProgressChart from "./HeroProgressChart";
import MinimalistKPIBlock from "./MinimalistKPIBlock";
import { useProjectManager } from "@/hooks/useProjectManager";
import { useToast } from "@/hooks/use-toast";
import luxuryWatch from "@/assets/luxury-watch.jpg";

const DreamGoal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
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
    getRecentDeposits,
  } = useProjectManager();

  const handleAddPaliers = (count: number) => {
    if (!activeProject) return;
    const amount = count * activeProject.palierValue;
    const deposit = addDeposit(amount);
    if (deposit) {
      toast({
        title: "Well done! 🎉",
        description: `+${count} milestone${count > 1 ? 's' : ''} (€${amount}) added!`,
        duration: 3000,
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
        duration: 3000,
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-extralight">Loading...</div>
      </div>
    );
  }

  const displayImage = activeProject.imageUrl || luxuryWatch;
  const remainingBalance = Math.max(activeProject.targetAmount - totalSaved, 0);

  // Get accent color for the current project
  const getAccentColorHex = () => {
    switch (activeProject.color) {
      case 'green': return '#10B981';
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'yellow': return '#EAB308';
      case 'purple': return '#A855F7';
      default: return '#FFFFFF';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col py-6 px-6 gap-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header with Project Selector, History, and Settings */}
      <header className="w-full flex items-center justify-between animate-fade-up">
        <ProjectSelector
          projects={projects}
          activeProjectId={activeProjectId}
          onSwitchProject={switchProject}
          onCreateProject={createProject}
          onDeleteProject={deleteProject}
          onUpdateProject={updateProject}
        />
        
        <h1 className="text-xs uppercase tracking-[0.5em] text-muted-foreground font-extralight">
          {activeProject.name}
        </h1>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate("/master-analytics")}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Global Analytics"
          >
            <BarChart2 className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
          
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
          
          <button
            onClick={() => navigate("/settings")}
            className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Hero Image with Overlay - Compact */}
      <div className="relative w-full max-w-md mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative aspect-[2/1] rounded-lg overflow-hidden">
          <img
            src={displayImage}
            alt={activeProject.name}
            className="w-full h-full object-cover opacity-60 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatedCounter 
              value={currentPaliers}
              showCurrency={false}
              className="text-4xl font-extralight tracking-tight"
              style={{ color: 'hsl(var(--accent-color))' }}
            />
            <span className="text-lg font-extralight text-white/50">
              / {totalPaliers}
            </span>
            <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-extralight mt-1">
              milestones
            </p>
          </div>
          
          {/* Camera button */}
          <button
            onClick={triggerImageUpload}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-300 hover:bg-black/80 hover:border-white/40"
            aria-label="Update image"
          >
            <Camera className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Horizontal KPI Cards */}
      <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <MinimalistKPIBlock
          icon={Target}
          value={`${progress.toFixed(0)}%`}
          label="Progress"
          accentColor={getAccentColorHex()}
          delay={0.1}
        />
        <MinimalistKPIBlock
          icon={TrendingUp}
          value={`€${(totalSaved / 1000).toFixed(1)}k`}
          label="Saved"
          accentColor={getAccentColorHex()}
          delay={0.2}
        />
        <MinimalistKPIBlock
          icon={Wallet}
          value={`€${(remainingBalance / 1000).toFixed(1)}k`}
          label="Remaining"
          delay={0.3}
        />
      </div>

      {/* Full-Width Progress Bar */}
      <div className="w-full max-w-lg mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <LuxuryProgressBar current={currentPaliers} total={totalPaliers} />
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-extralight tracking-wide">
          <span>€0</span>
          <span style={{ color: 'hsl(var(--accent-color))' }}>{totalSaved.toLocaleString('de-DE')}€</span>
          <span>{activeProject.targetAmount.toLocaleString('de-DE')}€</span>
        </div>
      </div>

      {/* Wide Horizontal Growth Chart */}
      <div className="w-full animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight mb-3 text-center">
          Growth Timeline
        </p>
        <HeroProgressChart 
          deposits={deposits} 
          targetAmount={activeProject.targetAmount}
          projectColor={activeProject.color}
        />
      </div>

      {/* Palier Controls */}
      <div className="w-full max-w-sm mx-auto animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <PalierControls 
          onAdd={handleAddPaliers}
          onRemove={handleRemovePaliers}
          palierValue={activeProject.palierValue}
        />
      </div>

      {/* Daily History */}
      <div className="w-full max-w-sm mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <DailyHistory deposits={deposits} palierValue={activeProject.palierValue} />
      </div>

      {/* Calendar */}
      <div className="w-full mt-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
        <DepositCalendar depositDays={depositDays} />
      </div>
    </div>
  );
};

export default DreamGoal;
