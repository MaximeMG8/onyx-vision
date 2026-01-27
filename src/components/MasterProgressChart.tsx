import { useMemo, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Project, ProjectDeposit } from '@/types/project';

interface MasterProgressChartProps {
  projects: Project[];
  allDeposits: ProjectDeposit[];
}

const MasterProgressChart = ({ projects, allDeposits }: MasterProgressChartProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { chartData, maxValue } = useMemo(() => {
    if (allDeposits.length === 0) return { chartData: [], maxValue: 0 };

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
    const data = Object.entries(filledData)
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

    // Calculate max value for Y-axis
    const max = Math.max(...data.map(d => d.total), 0);
    
    return { chartData: data, maxValue: max };
  }, [projects, allDeposits]);

  // Generate Y-axis ticks
  const yAxisTicks = useMemo(() => {
    if (maxValue === 0) return [0];
    const step = Math.ceil(maxValue / 4 / 1000) * 1000;
    const ticks = [];
    for (let i = 0; i <= maxValue + step; i += step) {
      ticks.push(i);
    }
    return ticks.slice(0, 5);
  }, [maxValue]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-white/10 px-4 py-3 shadow-2xl">
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
      <div className="flex items-center gap-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1.5">
            <div 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ 
                backgroundColor: entry.color,
                boxShadow: `0 0 4px ${entry.color}`
              }}
            />
            <span className="text-white/40 text-[9px] font-light tracking-wider uppercase">
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
    if (project.color === 'green') return '#10B981';
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

  // Calculate dynamic chart width based on data points (min 600px)
  const chartWidth = Math.max(600, chartData.length * 40);

  return (
    <div className="h-72 w-full relative">
      {/* Legend at top right */}
      <div className="absolute top-0 right-0 z-10">
        <CustomLegend 
          payload={[
            ...projects.map(p => ({ value: p.name, color: getLineColor(p) })),
            { value: 'Global Wealth', color: '#FFFFFF' }
          ]} 
        />
      </div>

      <div className="flex h-full pt-6">
        {/* Sticky Y-Axis - Fixed on the left */}
        <div className="flex-shrink-0 w-14 h-full flex flex-col justify-between py-2 pr-2">
          {[...yAxisTicks].reverse().map((tick, index) => (
            <div key={index} className="text-right">
              <span className="text-white/25 text-[9px] font-light">
                €{tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable Chart Container */}
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <AreaChart 
              data={chartData} 
              width={chartWidth}
              height={240}
              margin={{ top: 5, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                {/* Gradient for each project with neon glow effect */}
                {projects.map((project) => {
                  const color = getLineColor(project);
                  return (
                    <linearGradient key={getGradientId(project)} id={getGradientId(project)} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="60%" stopColor={color} stopOpacity={0.05} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
                {/* Gradient for total - subtle white glow */}
                <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.15} />
                  <stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
                {/* Glow filters for neon effect */}
                <filter id="glow-white" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Minimal X-axis - just small labels */}
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9, fontWeight: 300 }}
                dy={5}
                interval={0}
              />
              
              {/* Y-axis completely hidden (we have our own sticky one) */}
              <YAxis hide domain={[0, Math.max(...yAxisTicks)]} />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ 
                  stroke: 'rgba(255,255,255,0.08)', 
                  strokeWidth: 1,
                }}
              />
              
              {/* Individual project areas with neon glow */}
              {projects.map((project) => {
                const color = getLineColor(project);
                const isGreen = project.color === 'green';
                return (
                  <Area
                    key={project.id}
                    type="monotone"
                    dataKey={project.id}
                    name={project.name}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#${getGradientId(project)})`}
                    dot={false}
                    activeDot={false}
                    style={{ 
                      filter: isGreen ? 'url(#glow-green)' : 'url(#glow-white)'
                    }}
                  />
                );
              })}
              
              {/* Total portfolio area - dashed with glow */}
              <Area
                type="monotone"
                dataKey="total"
                name="Global Wealth"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                fill="url(#gradient-total)"
                dot={false}
                activeDot={false}
                style={{ filter: 'url(#glow-white)' }}
              />
            </AreaChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterProgressChart;
