import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectDeposit, getDefaultProject, PROJECT_COLORS } from '@/types/project';

const PROJECTS_KEY = 'mydream_projects';
const DEPOSITS_KEY = 'mydream_all_deposits';
const ACTIVE_PROJECT_KEY = 'mydream_active_project';

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const useProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deposits, setDeposits] = useState<ProjectDeposit[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedProjects = loadFromStorage<Project[]>(PROJECTS_KEY, []);
    const storedDeposits = loadFromStorage<ProjectDeposit[]>(DEPOSITS_KEY, []);
    const storedActiveId = loadFromStorage<string>(ACTIVE_PROJECT_KEY, '');

    if (storedProjects.length === 0) {
      const defaultProject = getDefaultProject();
      setProjects([defaultProject]);
      setActiveProjectId(defaultProject.id);
      saveToStorage(PROJECTS_KEY, [defaultProject]);
      saveToStorage(ACTIVE_PROJECT_KEY, defaultProject.id);
    } else {
      setProjects(storedProjects);
      setDeposits(storedDeposits);
      setActiveProjectId(storedActiveId || storedProjects[0].id);
    }
    setIsLoaded(true);
  }, []);

  // Get active project
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Get deposits for active project
  const activeDeposits = deposits.filter(d => d.projectId === activeProjectId);

  // Calculate totals for active project
  const totalSaved = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
  const totalPaliers = activeProject ? Math.ceil(activeProject.targetAmount / activeProject.palierValue) : 0;
  const currentPaliers = activeProject ? Math.floor(totalSaved / activeProject.palierValue) : 0;
  const progress = totalPaliers > 0 ? Math.min((currentPaliers / totalPaliers) * 100, 100) : 0;

  // Get deposit days for calendar
  const depositDays = [...new Set(activeDeposits.map(d => d.date))];

  // Apply theme color
  useEffect(() => {
    if (activeProject) {
      const colorConfig = PROJECT_COLORS[activeProject.color];
      document.documentElement.style.setProperty('--accent-color', colorConfig.hsl);
    }
  }, [activeProject?.color]);

  // Switch active project
  const switchProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    saveToStorage(ACTIVE_PROJECT_KEY, projectId);
  }, []);

  // Create new project
  const createProject = useCallback((name: string, targetAmount: number, color: Project['color'], palierValue: number = 15): Project => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      targetAmount,
      palierValue,
      color,
      createdAt: Date.now(),
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveToStorage(PROJECTS_KEY, updatedProjects);
    return newProject;
  }, [projects]);

  // Update project
  const updateProject = useCallback((projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, ...updates } : p
    );
    setProjects(updatedProjects);
    saveToStorage(PROJECTS_KEY, updatedProjects);
  }, [projects]);

  // Delete project
  const deleteProject = useCallback((projectId: string) => {
    if (projects.length <= 1) return; // Keep at least one project
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    const updatedDeposits = deposits.filter(d => d.projectId !== projectId);
    
    setProjects(updatedProjects);
    setDeposits(updatedDeposits);
    saveToStorage(PROJECTS_KEY, updatedProjects);
    saveToStorage(DEPOSITS_KEY, updatedDeposits);

    if (activeProjectId === projectId) {
      const newActiveId = updatedProjects[0].id;
      setActiveProjectId(newActiveId);
      saveToStorage(ACTIVE_PROJECT_KEY, newActiveId);
    }
  }, [projects, deposits, activeProjectId]);

  // Add deposit to active project
  const addDeposit = useCallback((amount: number): ProjectDeposit | null => {
    if (!activeProjectId) return null;
    
    const newDeposit: ProjectDeposit = {
      id: Date.now().toString(),
      projectId: activeProjectId,
      amount,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
    };
    
    const updatedDeposits = [...deposits, newDeposit];
    setDeposits(updatedDeposits);
    saveToStorage(DEPOSITS_KEY, updatedDeposits);
    
    return newDeposit;
  }, [deposits, activeProjectId]);

  // Remove deposit
  const removeDeposit = useCallback((depositId: string) => {
    const updatedDeposits = deposits.filter(d => d.id !== depositId);
    setDeposits(updatedDeposits);
    saveToStorage(DEPOSITS_KEY, updatedDeposits);
  }, [deposits]);

  // Get recent deposits for active project
  const getRecentDeposits = useCallback((count: number = 10) => {
    return [...activeDeposits]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  }, [activeDeposits]);

  // Update project image
  const updateProjectImage = useCallback((imageUrl: string) => {
    if (activeProjectId) {
      updateProject(activeProjectId, { imageUrl });
    }
  }, [activeProjectId, updateProject]);

  return {
    // State
    isLoaded,
    projects,
    activeProject,
    activeProjectId,
    deposits: activeDeposits,
    
    // Computed
    totalSaved,
    totalPaliers,
    currentPaliers,
    progress,
    depositDays,
    
    // Project actions
    switchProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectImage,
    
    // Deposit actions
    addDeposit,
    removeDeposit,
    getRecentDeposits,
  };
};
