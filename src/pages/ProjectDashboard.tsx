import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, Wallet, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project, ProjectDeposit } from '@/types/project';
import HeroProgressChart from '@/components/HeroProgressChart';
import HorizontalKPIBar from '@/components/HorizontalKPIBar';
import FocusTimer from '@/components/FocusTimer';
import { differenceInDays } from 'date-fns';

const PROJECTS_KEY = 'mydream_projects';
const DEPOSITS_KEY = 'mydream_all_deposits';

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const ProjectDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [deposits, setDeposits] = useState<ProjectDeposit[]>([]);

  useEffect(() => {
    const projects = loadFromStorage<Project[]>(PROJECTS_KEY, []);
    const allDeposits = loadFromStorage<ProjectDeposit[]>(DEPOSITS_KEY, []);
    
    const foundProject = projects.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
      setDeposits(allDeposits.filter(d => d.projectId === projectId));
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  const totalSaved = deposits.reduce((sum, d) => sum + d.amount, 0);
  const percentageToGoal = Math.min((totalSaved / project.targetAmount) * 100, 100);
  const remainingBalance = Math.max(project.targetAmount - totalSaved, 0);
  const totalMilestones = Math.floor(totalSaved / project.palierValue);

  // Calculate days remaining if deadline is set
  const daysRemaining = project.deadline 
    ? differenceInDays(new Date(project.deadline), new Date())
    : null;

  // Get accent color for the project
  const getAccentColorHex = () => {
    switch (project.color) {
      case 'green': return '#10B981';
      case 'red': return '#EF4444';
      case 'blue': return '#3B82F6';
      case 'yellow': return '#EAB308';
      case 'purple': return '#A855F7';
      default: return '#FFFFFF';
    }
  };

  const accentColor = getAccentColorHex();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-white/80 hover:text-white hover:bg-transparent p-0"
        >
          <ArrowLeft className="w-5 h-5 mr-2" strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-[0.2em] font-extralight">Back</span>
        </Button>
        
        <h1 className="text-sm uppercase tracking-[0.3em] font-extralight">
          {project.name}
        </h1>
        
        <div className="w-20" />
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto space-y-8">
        {/* Deadline Countdown - Only show if deadline is set */}
        {daysRemaining !== null && (
          <section className="border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-white/60" strokeWidth={1.5} />
              <div className="text-center">
                <p className={`text-3xl font-thin ${daysRemaining < 30 ? 'text-red-400' : 'text-white'}`}>
                  {daysRemaining > 0 ? daysRemaining : 0}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight">
                  {daysRemaining === 1 ? 'Day Remaining' : 'Days Remaining'}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Hero KPI - Large Number Display */}
        <section className="text-center py-6">
          <p className="text-6xl font-thin tracking-tight" style={{ color: accentColor }}>
            {percentageToGoal.toFixed(1)}%
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-extralight mt-2">
            Overall Progress
          </p>
        </section>

        {/* Horizontal KPI Bars */}
        <section className="space-y-6">
          <HorizontalKPIBar
            label="Milestones Achieved"
            value={totalMilestones}
            maxValue={Math.ceil(project.targetAmount / project.palierValue)}
            displayValue={`${totalMilestones} / ${Math.ceil(project.targetAmount / project.palierValue)}`}
            accentColor={accentColor}
          />
          <HorizontalKPIBar
            label="Total Saved"
            value={totalSaved}
            maxValue={project.targetAmount}
            displayValue={`€${totalSaved.toLocaleString('de-DE')}`}
            accentColor={accentColor}
          />
          <HorizontalKPIBar
            label="Remaining Balance"
            value={project.targetAmount - remainingBalance}
            maxValue={project.targetAmount}
            displayValue={`€${remainingBalance.toLocaleString('de-DE')}`}
          />
        </section>

        {/* Wide Analytics Chart */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4 font-extralight text-center">
            Growth Timeline
          </h2>
          
          <div className="border border-white/5 rounded-lg p-4 bg-white/[0.01]">
            <HeroProgressChart 
              deposits={deposits} 
              targetAmount={project.targetAmount}
              projectColor={project.color}
            />
          </div>
        </section>

        {/* Focus Timer */}
        <section>
          <div className="border border-white/5 rounded-lg p-6 bg-white/[0.01]">
            <FocusTimer />
          </div>
        </section>

        {/* Summary Stats */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4 font-extralight text-center">
            Summary
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-sm font-extralight text-white/50">Target Amount</span>
              <span className="text-sm font-light text-white">€{project.targetAmount.toLocaleString('de-DE')}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-sm font-extralight text-white/50">Milestone Value</span>
              <span className="text-sm font-light text-white">€{project.palierValue.toLocaleString('de-DE')}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-sm font-extralight text-white/50">Total Deposits</span>
              <span className="text-sm font-light text-white">{deposits.length}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectDashboard;
