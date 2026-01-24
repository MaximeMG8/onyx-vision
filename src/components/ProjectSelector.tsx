import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Check, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Project, PROJECT_COLORS, ProjectColor } from '@/types/project';
import CreateProjectDialog from './CreateProjectDialog';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string;
  onSwitchProject: (projectId: string) => void;
  onCreateProject: (name: string, targetAmount: number, color: ProjectColor, palierValue?: number) => Project;
  onDeleteProject: (projectId: string) => void;
}

const ProjectSelector = ({
  projects,
  activeProjectId,
  onSwitchProject,
  onCreateProject,
  onDeleteProject,
}: ProjectSelectorProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSelectProject = (projectId: string) => {
    onSwitchProject(projectId);
    setIsOpen(false);
  };

  const handleViewProgress = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setIsOpen(false);
    navigate(`/dashboard/${projectId}`);
  };

  const handleCreateProject = (name: string, targetAmount: number, color: ProjectColor, palierValue: number) => {
    const newProject = onCreateProject(name, targetAmount, color, palierValue);
    onSwitchProject(newProject.id);
    setIsCreateOpen(false);
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (projects.length > 1) {
      onDeleteProject(projectId);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground hover:bg-transparent font-extralight"
          >
            <FolderOpen className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Mes Projets
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-background border-border/30 w-80">
          <SheetHeader className="text-left">
            <SheetTitle className="text-foreground font-light tracking-wide">
              Mes Projets
            </SheetTitle>
            <SheetDescription className="text-muted-foreground font-extralight">
              Sélectionnez un projet ou créez-en un nouveau
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {projects.map((project) => {
              const colorConfig = PROJECT_COLORS[project.color];
              const isActive = project.id === activeProjectId;
              
              return (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(project.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-left group ${
                    isActive 
                      ? 'bg-card border border-border/50' 
                      : 'hover:bg-card/50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `hsl(${colorConfig.hsl})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light text-foreground truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-extralight">
                      {project.targetAmount.toLocaleString('fr-FR')}€
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => handleViewProgress(e, project.id)}
                      className="p-1.5 hover:bg-white/10 rounded transition-opacity"
                      title="View Progress"
                    >
                      <BarChart3 className="w-4 h-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
                    </button>
                    {isActive && (
                      <Check className="w-4 h-4 text-foreground" strokeWidth={1.5} />
                    )}
                    {!isActive && projects.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(true)}
              className="w-full border-border/30 hover:bg-card font-light"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Nouveau Projet
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <CreateProjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
};

export default ProjectSelector;
