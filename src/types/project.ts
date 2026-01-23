export type ProjectColor = 'white' | 'red' | 'blue' | 'yellow' | 'green' | 'purple';

export interface Project {
  id: string;
  name: string;
  targetAmount: number;
  palierValue: number;
  color: ProjectColor;
  imageUrl?: string;
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
  white: { label: 'Blanc', hsl: '0 0% 100%' },
  red: { label: 'Rouge', hsl: '0 72% 51%' },
  blue: { label: 'Bleu', hsl: '217 91% 60%' },
  yellow: { label: 'Jaune', hsl: '48 96% 53%' },
  green: { label: 'Vert', hsl: '142 71% 45%' },
  purple: { label: 'Violet', hsl: '271 81% 56%' },
};

export const getDefaultProject = (): Project => ({
  id: 'default',
  name: 'Rolex',
  targetAmount: 10000,
  palierValue: 15,
  color: 'white',
  createdAt: Date.now(),
});
