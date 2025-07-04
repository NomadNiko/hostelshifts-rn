import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

const API_BASE = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;

interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: User;
}

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: number | null;
  photo?: {
    id: string;
    path: string;
  };
  role?: {
    id: string;
    name: string;
  };
  status?: {
    id: string;
  };
  provider?: string;
  socialId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  async init() {
    // Load tokens from storage on init
    this.token = await AsyncStorage.getItem('hostelshifts_token');
    this.refreshToken = await AsyncStorage.getItem('hostelshifts_refreshToken');
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE}${API_ENDPOINTS.auth.login}`);

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        timeout: 10000, // 10 second timeout
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Store tokens
      await this.storeTokens(data.token, data.refreshToken);

      return data;
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle network errors specifically
      if (error.message === 'Network request failed') {
        throw new Error(
          'Cannot connect to server. Please check your internet connection and ensure the backend is running.'
        );
      }

      throw error;
    }
  }

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.register}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: firstName || '',
          lastName: lastName || '',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${API_BASE}${API_ENDPOINTS.auth.logout}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      if (!this.token) {
        return null;
      }

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.me}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            return this.getCurrentUser();
          }
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const data: LoginResponse = await response.json();
      await this.storeTokens(data.token, data.refreshToken);

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return false;
    }
  }

  async checkSession(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('hostelshifts_token');
      if (!token) {
        return false;
      }

      this.token = token;
      this.refreshToken = await AsyncStorage.getItem('hostelshifts_refreshToken');

      // Verify token by getting user info
      const user = await this.getCurrentUser();
      return user !== null;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }

  async updateAvatar(avatarNumber: number): Promise<User | null> {
    try {
      if (!this.token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${API_BASE}${API_ENDPOINTS.auth.me}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ avatar: avatarNumber }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            return this.updateAvatar(avatarNumber);
          }
        }
        throw new Error(`Failed to update avatar: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Update avatar error:', error);
      throw error;
    }
  }

  private async storeTokens(token: string, refreshToken: string) {
    this.token = token;
    this.refreshToken = refreshToken;
    await AsyncStorage.setItem('hostelshifts_token', token);
    await AsyncStorage.setItem('hostelshifts_refreshToken', refreshToken);
  }

  private async clearTokens() {
    this.token = null;
    this.refreshToken = null;
    await AsyncStorage.removeItem('hostelshifts_token');
    await AsyncStorage.removeItem('hostelshifts_refreshToken');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

export default new AuthService();
export type { User, LoginResponse };
