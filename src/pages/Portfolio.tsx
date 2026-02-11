import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Check, Pin, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Project, PROJECT_COLORS, ProjectColor } from '@/types/project';
import CreateProjectDialog from '@/components/CreateProjectDialog';
import EditProjectDialog from '@/components/EditProjectDialog';
import { useLongPress } from '@/hooks/useLongPress';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  projectsCount: number;
  onSelect: () => void;
  onDelete: () => void;
  onPin: () => void;
  onLongPress: () => void;
}

const ProjectItem = ({
  project,
  isActive,
  projectsCount,
  onSelect,
  onDelete,
  onPin,
  onLongPress
}: ProjectItemProps) => {
  const colorConfig = PROJECT_COLORS[project.color];
  const [isRevealed, setIsRevealed] = useState(false);
  const dragRef = useRef(0);
  const { isPressed, progress, handlers } = useLongPress({
    onLongPress,
    delay: 3000
  });

  const handleDragEnd = (e: any) => {
    const velocity = e.velocity?.x || 0;
    const offset = e.offset?.x || 0;

    if (offset < -60 || velocity < -500) {
      setIsRevealed(true);
    } else {
      setIsRevealed(false);
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
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className="relative"
      >
        {/* Background actions panel */}
        <div className="absolute inset-0 flex items-center justify-end gap-2 pr-4 bg-gradient-to-l from-red-600/20 via-red-500/10 to-transparent pointer-events-none rounded-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isRevealed ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 pointer-events-auto"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPin();
                setIsRevealed(false);
              }}
              className="flex items-center justify-center w-10 h-10 border border-white/30 hover:border-white/50 text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <Pin className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setIsRevealed(false);
              }}
              className="flex items-center justify-center w-10 h-10 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>

        {/* Main card */}
        <motion.button
          onClick={onSelect}
          {...handlers}
          className="w-full flex items-center gap-3 p-4 rounded-lg transition-all duration-300 text-left relative bg-black/40 border border-white/10 hover:border-white/20 cursor-grab active:cursor-grabbing"
          whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleSelectProject = (projectId: string) => {
    onSwitchProject(projectId);
    navigate('/');
  };

  const handleCreateProject = (name: string, targetAmount: number, color: ProjectColor, palierValue: number) => {
    const newProject = onCreateProject(name, targetAmount, color, palierValue);
    onSwitchProject(newProject.id);
    navigate('/');
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length > 1) {
      onDeleteProject(projectId);
    }
  };

  const handleLongPress = (project: Project) => {
    setEditingProject(project);
  };

  const handlePin = (projectId: string) => {
    console.log('Pin project:', projectId);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-center border-b border-white/10 bg-black/95 backdrop-blur-md">
        <button
          onClick={() => navigate('/')}
          className="absolute left-4 sm:left-6 w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-white/10"
          aria-label="Retour"
        >
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>

        <h1 className="text-center uppercase tracking-[0.25em] sm:tracking-[0.35em] font-light text-base sm:text-lg">
          Mon Portfolio
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 pt-20 pb-8 px-4 sm:px-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          {/* Instructions */}
          <div className="mb-6 text-center">
            <p className="text-xs text-white/60 uppercase tracking-wider font-extralight">
              Glissez à droite pour révéler les actions
            </p>
          </div>

          {/* Project List */}
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-center text-white/40 font-extralight py-8">
                Aucun projet pour le moment
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {projects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                    projectsCount={projects.length}
                    onSelect={() => handleSelectProject(project.id)}
                    onDelete={() => handleDeleteProject(project.id)}
                    onPin={() => handlePin(project.id)}
                    onLongPress={() => handleLongPress(project)}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Create New Project Button */}
          <div className="mt-8">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full border border-white/30 hover:border-white/50 bg-transparent hover:bg-white/10 text-white font-extralight tracking-wide"
            >
              <Plus className="mr-2 w-[18px] h-[18px]" strokeWidth={1.5} />
              Nouveau Projet
            </Button>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default Portfolio;
