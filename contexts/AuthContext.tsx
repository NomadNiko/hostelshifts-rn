import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import { preloadAvatarImages } from '../utils/imagePreloader';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  checkSession: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateUser: (user: User) => void;
  updateAvatar: (avatarNumber: number) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const checkSession = async () => {
    try {
      console.log('AuthContext: Starting session check');
      setIsLoading(true);

      // Initialize auth service
      await authService.init();

      const sessionExists = await authService.checkSession();
      console.log('AuthContext: Session exists:', sessionExists);
      setIsAuthenticated(sessionExists);
      console.log('AuthContext: Updated isAuthenticated to:', sessionExists);

      if (sessionExists) {
        // Get user info if session exists
        const userInfo = await authService.getCurrentUser();
        console.log('AuthContext: User info:', userInfo);
        setUser(userInfo);

        // Preload avatar images for better performance
        preloadAvatarImages().catch((error) => {
          console.warn('Avatar preloading failed:', error);
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      if (isAuthenticated) {
        console.log('AuthContext: Refreshing user data');
        const userInfo = await authService.getCurrentUser();
        console.log('AuthContext: Refreshed user info:', userInfo);
        setUser(userInfo);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const updateUser = (user: User) => {
    setUser(user);
  };

  const updateAvatar = async (avatarNumber: number) => {
    try {
      const updatedUser = await authService.updateAvatar(avatarNumber);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        checkSession,
        refreshUserData,
        updateUser,
        updateAvatar,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
