import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, BarChart2 } from "lucide-react";
import ProgressRing from "./ProgressRing";
import LuxuryProgressBar from "./LuxuryProgressBar";
import PalierControls from "./PalierControls";
import DailyHistory from "./DailyHistory";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import AnimatedCounter from "./AnimatedCounter";
import ProjectSelector from "./ProjectSelector";
import ImageGallery from "./ImageGallery";
import GalleryManager from "./GalleryManager";
import { useProjectManager } from "@/hooks/useProjectManager";
import { useImageColor } from "@/hooks/useImageColor";
import { useToast } from "@/hooks/use-toast";

const DreamGoal = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();
  const { toast } = useToast();
  const { dominantColor } = useImageColor(currentImageUrl);

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
    updateProjectImages,
    getProjectImages
  } = useProjectManager();

  const handleAddPaliers = (count: number) => {
    if (!activeProject) return;
    const amount = count * activeProject.palierValue;
    const deposit = addDeposit(amount);
    if (deposit) {
      toast({
        title: "Well done! ",
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

  const handleImageChange = useCallback((imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
  }, []);

  // Show loading state
  if (!isLoaded || !activeProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-extralight">Loading...</div>
      </div>
    );
  }

  const projectImages = getProjectImages();
  const ringSize = Math.min(window.innerWidth * 0.6, 280);
  const imageSize = Math.min(window.innerWidth * 0.58, 270);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-6 px-4 gap-6 overflow-x-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header with Project Selector, History, and Settings */}
      <header className="w-full max-w-full flex items-center justify-between animate-fade-up">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <ProjectSelector
              projects={projects}
              activeProjectId={activeProjectId}
              onSwitchProject={switchProject}
              onCreateProject={createProject}
              onDeleteProject={deleteProject}
              onUpdateProject={updateProject}
            />
          </div>
          
          <h1 className="uppercase tracking-[0.25em] text-muted-foreground truncate font-bold text-base">
            {activeProject.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => navigate("/master-analytics")}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Global Analytics"
          >
            <BarChart2 className="text-muted-foreground w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Paramètres"
          >
            <Settings className="text-muted-foreground w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Paliers Counter - Big Display */}
      <div className="text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-baseline justify-center gap-2">
          <AnimatedCounter
            value={currentPaliers}
            showCurrency={false}
            className="text-5xl font-extralight tracking-tight"
            style={{ color: 'hsl(var(--accent-color))' }}
          />
          <span className="text-2xl font-extralight text-muted-foreground">
            / {totalPaliers}
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight mt-2">
          milestones achieved
        </p>
      </div>

      {/* Luxury Progress Bar */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.15s' }}>
        <LuxuryProgressBar current={currentPaliers} total={totalPaliers} />
        <div className="flex justify-between mt-3 text-xs text-muted-foreground font-extralight tracking-wide">
          <span>0€</span>
          <span style={{ color: 'hsl(var(--accent-color))' }}>
            {totalSaved.toLocaleString('fr-FR')}€
          </span>
          <span>{activeProject.targetAmount.toLocaleString('fr-FR')}€</span>
        </div>
      </div>

      {/* Progress Ring with Image Gallery - Always show gallery component for thumbnail */}
      <div className="animate-scale-in relative">
        <ProgressRing progress={progress} size={ringSize} strokeWidth={2} glowColor={dominantColor}>
          <ImageGallery
            project={activeProject}
            size={imageSize}
            onOpenGalleryManager={() => setIsGalleryOpen(true)}
            onImageChange={handleImageChange}
          />
        </ProgressRing>
      </div>

      {/* Palier Controls */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <PalierControls
          onAdd={handleAddPaliers}
          onRemove={handleRemovePaliers}
          palierValue={activeProject.palierValue}
        />
      </div>

      {/* Daily History */}
      <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <DailyHistory 
          deposits={deposits} 
          palierValue={activeProject.palierValue}
          allDeposits={getRecentDeposits(20)}
          onRemoveDeposit={removeDeposit}
        />
      </div>

      {/* Calendar */}
      <div className="w-full mt-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
        <DepositCalendar depositDays={depositDays} />
      </div>

      {/* Gallery Manager Modal */}
      <GalleryManager
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={projectImages}
        onImagesChange={updateProjectImages}
        maxImages={10}
      />
    </div>
  );
};

export default DreamGoal;
