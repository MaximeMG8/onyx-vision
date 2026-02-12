import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Pin, Trash2, User, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Project, PROJECT_COLORS, ProjectColor } from '@/types/project';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { useLongPress } from '@/hooks/useLongPress';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  isSwipeOpen: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
  onLongPress: () => void;
  onSwipeChange: (isOpen: boolean) => void;
  closeOthers: () => void;
}

const ProjectItem = ({
  project,
  isActive,
  isSwipeOpen,
  onSelect,
  onDelete,
  onPin,
  onLongPress,
  onSwipeChange,
  closeOthers
}: ProjectItemProps) => {
  const colorConfig = PROJECT_COLORS[project.color];
  const { isPressed, progress, handlers } = useLongPress({
    onLongPress,
    delay: 3000
  });

  const handleDragEnd = (e: any) => {
    const offset = e.offset?.x || 0;
    const velocity = e.velocity?.x || 0;

    if (offset > 60 || velocity > 500) {
      closeOthers();
      onSwipeChange(true);
    } else {
      onSwipeChange(false);
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        drag="x"
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={{ x: isSwipeOpen ? 80 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative"
      >
        {/* Background actions panel */}
        <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4 bg-black pointer-events-none rounded-lg">
          <AnimatePresence>
            {isSwipeOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 pointer-events-auto"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin();
                  }}
                  className="flex items-center justify-center w-9 h-9 border border-white/30 hover:border-white/50 text-white/70 hover:text-white hover:bg-white/5 rounded transition-all"
                >
                  <Pin className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center justify-center w-9 h-9 border border-white/30 hover:border-white/50 text-white/70 hover:text-white hover:bg-white/5 rounded transition-all"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main card */}
        <motion.button
          onClick={onSelect}
          {...handlers}
          className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 text-left relative bg-black border border-white/10 hover:border-white/20 cursor-grab active:cursor-grabbing"
          whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
        >
          {/* Long press progress indicator */}
          {isPressed && (
            <div
              className="absolute inset-0 bg-white/5 transition-all duration-75 rounded-lg"
              style={{ width: `${progress}%` }}
            />
          )}

          <div
            className="w-3 h-3 rounded-full flex-shrink-0 relative z-10"
            style={{ backgroundColor: `hsl(${colorConfig.hsl})` }}
          />
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-sm font-light text-white truncate">
              {project.name}
            </p>
            <p className="text-xs text-white/60 font-extralight">
              €{project.targetAmount.toLocaleString('fr-FR')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
            {isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              >
                <Check className="w-4 h-4 text-white" strokeWidth={2} />
              </motion.div>
            )}
          </div>

          {/* Long press hint */}
          {isPressed && (
            <div className="absolute bottom-1 left-0 right-0 text-center z-10">
              <span className="text-[9px] text-white/40 uppercase tracking-wider">
                Maintenir pour modifier...
              </span>
            </div>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

interface PortfolioProps {
  projects: Project[];
  activeProjectId: string;
  onSwitchProject: (projectId: string) => void;
  onCreateProject: (name: string, targetAmount: number, color: ProjectColor, palierValue?: number) => Project;
  onDeleteProject: (projectId: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
}

const Portfolio = ({
  projects,
  activeProjectId,
  onSwitchProject,
  onCreateProject,
  onDeleteProject,
  onUpdateProject
}: PortfolioProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const handleSelectProject = (projectId: string) => {
    onSwitchProject(projectId);
    setIsOpen(false);
  };

  const handleCreateProject = (name: string, targetAmount: number, color: ProjectColor, palierValue: number) => {
    const newProject = onCreateProject(name, targetAmount, color, palierValue);
    onSwitchProject(newProject.id);
    setIsCreateOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length > 1) {
      onDeleteProject(projectId);
      setOpenSwipeId(null);
    }
  };

  const handleLongPress = (project: Project) => {
    setEditingProject(project);
  };

  const handlePin = (projectId: string) => {
    console.log('Pin project:', projectId);
  };

  const closeAllSwipes = useCallback(() => {
    setOpenSwipeId(null);
  }, []);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button
            onClick={() => navigate('/portfolio')}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-card/50"
            aria-label="Portfolio"
          >
            <svg className="w-[18px] h-[18px] text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2m0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
            </svg>
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-black border-white/10 w-80 p-0 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
              aria-label="Profile"
            >
              <User className="w-4 h-4 text-white/70" strokeWidth={1.5} />
            </button>

            <h2 className="text-center uppercase tracking-[0.2em] font-light text-white text-sm flex-1">
              Mes Projets
            </h2>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/master-analytics');
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
              aria-label="Analytics"
            >
              <BarChart2 className="w-4 h-4 text-white/70" strokeWidth={1.5} />
            </button>
          </div>

          {/* Instructions */}
          <div className="px-6 py-3 border-b border-white/10">
            <p className="text-[10px] text-white/50 uppercase tracking-wider text-center font-extralight">
              Glissez à droite pour révéler les actions
            </p>
          </div>

          {/* Project List */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-center text-white/40 font-extralight py-8 text-xs">
                  Aucun projet pour le moment
                </p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {projects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      isActive={project.id === activeProjectId}
                      isSwipeOpen={openSwipeId === project.id}
                      onSelect={() => handleSelectProject(project.id)}
                      onDelete={() => handleDeleteProject(project.id)}
                      onPin={() => handlePin(project.id)}
                      onLongPress={() => handleLongPress(project)}
                      onSwipeChange={(isOpen) => setOpenSwipeId(isOpen ? project.id : null)}
                      closeOthers={closeAllSwipes}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* Create New Project Button */}
          <div className="px-4 py-4 border-t border-white/10">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full border border-white/30 hover:border-white/50 bg-transparent hover:bg-white/10 text-white font-extralight tracking-wide text-xs"
            >
              <Plus className="mr-2 w-4 h-4" strokeWidth={1.5} />
              Nouveau Projet
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialogs */}
      <CreateProjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProject}
      />

      {editingProject && (
        <EditProjectDialog
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSave={onUpdateProject}
        />
      )}
    </>
  );
};

export default Portfolio;
