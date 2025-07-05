import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import authService from './authService';

const API_BASE = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;

export enum TimeClockStatus {
  CLOCKED_IN = 'CLOCKED_IN',
  CLOCKED_OUT = 'CLOCKED_OUT',
}

export interface TimeClockEntry {
  _id: string;
  employee: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: number;
  };
  clockInTime: string;
  clockOutTime?: string | null;
  totalMinutes: number;
  totalHours: number;
  durationDisplay: string;
  currentSessionMinutes: number;
  status: TimeClockStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeClockStatusResponse {
  status: TimeClockStatus;
  isClockedIn: boolean;
  currentEntry?: TimeClockEntry;
  currentSessionMinutes?: number;
  currentSessionDisplay?: string;
  clockedInAt?: string;
}

export interface ClockInRequest {
  notes?: string;
}

export interface ClockOutRequest {
  notes?: string;
}

export interface TimeClockEntriesResponse {
  entries: TimeClockEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeClockQueryParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

class TimeClockService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await authService.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            const newHeaders = await this.getAuthHeaders();
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...newHeaders,
                ...options.headers,
              },
            });

            if (!retryResponse.ok) {
              const error = await retryResponse.json();
              throw new Error(error.message || 'Request failed');
            }

            return await retryResponse.json();
          }
        }

        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Time clock service error:', error);
      throw error;
    }
  }

  /**
   * Clock in the current user
   */
  async clockIn(request: ClockInRequest = {}): Promise<TimeClockEntry> {
    return this.handleAuthenticatedRequest<TimeClockEntry>(
      `${API_BASE}${API_ENDPOINTS.timeClock.clockIn}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Clock out the current user
   */
  async clockOut(request: ClockOutRequest = {}): Promise<TimeClockEntry> {
    return this.handleAuthenticatedRequest<TimeClockEntry>(
      `${API_BASE}${API_ENDPOINTS.timeClock.clockOut}`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Get current time clock status
   */
  async getCurrentStatus(): Promise<TimeClockStatusResponse> {
    return this.handleAuthenticatedRequest<TimeClockStatusResponse>(
      `${API_BASE}${API_ENDPOINTS.timeClock.status}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get current user's time entries
   */
  async getMyTimeEntries(params: TimeClockQueryParams = {}): Promise<TimeClockEntriesResponse> {
    const queryParams = new URLSearchParams();

    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_BASE}${API_ENDPOINTS.timeClock.myEntries}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    return this.handleAuthenticatedRequest<TimeClockEntriesResponse>(url, {
      method: 'GET',
    });
  }

  /**
   * Get a specific time entry
   */
  async getTimeEntry(entryId: string): Promise<TimeClockEntry> {
    const url = API_ENDPOINTS.timeClock.entry.replace(':id', entryId);

    return this.handleAuthenticatedRequest<TimeClockEntry>(`${API_BASE}${url}`, {
      method: 'GET',
    });
  }

  /**
   * Calculate session duration display
   */
  formatDuration(minutes: number): string {
    if (minutes === 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get current session duration in minutes (if clocked in)
   */
  getCurrentSessionMinutes(clockInTime: string): number {
    const now = new Date();
    const clockIn = new Date(clockInTime);
    return Math.floor((now.getTime() - clockIn.getTime()) / (1000 * 60));
  }

  /**
   * Check if user is currently clocked in
   */
  async isCurrentlyClockedIn(): Promise<boolean> {
    try {
      const status = await this.getCurrentStatus();
      return status.isClockedIn;
    } catch (error) {
      console.error('Error checking clock status:', error);
      return false;
    }
  }

  /**
   * Get today's total work time
   */
  async getTodayWorkTime(): Promise<{
    totalMinutes: number;
    totalHours: number;
    durationDisplay: string;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const entries = await this.getMyTimeEntries({
        startDate: today,
        endDate: today,
        limit: 100,
      });

      const totalMinutes = entries.entries.reduce((total, entry) => {
        if (entry.status === TimeClockStatus.CLOCKED_OUT) {
          return total + entry.totalMinutes;
        } else if (entry.status === TimeClockStatus.CLOCKED_IN) {
          // Add current session time for ongoing entries
          return total + this.getCurrentSessionMinutes(entry.clockInTime);
        }
        return total;
      }, 0);

      return {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        durationDisplay: this.formatDuration(totalMinutes),
      };
    } catch (error) {
      console.error('Error getting today work time:', error);
      return {
        totalMinutes: 0,
        totalHours: 0,
        durationDisplay: '0h 0m',
      };
    }
  }

  /**
   * Get this week's total work time
   */
  async getWeekWorkTime(): Promise<{
    totalMinutes: number;
    totalHours: number;
    durationDisplay: string;
  }> {
    try {
      // Get start of week (Monday)
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      // Get end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const entries = await this.getMyTimeEntries({
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        limit: 200,
      });

      const totalMinutes = entries.entries.reduce((total, entry) => {
        if (entry.status === TimeClockStatus.CLOCKED_OUT) {
          return total + entry.totalMinutes;
        } else if (entry.status === TimeClockStatus.CLOCKED_IN) {
          // Add current session time for ongoing entries
          return total + this.getCurrentSessionMinutes(entry.clockInTime);
        }
        return total;
      }, 0);

      return {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        durationDisplay: this.formatDuration(totalMinutes),
      };
    } catch (error) {
      console.error('Error getting week work time:', error);
      return {
        totalMinutes: 0,
        totalHours: 0,
        durationDisplay: '0h 0m',
      };
    }
  }
}

export default new TimeClockService();
