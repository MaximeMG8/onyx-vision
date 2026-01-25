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

interface ProgressChartProps {
  deposits: ProjectDeposit[];
  targetAmount: number;
}

const ProgressChart = ({ deposits, targetAmount }: ProgressChartProps) => {
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
    
    // Get last 14 days of data or all if less
    const recentEntries = entries.slice(-14);
    
    return recentEntries.map(([date, total]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      percentage: Math.round((total / targetAmount) * 100),
    }));
  }, [deposits, targetAmount]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border border-white/20 px-3 py-2 rounded">
          <p className="text-white text-sm font-light">
            €{payload[0].value.toLocaleString('de-DE')}
          </p>
          <p className="text-white/60 text-xs">
            {payload[0].payload.percentage}% of goal
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-white/40 text-sm font-light">No data yet</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity={0.3} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 200 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 200 }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="white"
            strokeWidth={1.5}
            fill="url(#progressGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
