import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FocusTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className="text-center">
      <h3 className="text-xs uppercase tracking-[0.3em] text-white/60 mb-4 font-light">
        Time Tracker
      </h3>
      
      <div className="text-4xl md:text-5xl font-extralight tracking-tight text-white mb-6 font-mono">
        {formatTime(seconds)}
      </div>
      
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlayPause}
          className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
        >
          {isRunning ? (
            <Pause className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Play className="w-4 h-4" strokeWidth={1.5} />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
};

export default FocusTimer;
