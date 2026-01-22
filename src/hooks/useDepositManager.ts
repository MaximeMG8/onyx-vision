import { useState, useEffect, useCallback } from "react";

export interface Deposit {
  id: string;
  amount: number;
  date: string; // ISO date string
  timestamp: number;
}

interface DepositManagerState {
  deposits: Deposit[];
  totalSaved: number;
  hasDepositedToday: boolean;
  timeUntilMidnight: string;
  depositDays: string[]; // Array of ISO date strings (YYYY-MM-DD)
}

const STORAGE_KEY = "mydream_deposits";

const getDateString = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const loadDeposits = (): Deposit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDeposits = (deposits: Deposit[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(deposits));
};

export const useDepositManager = (initialSaved: number = 0) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");

  // Load deposits on mount
  useEffect(() => {
    const loaded = loadDeposits();
    if (loaded.length === 0 && initialSaved > 0) {
      // Initialize with a fake historical deposit if starting fresh
      const initialDeposit: Deposit = {
        id: "initial",
        amount: initialSaved,
        date: getDateString(new Date(Date.now() - 86400000)), // Yesterday
        timestamp: Date.now() - 86400000,
      };
      setDeposits([initialDeposit]);
      saveDeposits([initialDeposit]);
    } else {
      setDeposits(loaded);
    }
  }, [initialSaved]);

  // Calculate time until midnight
  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    setTimeUntilMidnight(calculateTimeUntilMidnight());
    
    const interval = setInterval(() => {
      setTimeUntilMidnight(calculateTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const today = getDateString();
  const hasDepositedToday = deposits.some(d => d.date === today);
  
  const totalSaved = deposits.reduce((sum, d) => sum + d.amount, 0);
  
  const depositDays = [...new Set(deposits.map(d => d.date))];

  const addDeposit = useCallback((amount: number): Deposit | null => {
    if (hasDepositedToday) return null;
    
    const newDeposit: Deposit = {
      id: Date.now().toString(),
      amount,
      date: today,
      timestamp: Date.now(),
    };
    
    const updated = [...deposits, newDeposit];
    setDeposits(updated);
    saveDeposits(updated);
    
    return newDeposit;
  }, [deposits, hasDepositedToday, today]);

  const removeDeposit = useCallback((depositId: string) => {
    const updated = deposits.filter(d => d.id !== depositId);
    setDeposits(updated);
    saveDeposits(updated);
  }, [deposits]);

  const getRecentDeposits = (count: number = 10): Deposit[] => {
    return [...deposits]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, count);
  };

  return {
    deposits,
    totalSaved,
    hasDepositedToday,
    timeUntilMidnight,
    depositDays,
    addDeposit,
    removeDeposit,
    getRecentDeposits,
  };
};
