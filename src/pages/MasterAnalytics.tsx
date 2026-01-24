import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Wallet } from 'lucide-react';
import { useProjectManager } from '@/hooks/useProjectManager';
import MasterProgressChart from '@/components/MasterProgressChart';

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
      <div className="px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm font-light tracking-wide">Back</span>
        </button>

        {/* Title */}
        <h1 className="text-center text-xl font-light tracking-[0.3em] text-white mb-12">
          MASTER PROGRESS ANALYTICS
        </h1>

        {/* Portfolio Summary */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-2">
              Total Portfolio Value
            </p>
            <p className="text-4xl font-extralight tracking-wide">
              €{totalPortfolioValue.toLocaleString('de-DE')}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="border border-white/10 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-3">
                <Target size={20} strokeWidth={1} className="text-white/60" />
              </div>
              <p className="text-2xl font-extralight mb-1">
                {overallProgress.toFixed(1)}%
              </p>
              <p className="text-white/50 text-xs font-light tracking-wide uppercase">
                Overall Progress
              </p>
            </div>

            <div className="border border-white/10 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-3">
                <TrendingUp size={20} strokeWidth={1} className="text-white/60" />
              </div>
              <p className="text-2xl font-extralight mb-1">
                {totalMilestones}
              </p>
              <p className="text-white/50 text-xs font-light tracking-wide uppercase">
                Total Milestones
              </p>
            </div>

            <div className="border border-white/10 rounded-lg p-6 text-center">
              <div className="flex justify-center mb-3">
                <Wallet size={20} strokeWidth={1} className="text-white/60" />
              </div>
              <p className="text-2xl font-extralight mb-1">
                {projects.length}
              </p>
              <p className="text-white/50 text-xs font-light tracking-wide uppercase">
                Active Projects
              </p>
            </div>
          </div>
        </div>

        {/* Master Chart */}
        <div className="max-w-5xl mx-auto">
          <div className="border border-white/10 rounded-lg p-6">
            <h2 className="text-sm font-light tracking-[0.2em] text-white/70 uppercase mb-6 text-center">
              Growth Chart — All Projects
            </h2>
            <MasterProgressChart projects={projects} allDeposits={allDeposits} />
          </div>
        </div>

        {/* Project Legend */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="border border-white/10 rounded-lg p-6">
            <h3 className="text-xs font-light tracking-[0.2em] text-white/50 uppercase mb-4 text-center">
              Project Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects.map(project => {
                const projectDeposits = allDeposits.filter(d => d.projectId === project.id);
                const projectTotal = projectDeposits.reduce((s, d) => s + d.amount, 0);
                const projectProgress = (projectTotal / project.targetAmount) * 100;
                
                return (
                  <div key={project.id} className="flex items-center gap-3 p-3 border border-white/5 rounded">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ 
                        backgroundColor: project.color === 'white' ? '#FFFFFF' :
                          project.color === 'red' ? '#EF4444' :
                          project.color === 'blue' ? '#3B82F6' :
                          project.color === 'yellow' ? '#EAB308' :
                          project.color === 'green' ? '#22C55E' :
                          project.color === 'purple' ? '#A855F7' : '#FFFFFF'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-white truncate">{project.name}</p>
                      <p className="text-xs text-white/40">
                        €{projectTotal.toLocaleString('de-DE')} / €{project.targetAmount.toLocaleString('de-DE')}
                      </p>
                    </div>
                    <p className="text-sm font-light text-white/60">
                      {projectProgress.toFixed(0)}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAnalytics;
