import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/types/project";

const PROJECTS_KEY = 'mydream_projects';
const DEPOSITS_KEY = 'mydream_all_deposits';
const ACTIVE_PROJECT_KEY = 'mydream_active_project';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [targetAmount, setTargetAmount] = useState("");
  const [palierValue, setPalierValue] = useState("");

  // Load active project on mount
  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    const storedActiveId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const activeId = storedActiveId ? JSON.parse(storedActiveId) : projects[0]?.id;
      const project = projects.find(p => p.id === activeId) || projects[0];
      
      if (project) {
        setActiveProject(project);
        setTargetAmount(project.targetAmount.toString());
        setPalierValue(project.palierValue.toString());
      }
    }
  }, []);

  const handleSaveTarget = () => {
    if (!activeProject) return;
    
    const newTarget = parseFloat(targetAmount);
    if (isNaN(newTarget) || newTarget <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive",
      });
      return;
    }

    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === activeProject.id ? { ...p, targetAmount: newTarget } : p
      );
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
      setActiveProject({ ...activeProject, targetAmount: newTarget });
      
      toast({
        title: "Objectif modifié",
        description: `Nouvel objectif : ${newTarget.toLocaleString('fr-FR')}€`,
      });
    }
  };

  const handleSavePalier = () => {
    if (!activeProject) return;
    
    const newPalier = parseFloat(palierValue);
    if (isNaN(newPalier) || newPalier <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une valeur valide",
        variant: "destructive",
      });
      return;
    }

    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    if (storedProjects) {
      const projects: Project[] = JSON.parse(storedProjects);
      const updatedProjects = projects.map(p =>
        p.id === activeProject.id ? { ...p, palierValue: newPalier } : p
      );
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
      setActiveProject({ ...activeProject, palierValue: newPalier });
      
      toast({
        title: "Dépôt modifié",
        description: `Nouvelle valeur : ${newPalier}€ par palier`,
      });
    }
  };

  const handleReset = () => {
    if (!activeProject) return;
    
    // Remove all deposits for this project
    const storedDeposits = localStorage.getItem(DEPOSITS_KEY);
    if (storedDeposits) {
      const deposits = JSON.parse(storedDeposits);
      const filteredDeposits = deposits.filter((d: { projectId: string }) => d.projectId !== activeProject.id);
      localStorage.setItem(DEPOSITS_KEY, JSON.stringify(filteredDeposits));
    }
    
    toast({
      title: "Compteur réinitialisé",
      description: "Tous les dépôts ont été supprimés pour ce projet",
    });
    
    navigate("/");
  };

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-extralight">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background flex flex-col py-6 px-4 sm:px-6">
      {/* Header */}
      <header className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </button>
        <h1 className="text-xs uppercase tracking-[0.3em] sm:tracking-[0.5em] text-muted-foreground font-extralight">
          Configuration
        </h1>
      </header>

      {/* Project Name */}
      <div className="mb-8 sm:mb-10">
        <p className="text-sm text-muted-foreground font-extralight mb-1">Projet actif</p>
        <p className="text-lg sm:text-xl font-extralight" style={{ color: 'hsl(var(--accent-color))' }}>
          {activeProject.name}
        </p>
      </div>

      {/* Settings Form */}
      <div className="space-y-8 sm:space-y-10 w-full max-w-md">
        {/* Target Amount */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight">
            Objectif Total (€)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="settings-input flex-1"
              placeholder="10000"
            />
            <Button
              onClick={handleSaveTarget}
              variant="outline"
              className="border-border/30 hover:border-foreground/50 font-extralight w-full sm:w-auto"
            >
              Appliquer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 font-extralight">
            La progression sera automatiquement recalculée
          </p>
        </div>

        {/* Palier Value */}
        <div className="space-y-3">
          <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight">
            Valeur du Palier (€)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="number"
              value={palierValue}
              onChange={(e) => setPalierValue(e.target.value)}
              className="settings-input flex-1"
              placeholder="15"
            />
            <Button
              onClick={handleSavePalier}
              variant="outline"
              className="border-border/30 hover:border-foreground/50 font-extralight w-full sm:w-auto"
            >
              Appliquer
            </Button>
          </div>
          <p className="text-xs text-muted-foreground/60 font-extralight">
            Montant ajouté à chaque palier franchi
          </p>
        </div>

        {/* Reset Section */}
        <div className="pt-10 border-t border-border/20">
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-extralight">
              Zone de danger
            </label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 font-extralight"
                >
                  <RotateCcw className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Réinitialiser le compteur
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-background border-border/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-extralight">
                    Confirmer la réinitialisation
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground font-extralight">
                    Cette action est irréversible. Tous vos dépôts pour le projet "{activeProject.name}" seront supprimés et votre compteur sera remis à zéro.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-extralight border-border/30">
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleReset}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-extralight"
                  >
                    Réinitialiser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground/60 font-extralight">
              Remet tous les paliers à zéro pour ce projet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
