import { useMemo, useState, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceDot } from 'recharts';
import { motion } from 'framer-motion';
import { ProjectDeposit } from '@/types/project';

interface ProgressChartProps {
  deposits: ProjectDeposit[];
  targetAmount: number;
  accentColor?: string; // HSL format like "160 84% 39%"
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  total: number;
  percentage: number;
  index: number;
}

const ProgressChart = ({
  deposits,
  targetAmount,
  accentColor = "0 0% 100%"
}: ProgressChartProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPinchDistance = useRef<number | null>(null);
  const lastPanX = useRef<number | null>(null);
  const isPanning = useRef(false);

  const allChartData = useMemo(() => {
    if (deposits.length === 0) return [];

    const sorted = [...deposits].sort((a, b) => a.timestamp - b.timestamp);
    const dailyData: Record<string, number> = {};
    let cumulative = 0;
    
    sorted.forEach(deposit => {
      cumulative += deposit.amount;
      dailyData[deposit.date] = cumulative;
    });

    return Object.entries(dailyData).map(([date, total], index) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      fullDate: new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      total,
      percentage: Math.round(total / targetAmount * 100),
      index
    }));
  }, [deposits, targetAmount]);

  // Calculate visible data based on zoom and pan
  const visibleData = useMemo(() => {
    if (allChartData.length === 0) return [];
    if (zoomLevel <= 1) return allChartData;

    const totalPoints = allChartData.length;
    const visiblePoints = Math.max(3, Math.ceil(totalPoints / zoomLevel));
    const maxOffset = totalPoints - visiblePoints;
    const clampedOffset = Math.max(0, Math.min(maxOffset, Math.round(panOffset)));
    
    return allChartData.slice(clampedOffset, clampedOffset + visiblePoints);
  }, [allChartData, zoomLevel, panOffset]);

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastPinchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      isPanning.current = false;
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      lastPanX.current = e.touches[0].clientX;
      isPanning.current = true;
    }
  }, [zoomLevel]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistance.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const scale = currentDistance / lastPinchDistance.current;
      setZoomLevel(prev => Math.max(1, Math.min(8, prev * scale)));
      lastPinchDistance.current = currentDistance;
    } else if (e.touches.length === 1 && isPanning.current && lastPanX.current !== null && zoomLevel > 1) {
      const deltaX = lastPanX.current - e.touches[0].clientX;
      const sensitivity = (allChartData.length / zoomLevel) * 0.01;
      setPanOffset(prev => {
        const maxOffset = allChartData.length - Math.ceil(allChartData.length / zoomLevel);
        return Math.max(0, Math.min(maxOffset, prev + deltaX * sensitivity));
      });
      lastPanX.current = e.touches[0].clientX;
    }
  }, [zoomLevel, allChartData.length]);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistance.current = null;
    lastPanX.current = null;
    isPanning.current = false;
  }, []);

  // Double tap to reset zoom
  const lastTapTime = useRef(0);
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      setZoomLevel(1);
      setPanOffset(0);
      setSelectedPoint(null);
    }
    lastTapTime.current = now;
  }, []);

  const accentHsl = `hsl(${accentColor})`;
  const accentHsla = (opacity: number) => `hsla(${accentColor} / ${opacity})`;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="px-2.5 py-1.5 rounded backdrop-blur-sm"
          style={{
            backgroundColor: 'hsla(0 0% 100% / 0.95)',
          }}
        >
          <p className="text-black text-xs font-medium">
            €{payload[0].value.toLocaleString('de-DE')}
          </p>
          <p className="text-black/60 text-[10px]">
            {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Point click handler for mobile
  const handleChartClick = useCallback((data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      setSelectedPoint(data.activePayload[0].payload);
      setTimeout(() => setSelectedPoint(null), 3000);
    }
  }, []);

  if (allChartData.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center">
        <p className="text-muted-foreground text-sm font-light">No data yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="uppercase tracking-[0.25em] text-muted-foreground font-light text-center text-xs flex-1">
          Analytics — Growth Chart
        </h3>
        {zoomLevel > 1 && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: accentHsla(0.2),
              color: accentHsl
            }}
          >
            {zoomLevel.toFixed(1)}x
          </motion.span>
        )}
      </div>
      
      {/* Interactive chart container - panoramic style */}
      <div
        ref={containerRef}
        className="h-[170px] w-full relative touch-none"
        style={{
          background: 'transparent'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleTap}
      >
        {/* Zoom hint */}
        {zoomLevel === 1 && allChartData.length > 5 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute top-2 right-2 z-10"
          >
            <span className="text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              Pinch to zoom
            </span>
          </motion.div>
        )}

        {/* Selected point tooltip */}
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-20 border px-4 py-2 rounded-lg backdrop-blur-md"
            style={{
              backgroundColor: 'hsla(0 0% 100% / 0.95)',
              borderColor: accentHsla(0.3)
            }}
          >
            <p className="text-black text-sm font-medium">
              €{selectedPoint.total.toLocaleString('de-DE')}
            </p>
            <p className="text-black/60 text-xs">
              {selectedPoint.fullDate}
            </p>
          </motion.div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={visibleData} 
            margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            onClick={handleChartClick}
          >
            <defs>
              <linearGradient id={`progressGradient-${accentColor.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity={0.15} />
                <stop offset="40%" stopColor="hsl(0 0% 100%)" stopOpacity={0.05} />
                <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            {/* Subtle horizontal gridlines */}
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 8,
                fontWeight: 300,
                fontFamily: 'system-ui, sans-serif'
              }} 
              dy={8} 
              interval="preserveStartEnd" 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 8,
                fontWeight: 300,
                fontFamily: 'system-ui, sans-serif'
              }} 
              tickFormatter={value => value >= 1000 ? `€${(value / 1000).toFixed(1)}k` : `€${value}`} 
              width={40}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(0 0% 100%)" 
              strokeWidth={2} 
              fill={`url(#progressGradient-${accentColor.replace(/\s/g, '')})`} 
              style={{
                filter: 'drop-shadow(0 0 8px hsla(0 0% 100% / 0.4))'
              }}
              animationDuration={300}
            />
            {selectedPoint && (
              <ReferenceDot
                x={selectedPoint.date}
                y={selectedPoint.total}
                r={6}
                fill={accentHsl}
                stroke="white"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Pan indicator when zoomed */}
        {zoomLevel > 1 && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: Math.min(5, Math.ceil(zoomLevel)) }).map((_, i) => {
              const totalSegments = Math.ceil(zoomLevel);
              const currentSegment = Math.floor((panOffset / (allChartData.length - allChartData.length / zoomLevel)) * totalSegments);
              return (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-200"
                  style={{
                    width: i === currentSegment ? 16 : 6,
                    backgroundColor: i === currentSegment ? accentHsl : 'hsla(0 0% 100% / 0.2)'
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Zoom instructions */}
      {zoomLevel > 1 && (
        <p className="text-center text-[10px] text-muted-foreground/50 mt-2 uppercase tracking-wider">
          Double-tap to reset • Drag to pan
        </p>
      )}
    </div>
  );
};

export default ProgressChart;