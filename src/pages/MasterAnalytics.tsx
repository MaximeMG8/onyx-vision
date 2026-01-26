import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, TrendingUp, Wallet } from 'lucide-react';
import { useProjectManager } from '@/hooks/useProjectManager';
import MasterProgressChart from '@/components/MasterProgressChart';
import HorizontalKPIBar from '@/components/HorizontalKPIBar';

const MasterAnalytics = () => {
  const navigate = useNavigate();
  const { projects, isLoaded, getAllDeposits } = useProjectManager();

  const allDeposits = getAllDeposits();
  
  // Calculate total portfolio value
  const totalPortfolioValue = allDeposits.reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate total target across all projects
  const totalTarget = projects.reduce((sum, p) => sum + p.targetAmount, 0);
  
  // Calculate overall progress
  const overallProgress = totalTarget > 0 ? Math.min((totalPortfolioValue / totalTarget) * 100, 100) : 0;

  // Calculate total milestones
  const totalMilestones = projects.reduce((sum, project) => {
    const projectDeposits = allDeposits.filter(d => d.projectId === project.id);
    const projectTotal = projectDeposits.reduce((s, d) => s + d.amount, 0);
    return sum + Math.floor(projectTotal / project.palierValue);
  }, 0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60 text-sm font-light tracking-widest">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="px-6 py-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm font-light tracking-wide">Back</span>
        </button>

        {/* Title */}
        <h1 className="text-center text-lg font-extralight tracking-[0.3em] text-white mb-8">
          MASTER ANALYTICS
        </h1>

        {/* Hero KPI - Portfolio Value */}
        <div className="text-center mb-8">
          <p className="text-5xl font-thin tracking-wide">
            €{totalPortfolioValue.toLocaleString('de-DE')}
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-extralight mt-2">
            Total Portfolio Value
          </p>
        </div>

        {/* Horizontal KPI Bars */}
        <div className="max-w-2xl mx-auto space-y-5 mb-10">
          <HorizontalKPIBar
            label="Overall Progress"
            value={overallProgress}
            maxValue={100}
            displayValue={`${overallProgress.toFixed(1)}%`}
            accentColor="#FFFFFF"
          />
          <HorizontalKPIBar
            label="Total Milestones"
            value={totalMilestones}
            maxValue={totalMilestones + 10}
            displayValue={`${totalMilestones}`}
            accentColor="#FFFFFF"
          />
          <HorizontalKPIBar
            label="Active Projects"
            value={projects.length}
            maxValue={projects.length + 2}
            displayValue={`${projects.length}`}
          />
        </div>

        {/* Master Chart - Full Width */}
        <div className="w-full mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight mb-4 text-center">
            All Projects — Growth Timeline
          </p>
          <div className="border border-white/5 rounded-lg p-4 bg-white/[0.01]">
            <MasterProgressChart projects={projects} allDeposits={allDeposits} />
          </div>
        </div>

        {/* Project Legend / Breakdown */}
        <div className="max-w-3xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-extralight mb-4 text-center">
            Project Breakdown
          </p>
          <div className="space-y-3">
            {projects.map(project => {
              const projectDeposits = allDeposits.filter(d => d.projectId === project.id);
              const projectTotal = projectDeposits.reduce((s, d) => s + d.amount, 0);
              const projectProgress = (projectTotal / project.targetAmount) * 100;
              
              const getColorHex = () => {
                switch (project.color) {
                  case 'green': return '#10B981';
                  case 'red': return '#EF4444';
                  case 'blue': return '#3B82F6';
                  case 'yellow': return '#EAB308';
                  case 'purple': return '#A855F7';
                  default: return '#FFFFFF';
                }
              };
              
              return (
                <div 
                  key={project.id} 
                  className="flex items-center gap-4 p-4 border border-white/5 rounded-lg bg-white/[0.01]"
                >
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: getColorHex(),
                      boxShadow: `0 0 8px ${getColorHex()}40`
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-sm font-light text-white truncate">{project.name}</p>
                      <p className="text-sm font-thin text-white/60 ml-2">
                        {projectProgress.toFixed(0)}%
                      </p>
                    </div>
                    <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(projectProgress, 100)}%`,
                          backgroundColor: getColorHex(),
                          boxShadow: `0 0 6px ${getColorHex()}40`
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-white/30 font-extralight mt-1">
                      €{projectTotal.toLocaleString('de-DE')} / €{project.targetAmount.toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAnalytics;
