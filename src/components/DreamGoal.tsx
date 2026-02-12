import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, BarChart2 } from "lucide-react";
import ProgressRing from "./ProgressRing";
import LuxuryProgressBar from "./LuxuryProgressBar";
import PalierControls from "./PalierControls";
import DailyHistory from "./DailyHistory";
import DepositHistory from "./DepositHistory";
import DepositCalendar from "./DepositCalendar";
import ProgressChart from "./ProgressChart";
import AnimatedCounter from "./AnimatedCounter";
import Portfolio from "@/pages/Portfolio";
import ImageGallery from "./ImageGallery";
import GalleryManager from "./GalleryManager";
import { useProjectManager } from "@/hooks/useProjectManager";
import { useImageColor } from "@/hooks/useImageColor";
import { PROJECT_COLORS } from "@/types/project";
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
        title: "Bien joué",
        description: `+${count} palier${count > 1 ? 's' : ''} (${amount}€) ajouté${count > 1 ? 's' : ''}`,
        duration: 3000
      });
    }
  };

  const handleRemovePaliers = () => {
    const recentDeposits = getRecentDeposits(1);
    if (recentDeposits.length > 0) {
      removeDeposit(recentDeposits[0].id);
      toast({
        title: "Correction effectuée",
        description: "Dernier dépôt supprimé",
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
        <div className="text-muted-foreground font-extralight">Chargement...</div>
      </div>
    );
  }

  const projectImages = getProjectImages();
  // Calcul responsive et fluide des tailles - Mobile First
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 375;
  const ringSize = screenWidth < 640 ? Math.min(screenWidth * 0.75, 320) : Math.min(screenWidth * 0.5, 380);
  const imageSize = ringSize * 0.96;

  const accentHsl = PROJECT_COLORS[activeProject.color].hsl;

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center pt-16 pb-8 px-3 sm:px-6 gap-4 sm:gap-6 overflow-x-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Sticky Header with Project Selector, History, and Settings */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 animate-fade-up"
        style={{
          background: 'hsla(0, 0%, 0%, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Neon separator line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{
            background: `hsl(${accentHsl})`,
            boxShadow: `0 0 8px hsl(${accentHsl}), 0 0 16px hsl(${accentHsl} / 0.5)`,
          }}
        />

        {/* Header content */}
        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex-shrink-0">
            <Portfolio
              projects={projects}
              activeProjectId={activeProjectId}
              onSwitchProject={switchProject}
              onCreateProject={createProject}
              onDeleteProject={deleteProject}
              onUpdateProject={updateProject}
            />
          </div>

          <h1 className="uppercase tracking-[0.15em] sm:tracking-[0.25em] text-muted-foreground truncate font-bold text-sm sm:text-base flex-1 text-center">
            {activeProject.name}
          </h1>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => navigate("/master-analytics")}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
              aria-label="Analytiques globales"
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
        </div>
      </header>

      {/* Paliers Counter - Big Display */}
      <div className="w-full text-center animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-baseline justify-center gap-2">
          <AnimatedCounter
            value={currentPaliers}
            showCurrency={false}
            className="text-4xl sm:text-5xl font-extralight tracking-tight"
            style={{ color: 'hsl(var(--accent-color))' }}
          />
          <span className="text-xl sm:text-2xl font-extralight text-muted-foreground">
            / {totalPaliers}
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground font-extralight mt-2">
          paliers atteints
        </p>
      </div>

      {/* Luxury Progress Bar */}
      <div className="w-full max-w-md px-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
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
      <div className="w-full flex justify-center animate-scale-in relative px-2">
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
      <div className="w-full max-w-md px-2 animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <PalierControls
          onAdd={handleAddPaliers}
          onRemove={handleRemovePaliers}
          palierValue={activeProject.palierValue}
        />
      </div>

      {/* Daily History */}
      <div className="w-full max-w-md px-2 animate-fade-up" style={{ animationDelay: '0.4s' }}>
        <DailyHistory
          deposits={deposits}
          palierValue={activeProject.palierValue}
          allDeposits={getRecentDeposits(20)}
          onRemoveDeposit={removeDeposit}
        />
      </div>

      {/* Analytics Chart */}
      <div className="w-full max-w-md px-2 animate-fade-up" style={{ animationDelay: '0.45s' }}>
        <ProgressChart
          deposits={deposits}
          targetAmount={activeProject.targetAmount}
          accentColor={PROJECT_COLORS[activeProject.color].hsl}
        />
      </div>

      {/* Calendar */}
      <div className="w-full max-w-2xl px-2 mt-2 animate-fade-up" style={{ animationDelay: '0.5s' }}>
        <DepositCalendar depositDays={depositDays} />
      </div>

      {/* Gallery Manager Modal */}
      <GalleryManager
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={projectImages}
        onImagesChange={updateProjectImages}
        maxImages={10}
        accentColor={activeProject ? PROJECT_COLORS[activeProject.color].hsl : '0 0% 100%'}
      />
    </div>
  );
};

export default DreamGoal;
