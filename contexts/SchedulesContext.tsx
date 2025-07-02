import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import schedulesService, { Schedule, ScheduleShift, Employee } from '../services/schedulesService';

interface SchedulesContextType {
  schedules: Schedule[];
  currentSchedule: Schedule | null;
  scheduleShifts: ScheduleShift[];
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  loadSchedules: () => Promise<void>;
  loadScheduleShifts: (scheduleId: string) => Promise<void>;
  loadEmployees: () => Promise<void>;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  publishSchedule: (scheduleId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const SchedulesContext = createContext<SchedulesContextType | undefined>(undefined);

interface SchedulesProviderProps {
  children: ReactNode;
}

export function SchedulesProvider({ children }: SchedulesProviderProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [scheduleShifts, setScheduleShifts] = useState<ScheduleShift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      console.log('🚀 SchedulesContext: Starting to load schedules...');
      setIsLoading(true);
      setError(null);
      const data = await schedulesService.getSchedules();
      console.log('📥 SchedulesContext: Received schedules data:', data);
      setSchedules(data);
      
      // Set the most recent schedule as current if none is selected
      if (!currentSchedule && data.length > 0) {
        console.log('🎯 SchedulesContext: Setting current schedule...');
        const mostRecent = data.sort((a, b) => {
          console.log('📅 Comparing dates:', a.createdAt, 'vs', b.createdAt);
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })[0];
        console.log('✅ SchedulesContext: Most recent schedule selected:', mostRecent);
        setCurrentSchedule(mostRecent);
      }
    } catch (err: any) {
      console.error('❌ SchedulesContext: Load schedules error:', err);
      setError(err.message || 'Failed to load schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScheduleShifts = async (scheduleId: string) => {
    try {
      console.log('🚀 SchedulesContext: Starting to load shifts for schedule:', scheduleId);
      setIsLoading(true);
      setError(null);
      const data = await schedulesService.getScheduleShifts(scheduleId);
      console.log('📥 SchedulesContext: Received shifts data:', data);
      setScheduleShifts(data);
    } catch (err: any) {
      // Don't set error for missing shifts - it's not critical
      console.warn('❌ SchedulesContext: Load schedule shifts error:', err);
      setScheduleShifts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setError(null);
      const data = await schedulesService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      // Don't set error for employees - it's not critical for app functionality
      console.warn('Load employees error:', err);
      setEmployees([]);
    }
  };

  const publishSchedule = async (scheduleId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await schedulesService.publishSchedule(scheduleId);
      
      // Update the schedule status locally
      setSchedules(prev => prev.map(schedule => 
        schedule.id === scheduleId 
          ? { ...schedule, status: 'PUBLISHED' as const }
          : schedule
      ));

      // Update current schedule if it's the one being published
      if (currentSchedule?.id === scheduleId) {
        setCurrentSchedule(prev => prev ? { ...prev, status: 'PUBLISHED' } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish schedule');
      console.error('Publish schedule error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadSchedules();
    await loadEmployees();
    if (currentSchedule) {
      await loadScheduleShifts(currentSchedule.id);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        await loadSchedules();
        await loadEmployees();
      } catch (error) {
        console.error('Failed to initialize schedule data:', error);
      }
    };
    
    initializeData();
  }, []);

  // Load shifts when current schedule changes
  useEffect(() => {
    if (currentSchedule) {
      loadScheduleShifts(currentSchedule.id);
    }
  }, [currentSchedule]);

  const value: SchedulesContextType = {
    schedules,
    currentSchedule,
    scheduleShifts,
    employees,
    isLoading,
    error,
    loadSchedules,
    loadScheduleShifts,
    loadEmployees,
    setCurrentSchedule,
    publishSchedule,
    refreshData,
  };

  return (
    <SchedulesContext.Provider value={value}>
      {children}
    </SchedulesContext.Provider>
  );
}

export function useSchedules() {
  const context = useContext(SchedulesContext);
  if (context === undefined) {
    throw new Error('useSchedules must be used within a SchedulesProvider');
  }
  return context;
}