import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Target, Wallet } from 'lucide-react';
import { useProjectManager } from '@/hooks/useProjectManager';
import MasterProgressChart from '@/components/MasterProgressChart';
const MasterAnalytics = () => {
  const navigate = useNavigate();
  const {
    projects,
    isLoaded,
    getAllDeposits
  } = useProjectManager();
  const allDeposits = getAllDeposits();

  // Calculate total portfolio value
  const totalPortfolioValue = allDeposits.reduce((sum, d) => sum + d.amount, 0);

  // Calculate total target across all projects
  const totalTarget = projects.reduce((sum, p) => sum + p.targetAmount, 0);

  // Calculate overall progress
  const overallProgress = totalTarget > 0 ? Math.min(totalPortfolioValue / totalTarget * 100, 100) : 0;

  // Calculate total milestones
  const totalMilestones = projects.reduce((sum, project) => {
    const projectDeposits = allDeposits.filter(d => d.projectId === project.id);
    const projectTotal = projectDeposits.reduce((s, d) => s + d.amount, 0);
    return sum + Math.floor(projectTotal / project.palierValue);
  }, 0);
  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60 text-sm font-light tracking-widest">CHARGEMENT...</p>
      </div>;
  }
  return <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Header */}
      <div className="px-6 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8">
          <ArrowLeft size={18} strokeWidth={1.5} />
          <span className="text-sm font-light tracking-wide">Retour</span>
        </button>

        {/* Title */}
        <h1 className="text-center font-light tracking-[0.3em] text-white mb-12 text-base">
          ANALYTIQUES GLOBALES
        </h1>

        {/* Portfolio Summary */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <p className="text-white/50 text-xs font-light tracking-[0.2em] uppercase mb-2">
              Valeur Totale du Portfolio
            </p>
            <p className="text-4xl font-extralight tracking-wide">
              {totalPortfolioValue.toLocaleString('fr-FR')}€
            </p>
          </div>

        {/* Key Metrics - Compact */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-white/10 p-4 text-center rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target size={14} strokeWidth={1} className="text-white/40" />
                <p className="text-white/40 text-[10px] font-light tracking-widest uppercase">
                  Global
                </p>
              </div>
              <p className="text-2xl font-thin">
                {overallProgress.toFixed(1)}%
              </p>
            </div>

            <div className="border border-white/10 p-4 text-center rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp size={14} strokeWidth={1} className="text-white/40" />
                <p className="text-white/40 text-[10px] font-light tracking-widest uppercase">
                  Paliers
                </p>
              </div>
              <p className="text-2xl font-thin">
                {totalMilestones}
              </p>
            </div>

            <div className="border border-white/10 p-4 text-center rounded">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Wallet size={14} strokeWidth={1} className="text-white/40" />
                <p className="text-white/40 text-[10px] font-light tracking-widest uppercase">
                  Actifs
                </p>
              </div>
              <p className="text-2xl font-thin">
                {projects.length}
              </p>
            </div>
          </div>
        </div>

        {/* Master Chart - Full Width Sharp Rectangle */}
        <div className="w-full px-0">
          <div className="border border-white/10 bg-black">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-[11px] font-light tracking-[0.25em] text-white/50 uppercase">
                Courbe de Croissance
              </h2>
            </div>
            <div className="p-4">
              <MasterProgressChart projects={projects} allDeposits={allDeposits} />
            </div>
          </div>
        </div>

        {/* Project Breakdown - Minimal */}
        <div className="w-full px-6 mt-6">
          <div className="border border-white/10 rounded">
            <div className="px-6 py-3 border-b border-white/5">
              <h3 className="text-[10px] font-light tracking-[0.25em] text-white/40 uppercase">
                Répartition du Portfolio
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-white/5">
              {projects.map(project => {
              const projectDeposits = allDeposits.filter(d => d.projectId === project.id);
              const projectTotal = projectDeposits.reduce((s, d) => s + d.amount, 0);
              const projectProgress = projectTotal / project.targetAmount * 100;
              const color = project.color === 'white' ? '#FFFFFF' : project.color === 'red' ? '#EF4444' : project.color === 'blue' ? '#3B82F6' : project.color === 'yellow' ? '#EAB308' : project.color === 'green' ? '#10B981' : project.color === 'purple' ? '#A855F7' : '#FFFFFF';
              return <div key={project.id} className="p-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}`
                }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-light text-white/80 truncate">{project.name}</p>
                      <p className="text-[10px] text-white/30 font-light">
                        {projectTotal.toLocaleString('fr-FR')}€
                      </p>
                    </div>
                    <p className="text-sm font-thin text-white/50">
                      {projectProgress.toFixed(0)}%
                    </p>
                  </div>;
            })}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default MasterAnalytics;