import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import timeClockService, { 
  TimeClockEntry, 
  TimeClockStatus, 
  TimeClockStatusResponse,
  ClockInRequest,
  ClockOutRequest,
  TimeClockEntriesResponse,
  TimeClockQueryParams
} from '../services/timeClockService';

interface TimeClockContextType {
  // Status state
  currentStatus: TimeClockStatusResponse | null;
  isLoading: boolean;
  isClockedIn: boolean;
  
  // Current session state
  currentEntry: TimeClockEntry | null;
  currentSessionMinutes: number;
  currentSessionDisplay: string;
  
  // Time summaries
  todayWorkTime: { totalMinutes: number; totalHours: number; durationDisplay: string };
  weekWorkTime: { totalMinutes: number; totalHours: number; durationDisplay: string };
  
  // Recent entries
  recentEntries: TimeClockEntry[];
  
  // Actions
  clockIn: (request?: ClockInRequest) => Promise<void>;
  clockOut: (request?: ClockOutRequest) => Promise<void>;
  refreshStatus: () => Promise<void>;
  loadRecentEntries: () => Promise<void>;
  loadWorkTimeSummaries: () => Promise<void>;
  getTimeEntries: (params?: TimeClockQueryParams) => Promise<TimeClockEntriesResponse>;
}

const TimeClockContext = createContext<TimeClockContextType | undefined>(undefined);

export const TimeClockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentStatus, setCurrentStatus] = useState<TimeClockStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeClockEntry | null>(null);
  const [currentSessionMinutes, setCurrentSessionMinutes] = useState(0);
  const [currentSessionDisplay, setCurrentSessionDisplay] = useState('0h 0m');
  const [recentEntries, setRecentEntries] = useState<TimeClockEntry[]>([]);
  const [todayWorkTime, setTodayWorkTime] = useState({ 
    totalMinutes: 0, 
    totalHours: 0, 
    durationDisplay: '0h 0m' 
  });
  const [weekWorkTime, setWeekWorkTime] = useState({ 
    totalMinutes: 0, 
    totalHours: 0, 
    durationDisplay: '0h 0m' 
  });

  // Timer for updating current session display
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  const isClockedIn = currentStatus?.isClockedIn || false;

  const refreshStatus = async () => {
    try {
      setIsLoading(true);
      const status = await timeClockService.getCurrentStatus();
      setCurrentStatus(status);
      
      if (status.isClockedIn && status.currentEntry) {
        setCurrentEntry(status.currentEntry);
        updateCurrentSessionTime(status.currentEntry.clockInTime);
        startSessionTimer(status.currentEntry.clockInTime);
      } else {
        setCurrentEntry(null);
        setCurrentSessionMinutes(0);
        setCurrentSessionDisplay('0h 0m');
        stopSessionTimer();
      }
    } catch (error) {
      console.error('Error refreshing time clock status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clockIn = async (request: ClockInRequest = {}) => {
    try {
      setIsLoading(true);
      const entry = await timeClockService.clockIn(request);
      
      // Refresh status after successful clock in
      await refreshStatus();
      await loadRecentEntries();
      await loadWorkTimeSummaries();
      
      console.log('Successfully clocked in:', entry);
    } catch (error) {
      console.error('Error clocking in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clockOut = async (request: ClockOutRequest = {}) => {
    try {
      setIsLoading(true);
      const entry = await timeClockService.clockOut(request);
      
      // Refresh status after successful clock out
      await refreshStatus();
      await loadRecentEntries();
      await loadWorkTimeSummaries();
      
      console.log('Successfully clocked out:', entry);
    } catch (error) {
      console.error('Error clocking out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const response = await timeClockService.getMyTimeEntries({ 
        limit: 10,
        page: 1 
      });
      setRecentEntries(response.entries);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const loadWorkTimeSummaries = async () => {
    try {
      const [today, week] = await Promise.all([
        timeClockService.getTodayWorkTime(),
        timeClockService.getWeekWorkTime(),
      ]);
      
      setTodayWorkTime(today);
      setWeekWorkTime(week);
    } catch (error) {
      console.error('Error loading work time summaries:', error);
    }
  };

  const getTimeEntries = async (params: TimeClockQueryParams = {}): Promise<TimeClockEntriesResponse> => {
    return timeClockService.getMyTimeEntries(params);
  };

  const updateCurrentSessionTime = (clockInTime: string) => {
    const minutes = timeClockService.getCurrentSessionMinutes(clockInTime);
    setCurrentSessionMinutes(minutes);
    setCurrentSessionDisplay(timeClockService.formatDuration(minutes));
  };

  const startSessionTimer = (clockInTime: string) => {
    stopSessionTimer(); // Clear any existing timer
    
    const timer = setInterval(() => {
      updateCurrentSessionTime(clockInTime);
    }, 60000); // Update every minute
    
    setSessionTimer(timer);
  };

  const stopSessionTimer = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  };

  // Initialize data when component mounts
  useEffect(() => {
    const initializeTimeClockData = async () => {
      await refreshStatus();
      await loadRecentEntries();
      await loadWorkTimeSummaries();
    };

    initializeTimeClockData();

    // Cleanup timer on unmount
    return () => {
      stopSessionTimer();
    };
  }, []);

  // Update work time summaries periodically
  useEffect(() => {
    const summaryTimer = setInterval(() => {
      loadWorkTimeSummaries();
    }, 5 * 60 * 1000); // Update every 5 minutes

    return () => clearInterval(summaryTimer);
  }, []);

  return (
    <TimeClockContext.Provider
      value={{
        // Status state
        currentStatus,
        isLoading,
        isClockedIn,
        
        // Current session state
        currentEntry,
        currentSessionMinutes,
        currentSessionDisplay,
        
        // Time summaries
        todayWorkTime,
        weekWorkTime,
        
        // Recent entries
        recentEntries,
        
        // Actions
        clockIn,
        clockOut,
        refreshStatus,
        loadRecentEntries,
        loadWorkTimeSummaries,
        getTimeEntries,
      }}>
      {children}
    </TimeClockContext.Provider>
  );
};

export const useTimeClock = () => {
  const context = useContext(TimeClockContext);
  if (context === undefined) {
    throw new Error('useTimeClock must be used within a TimeClockProvider');
  }
  return context;
};