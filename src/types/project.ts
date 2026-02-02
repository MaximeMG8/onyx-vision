export type ProjectColor = 'white' | 'red' | 'blue' | 'yellow' | 'green' | 'purple';

export interface ProjectImage {
  id: string;
  url: string;
  order: number;
  isFavorite: boolean;
  uploadedAt: number;
}

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  palierValue: number;
  color: ProjectColor;
  imageUrl?: string; // Legacy - kept for backwards compatibility
  images?: ProjectImage[]; // New gallery system
  deadline?: string; // ISO date string
  createdAt: number;
}

export interface ProjectDeposit {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  timestamp: number;
}

export const PROJECT_COLORS: Record<ProjectColor, { label: string; hsl: string }> = {
  white: { label: 'White', hsl: '0 0% 100%' },
  red: { label: 'Red', hsl: '0 72% 51%' },
  blue: { label: 'Blue', hsl: '217 91% 60%' },
  yellow: { label: 'Yellow', hsl: '48 96% 53%' },
  green: { label: 'Emerald', hsl: '160 84% 39%' },
  purple: { label: 'Purple', hsl: '271 81% 56%' },
};

export const getDefaultProject = (): Project => ({
  id: 'default',
  name: 'Rolex',
  targetAmount: 10000,
  palierValue: 15,
  color: 'white',
  images: [],
  createdAt: Date.now(),
});

// Helper to get the favorite/main image from a project
export const getFavoriteImage = (project: Project): string | undefined => {
  if (project.images && project.images.length > 0) {
    const favorite = project.images.find(img => img.isFavorite);
    return favorite ? favorite.url : project.images[0].url;
  }
  return project.imageUrl;
};

// Helper to get sorted images
export const getSortedImages = (project: Project): ProjectImage[] => {
  if (!project.images) return [];
  return [...project.images].sort((a, b) => a.order - b.order);
};
