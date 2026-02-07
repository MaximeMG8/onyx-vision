import { useCallback, useRef, useState } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  delay?: number;
  onStart?: () => void;
  onCancel?: () => void;
  enableHaptic?: boolean;
}

// Trigger haptic feedback if available
const triggerHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50); // 50ms vibration
  }
};

export const useLongPress = ({
  onLongPress,
  delay = 500,
  onStart,
  onCancel,
  enableHaptic = false,
}: UseLongPressOptions) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    setIsPressed(true);
    setProgress(0);
    startTimeRef.current = Date.now();
    onStart?.();

    // Update progress every 50ms
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / delay) * 100, 100);
      setProgress(newProgress);
    }, 50);

    timerRef.current = setTimeout(() => {
      if (enableHaptic) {
        triggerHaptic();
      }
      onLongPress();
      cancel();
    }, delay);
  }, [delay, onLongPress, onStart, enableHaptic]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPressed(false);
    setProgress(0);
    onCancel?.();
  }, [onCancel]);

  return {
    isPressed,
    progress,
    handlers: {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel,
    },
  };
};
