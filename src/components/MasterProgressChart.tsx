import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Project, ProjectDeposit, PROJECT_COLORS } from '@/types/project';

interface MasterProgressChartProps {
  projects: Project[];
  allDeposits: ProjectDeposit[];
}

const MasterProgressChart = ({ projects, allDeposits }: MasterProgressChartProps) => {
  const chartData = useMemo(() => {
    if (allDeposits.length === 0) return [];

    // Get all unique dates across all deposits
    const allDates = [...new Set(allDeposits.map(d => d.date))].sort();
    
    // Calculate cumulative totals for each project at each date
    const dataByDate: Record<string, Record<string, number>> = {};
    
    // Initialize cumulative trackers for each project
    const cumulatives: Record<string, number> = {};
    projects.forEach(p => {
      cumulatives[p.id] = 0;
    });

    // Sort all deposits by date
    const sortedDeposits = [...allDeposits].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Process deposits and track cumulative values
    sortedDeposits.forEach(deposit => {
      cumulatives[deposit.projectId] = (cumulatives[deposit.projectId] || 0) + deposit.amount;
      
      if (!dataByDate[deposit.date]) {
        dataByDate[deposit.date] = { ...cumulatives };
      } else {
        dataByDate[deposit.date] = { ...cumulatives };
      }
    });

    // Fill in missing dates with last known values
    let lastValues = { ...cumulatives };
    Object.keys(cumulatives).forEach(key => {
      lastValues[key] = 0;
    });

    const filledData: Record<string, Record<string, number>> = {};
    allDates.forEach(date => {
      if (dataByDate[date]) {
        lastValues = { ...dataByDate[date] };
      }
      filledData[date] = { ...lastValues };
    });

    // Convert to chart format
    return Object.entries(filledData)
      .slice(-30) // Last 30 data points
      .map(([date, values]) => {
        const total = Object.values(values).reduce((sum, val) => sum + val, 0);
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          fullDate: date,
          ...values,
          total,
        };
      });
  }, [projects, allDeposits]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-sm shadow-2xl">
          <p className="text-white/60 text-xs font-light tracking-widest mb-2 uppercase">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 py-0.5">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-white/50 text-xs font-light">{entry.name}:</span>
              <span className="text-white text-xs font-medium tracking-wide">
                €{entry.value?.toLocaleString('de-DE') || 0}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex items-center justify-end gap-6 pr-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ 
                backgroundColor: entry.color,
                boxShadow: entry.value === 'Global Wealth' ? '0 0 6px rgba(255,255,255,0.5)' : 'none'
              }}
            />
            <span className="text-white/50 text-[10px] font-light tracking-wider uppercase">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const getLineColor = (project: Project): string => {
    if (project.color === 'white') return '#FFFFFF';
    if (project.color === 'red') return '#EF4444';
    if (project.color === 'blue') return '#3B82F6';
    if (project.color === 'yellow') return '#EAB308';
    if (project.color === 'green') return '#10B981'; // Emerald green
    if (project.color === 'purple') return '#A855F7';
    return '#FFFFFF';
  };

  const getGradientId = (project: Project): string => {
    return `gradient-${project.id}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-white/40 text-sm font-light tracking-wide">NO DATA AVAILABLE</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {/* Gradient for each project */}
            {projects.map((project) => {
              const color = getLineColor(project);
              return (
                <linearGradient key={getGradientId(project)} id={getGradientId(project)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="50%" stopColor={color} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
            {/* Gradient for total */}
            <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.35} />
              <stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 300 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 300 }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            dx={-10}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ 
              stroke: 'rgba(255,255,255,0.15)', 
              strokeWidth: 1,
              strokeDasharray: '4 4'
            }}
          />
          
          <Legend 
            content={<CustomLegend />}
            verticalAlign="top"
            align="right"
            wrapperStyle={{ 
              paddingBottom: '15px',
            }}
          />
          
          {/* Individual project areas */}
          {projects.map((project) => (
            <Area
              key={project.id}
              type="monotone"
              dataKey={project.id}
              name={project.name}
              stroke={getLineColor(project)}
              strokeWidth={1.5}
              fill={`url(#${getGradientId(project)})`}
              dot={false}
              activeDot={{ 
                r: 4, 
                strokeWidth: 0, 
                fill: getLineColor(project),
                style: { filter: `drop-shadow(0 0 4px ${getLineColor(project)})` }
              }}
            />
          ))}
          
          {/* Total portfolio area - dashed */}
          <Area
            type="monotone"
            dataKey="total"
            name="Global Wealth"
            stroke="#FFFFFF"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#gradient-total)"
            dot={false}
            activeDot={{ 
              r: 5, 
              strokeWidth: 0, 
              fill: '#FFFFFF',
              style: { filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))' }
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasterProgressChart;
