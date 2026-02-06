import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Check, Trash2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Project, PROJECT_COLORS, ProjectColor } from '@/types/project';
import CreateProjectDialog from './CreateProjectDialog';
import EditProjectDialog from './EditProjectDialog';
import { useLongPress } from '@/hooks/useLongPress';
interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string;
  onSwitchProject: (projectId: string) => void;
  onCreateProject: (name: string, targetAmount: number, color: ProjectColor, palierValue?: number) => Project;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
}
interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  projectsCount: number;
  onSelect: () => void;
  onViewProgress: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onLongPress: () => void;
}
const ProjectItem = ({
  project,
  isActive,
  projectsCount,
  onSelect,
  onViewProgress,
  onDelete,
  onLongPress
}: ProjectItemProps) => {
  const colorConfig = PROJECT_COLORS[project.color];
  const {
    isPressed,
    progress,
    handlers
  } = useLongPress({
    onLongPress,
    delay: 3000
  });
  return <button onClick={onSelect} {...handlers} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-left group relative overflow-hidden ${isActive ? 'bg-card border border-border/50' : 'hover:bg-card/50'}`}>
      {/* Long press progress indicator */}
      {isPressed && <div className="absolute inset-0 bg-white/5 transition-all duration-75" style={{
      width: `${progress}%`
    }} />}
      
      <div className="w-3 h-3 rounded-full flex-shrink-0 relative z-10" style={{
      backgroundColor: `hsl(${colorConfig.hsl})`
    }} />
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm font-light text-foreground truncate">
          {project.name}
        </p>
        <p className="text-xs text-muted-foreground font-extralight">
          €{project.targetAmount.toLocaleString('de-DE')}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
        <button onClick={onViewProgress} className="p-1.5 hover:bg-white/10 rounded transition-opacity" title="Voir la progression">
          <BarChart3 className="w-4 h-4 text-muted-foreground hover:text-foreground" strokeWidth={1.5} />
        </button>
        {isActive && <Check className="w-4 h-4 text-foreground" strokeWidth={1.5} />}
        {!isActive && projectsCount > 1 && <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded">
            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" strokeWidth={1.5} />
          </button>}
      </div>
      
      {/* Long press hint */}
      {isPressed && <div className="absolute bottom-1 left-0 right-0 text-center z-10">
          <span className="text-[9px] text-white/40 uppercase tracking-wider">
            Maintenir pour modifier...
          </span>
        </div>}
    </button>;
};
const ProjectSelector = ({
  projects,
  activeProjectId,
  onSwitchProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProject
}: ProjectSelectorProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
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
  const handleLongPress = (project: Project) => {
    setEditingProject(project);
  };
  return <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-foreground hover:bg-card/50">
            <FolderOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-background border-border/30 w-80">
          <SheetHeader className="text-left">
            <SheetTitle className="text-foreground font-light tracking-wide">
              Mon Portfolio
            </SheetTitle>
            <SheetDescription className="text-muted-foreground font-extralight">
              Sélectionnez un projet ou créez-en un nouveau
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 mb-2">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider text-center">
              Appui long pour modifier
            </p>
          </div>

          <div className="mt-2 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {projects.map(project => <ProjectItem key={project.id} project={project} isActive={project.id === activeProjectId} projectsCount={projects.length} onSelect={() => handleSelectProject(project.id)} onViewProgress={e => handleViewProgress(e, project.id)} onDelete={e => handleDeleteProject(e, project.id)} onLongPress={() => handleLongPress(project)} />)}
          </div>

          <div className="mt-6">
            <Button variant="outline" onClick={() => setIsCreateOpen(true)} className="w-full border-border/30 hover:bg-card font-extralight">
              <Plus className="mr-2 w-[18px] h-[18px]" strokeWidth={1.5} />
              Nouveau Projet
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <CreateProjectDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateProject} />

      {editingProject && <EditProjectDialog isOpen={!!editingProject} onClose={() => setEditingProject(null)} project={editingProject} onSave={onUpdateProject} />}
    </>;
};
export default ProjectSelector;