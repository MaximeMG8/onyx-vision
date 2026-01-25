export type ProjectColor = 'white' | 'red' | 'blue' | 'yellow' | 'green' | 'purple';

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  palierValue: number;
  color: ProjectColor;
  imageUrl?: string;
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
  createdAt: Date.now(),
});
