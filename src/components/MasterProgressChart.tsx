import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
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
        <div className="bg-black border border-white/20 px-4 py-3 rounded">
          <p className="text-white text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: €{entry.value?.toLocaleString('de-DE') || 0}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getLineColor = (project: Project, index: number): string => {
    // Use project color or fallback to white/grey variations
    if (project.color === 'white') return '#FFFFFF';
    if (project.color === 'red') return '#EF4444';
    if (project.color === 'blue') return '#3B82F6';
    if (project.color === 'yellow') return '#EAB308';
    if (project.color === 'green') return '#22C55E';
    if (project.color === 'purple') return '#A855F7';
    return '#FFFFFF';
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
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis
            dataKey="date"
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 300 }}
            dy={10}
          />
          <YAxis
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 300 }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '12px',
              fontWeight: 300,
            }}
            formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)' }}>{value}</span>}
          />
          
          {/* Individual project lines */}
          {projects.map((project, index) => (
            <Line
              key={project.id}
              type="monotone"
              dataKey={project.id}
              name={project.name}
              stroke={getLineColor(project, index)}
              strokeWidth={1.5}
              dot={{ fill: getLineColor(project, index), r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
          
          {/* Total portfolio line - dashed */}
          <Line
            type="monotone"
            dataKey="total"
            name="Global Wealth"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            dot={{ fill: '#FFFFFF', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MasterProgressChart;
