import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ProjectDeposit } from '@/types/project';

interface HeroProgressChartProps {
  deposits: ProjectDeposit[];
  targetAmount: number;
  accentColor?: string;
  projectColor?: 'white' | 'red' | 'blue' | 'yellow' | 'green' | 'purple';
}

const HeroProgressChart = ({ 
  deposits, 
  targetAmount, 
  accentColor,
  projectColor = 'white' 
}: HeroProgressChartProps) => {
  const chartData = useMemo(() => {
    if (deposits.length === 0) return [];

    // Sort deposits by date
    const sorted = [...deposits].sort((a, b) => a.timestamp - b.timestamp);
    
    // Group by date and calculate cumulative total
    const dailyData: Record<string, number> = {};
    let cumulative = 0;
    
    sorted.forEach(deposit => {
      cumulative += deposit.amount;
      dailyData[deposit.date] = cumulative;
    });

    // Convert to array and format for chart
    const entries = Object.entries(dailyData);
    
    // Get last 30 days of data or all if less
    const recentEntries = entries.slice(-30);
    
    return recentEntries.map(([date, total]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      percentage: Math.round((total / targetAmount) * 100),
    }));
  }, [deposits, targetAmount]);

  // Get gradient colors based on project color
  const getGradientColors = () => {
    switch (projectColor) {
      case 'green':
        return { stroke: '#10B981', fillStart: '#10B981', glowColor: 'rgba(16, 185, 129, 0.4)' };
      case 'red':
        return { stroke: '#EF4444', fillStart: '#EF4444', glowColor: 'rgba(239, 68, 68, 0.4)' };
      case 'blue':
        return { stroke: '#3B82F6', fillStart: '#3B82F6', glowColor: 'rgba(59, 130, 246, 0.4)' };
      case 'yellow':
        return { stroke: '#EAB308', fillStart: '#EAB308', glowColor: 'rgba(234, 179, 8, 0.4)' };
      case 'purple':
        return { stroke: '#A855F7', fillStart: '#A855F7', glowColor: 'rgba(168, 85, 247, 0.4)' };
      default:
        return { stroke: '#FFFFFF', fillStart: '#FFFFFF', glowColor: 'rgba(255, 255, 255, 0.4)' };
    }
  };

  const colors = getGradientColors();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-sm border border-white/10 px-4 py-3 rounded-sm shadow-2xl">
          <p className="text-white text-sm font-light tracking-wide">
            €{payload[0].value.toLocaleString('de-DE')}
          </p>
          <p className="text-white/50 text-xs font-extralight">
            {payload[0].payload.percentage}% of goal
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-48 w-full flex items-center justify-center border border-white/5 rounded-lg bg-white/[0.02]">
        <p className="text-white/30 text-sm font-extralight tracking-widest uppercase">
          No deposits yet
        </p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id={`heroGradient-${projectColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.fillStart} stopOpacity={0.3} />
              <stop offset="50%" stopColor={colors.fillStart} stopOpacity={0.1} />
              <stop offset="100%" stopColor={colors.fillStart} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 200 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 200 }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            width={50}
            dx={-5}
          />
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ 
              stroke: 'rgba(255,255,255,0.15)', 
              strokeWidth: 1,
              strokeDasharray: '4 4'
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={colors.stroke}
            strokeWidth={2}
            fill={`url(#heroGradient-${projectColor})`}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 0, 
              fill: colors.stroke,
              style: { filter: `drop-shadow(0 0 6px ${colors.glowColor})` }
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeroProgressChart;
