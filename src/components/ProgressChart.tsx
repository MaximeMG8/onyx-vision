import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ProjectDeposit } from '@/types/project';
interface ProgressChartProps {
  deposits: ProjectDeposit[];
  targetAmount: number;
  accentColor?: string; // HSL format like "160 84% 39%"
}
const ProgressChart = ({
  deposits,
  targetAmount,
  accentColor = "0 0% 100%"
}: ProgressChartProps) => {
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
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      total,
      percentage: Math.round(total / targetAmount * 100)
    }));
  }, [deposits, targetAmount]);

  // Convert HSL to CSS color
  const accentHsl = `hsl(${accentColor})`;
  const accentHsla = (opacity: number) => `hsla(${accentColor} / ${opacity})`;
  const CustomTooltip = ({
    active,
    payload
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="border px-3 py-2 rounded-lg backdrop-blur-sm" style={{
        backgroundColor: 'hsla(0 0% 0% / 0.9)',
        borderColor: accentHsla(0.3)
      }}>
          <p className="text-foreground text-sm font-light">
            €{payload[0].value.toLocaleString('de-DE')}
          </p>
          <p className="text-muted-foreground text-xs">
            {payload[0].payload.percentage}% of goal
          </p>
        </div>;
    }
    return null;
  };
  if (chartData.length === 0) {
    return <div className="h-[200px] flex items-center justify-center border border-border/30 rounded-lg bg-card/20">
        <p className="text-muted-foreground text-sm font-light">No data yet</p>
      </div>;
  }
  return <div className="w-full">
      <h3 className="uppercase tracking-[0.25em] text-muted-foreground font-light mb-4 text-center text-xs">
        Analytics — Growth Chart
      </h3>
      
      <div className="h-[220px] w-full border-border/30 p-4 px-px border-0 py-px rounded-none shadow-md" style={{
      background: 'linear-gradient(180deg, hsla(0 0% 5% / 0.8) 0%, hsla(0 0% 0% / 0.9) 100%)'
    }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{
          top: 10,
          right: 10,
          left: -10,
          bottom: 0
        }}>
            <defs>
              <linearGradient id={`progressGradient-${accentColor.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentHsl} stopOpacity={0.4} />
                <stop offset="50%" stopColor={accentHsl} stopOpacity={0.15} />
                <stop offset="100%" stopColor={accentHsl} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 9,
            fontWeight: 300
          }} dy={10} interval="preserveStartEnd" />
            <YAxis axisLine={false} tickLine={false} tick={{
            fill: 'hsl(var(--muted-foreground))',
            fontSize: 9,
            fontWeight: 300
          }} tickFormatter={value => value >= 1000 ? `€${(value / 1000).toFixed(0)}k` : `€${value}`} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke={accentHsl} strokeWidth={2} fill={`url(#progressGradient-${accentColor.replace(/\s/g, '')})`} style={{
            filter: `drop-shadow(0 0 8px ${accentHsla(0.5)})`
          }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>;
};
export default ProgressChart;