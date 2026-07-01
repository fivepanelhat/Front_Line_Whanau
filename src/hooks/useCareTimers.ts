import { useState, useEffect } from 'react';

// Hook for Stopwatch (count up)
export function useStopwatch(storageKey: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.startTime) {
          setIsRunning(true);
          setStartTime(parsed.startTime);
          setElapsedMs(parsed.elapsedMs + (Date.now() - parsed.startTime));
        } else {
          setElapsedMs(parsed.elapsedMs);
        }
      } catch (e) {}
    }
  }, [storageKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedMs(prev => prev + 1000);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  useEffect(() => {
    // Save to local storage whenever critical state changes
    if (startTime !== null || elapsedMs > 0) {
      localStorage.setItem(storageKey, JSON.stringify({ isRunning, startTime, elapsedMs }));
    }
  }, [isRunning, startTime, elapsedMs, storageKey]);

  const start = () => {
    setIsRunning(true);
    setStartTime(Date.now());
  };

  const stop = () => {
    setIsRunning(false);
    setStartTime(null);
  };

  const reset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedMs(0);
    localStorage.removeItem(storageKey);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { isRunning, elapsedMs, start, stop, reset, formatTime };
}

// Hook for Countdown (count down from target)
export function useCountdown(storageKey: string, initialMinutes: number) {
  const [isRunning, setIsRunning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(initialMinutes * 60 * 1000);
  const [endTime, setEndTime] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.isRunning && parsed.endTime) {
          const now = Date.now();
          if (now < parsed.endTime) {
            setIsRunning(true);
            setEndTime(parsed.endTime);
            setRemainingMs(parsed.endTime - now);
          } else {
            // Timer finished while away
            setIsRunning(false);
            setRemainingMs(0);
            setEndTime(null);
          }
        } else {
          setRemainingMs(parsed.remainingMs);
        }
      } catch (e) {}
    }
  }, [storageKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        if (now >= endTime) {
          setIsRunning(false);
          setRemainingMs(0);
          setEndTime(null);
          clearInterval(interval);
          // Optional: Play a sound or show notification here in the future
        } else {
          setRemainingMs(endTime - now);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, endTime]);

  useEffect(() => {
    if (endTime !== null || remainingMs !== initialMinutes * 60 * 1000) {
      localStorage.setItem(storageKey, JSON.stringify({ isRunning, endTime, remainingMs }));
    }
  }, [isRunning, endTime, remainingMs, storageKey, initialMinutes]);

  const start = () => {
    setIsRunning(true);
    setEndTime(Date.now() + remainingMs);
  };

  const stop = () => {
    setIsRunning(false);
    setEndTime(null);
  };

  const reset = () => {
    setIsRunning(false);
    setEndTime(null);
    setRemainingMs(initialMinutes * 60 * 1000);
    localStorage.removeItem(storageKey);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000); // use ceil so it doesn't show 0 too early
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { isRunning, remainingMs, start, stop, reset, formatTime };
}
