import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

const API_BASE = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;

export interface Schedule {
  id: string;
  name: string;
  startDate: string; // Backend uses startDate, not weekStart
  endDate: string; // Backend uses endDate, not weekEnd
  status: 'DRAFT' | 'PUBLISHED' | 'published'; // Backend returns lowercase 'published'
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id?: any;
    firstName?: string;
    lastName?: string;
  };
}

export interface ScheduleShift {
  id: string;
  scheduleId: string;
  date: string;
  order?: number;
  isActive?: boolean;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: number | null;
    role?: {
      id: string | number;
      _id?: string;
    };
  };
  shiftType?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    colorIndex?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface Employee {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: number | null;
  role?: {
    id: string;
    name: string;
  };
}

class SchedulesService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('hostelshifts_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getSchedules(): Promise<Schedule[]> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.schedules.list}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schedules: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get schedules error:', error);
      throw error;
    }
  }

  async getScheduleShifts(scheduleId: string): Promise<ScheduleShift[]> {
    try {
      if (!scheduleId) {
        return [];
      }

      const headers = await this.getAuthHeaders();
      const url = `${API_BASE}${API_ENDPOINTS.scheduleShifts.list.replace(':scheduleId', scheduleId)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to fetch schedule shifts: ${response.status}`);
      }

      const data = await response.json();

      // Backend returns { shifts: [...], unassignedShifts: [] }
      const shifts = data.shifts || [];
      return Array.isArray(shifts) ? shifts : [];
    } catch (error) {
      console.error('Get schedule shifts error:', error);
      return []; // Return empty array instead of throwing for better UX
    }
  }

  async getEmployees(): Promise<Employee[]> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.employees.list}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        // If employees endpoint doesn't exist, return empty array instead of throwing
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Get employees error:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  async publishSchedule(scheduleId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${API_BASE}${API_ENDPOINTS.schedules.publish.replace(':id', scheduleId)}`,
        {
          method: 'PATCH',
          headers,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to publish schedule');
      }
    } catch (error) {
      console.error('Publish schedule error:', error);
      throw error;
    }
  }
}

export default new SchedulesService();
