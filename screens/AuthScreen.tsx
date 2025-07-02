import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

const AuthScreen: React.FC = () => {
  const { checkSession } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('aloha@ixplor.app'); // Default test email
  const [password, setPassword] = useState('password'); // Default test password
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Always use dark theme colors for auth screen
  const colors = COLORS.dark;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (isSignUp) {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter your first and last name');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    }

    setIsLoading(true);

    try {
      console.log('AuthScreen: Starting auth process, isSignUp:', isSignUp);
      if (isSignUp) {
        console.log('AuthScreen: Calling register');
        await authService.register(email.trim(), password, firstName.trim(), lastName.trim());
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. Please sign in with your credentials.',
          [{ text: 'OK', onPress: () => {
            setIsSignUp(false);
            setConfirmPassword('');
            setFirstName('');
            setLastName('');
          }}]
        );
      } else {
        console.log('AuthScreen: Calling login');
        const response = await authService.login(email.trim(), password);
        console.log('AuthScreen: Login response:', response);

        if (response.token) {
          console.log('AuthScreen: Login successful, checking session');
          await checkSession();
          console.log('AuthScreen: Session check completed');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Authentication failed';
      if (error.message) {
        if (error.message.includes('email')) {
          errorMessage = 'Invalid email address';
        } else if (error.message.includes('password')) {
          errorMessage = 'Invalid password';
        } else if (error.message.includes('credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('exists')) {
          errorMessage = 'An account with this email already exists';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      // Add forgot password API call here when needed
      Alert.alert(
        'Password Reset',
        'If an account with this email exists, you will receive password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
      setShowForgotPassword(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            {/* Header */}
            <View className="mb-12 items-center">
              <Text
                className="text-4xl font-bold text-center"
                style={{ color: colors.foreground }}>
                {isSignUp ? 'Create Account' : 'HostelShifts'}
              </Text>
              <Text
                className="mt-3 text-center text-lg"
                style={{ color: colors.grey }}>
                {isSignUp
                  ? 'Sign up to manage your shifts'
                  : 'Sign in to view your schedule'}
              </Text>
              {!isSignUp && (
                <Text
                  className="mt-2 text-center text-sm"
                  style={{ color: colors.grey2 }}>
                  Test: aloha@ixplor.app / password
                </Text>
              )}
            </View>

            {/* Form Container */}
            <View className="w-full max-w-sm space-y-4">
              {/* Name fields for signup */}
              {isSignUp && (
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <TextInput
                      className="h-11 w-full rounded-lg border px-4 text-base"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: '#DBE2E9',
                        color: colors.foreground,
                      }}
                      placeholder="First name"
                      placeholderTextColor={colors.grey2}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className="h-11 w-full rounded-lg border px-4 text-base"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: '#DBE2E9',
                        color: colors.foreground,
                      }}
                      placeholder="Last name"
                      placeholderTextColor={colors.grey2}
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
              )}

              {/* Email */}
              <TextInput
                className="h-11 w-full rounded-lg border px-4 text-base"
                style={{
                  backgroundColor: colors.background,
                  borderColor: '#DBE2E9',
                  color: colors.foreground,
                }}
                placeholder="Email"
                placeholderTextColor={colors.grey2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {/* Password */}
              <View className="relative">
                <TextInput
                  className="h-11 w-full rounded-lg border pl-4 pr-12 text-base"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: '#DBE2E9',
                    color: colors.foreground,
                  }}
                  placeholder="Password"
                  placeholderTextColor={colors.grey2}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4 top-3"
                  onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={colors.grey2}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password for signup */}
              {isSignUp && (
                <View className="relative">
                  <TextInput
                    className="h-11 w-full rounded-lg border pl-4 pr-12 text-base"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: '#DBE2E9',
                      color: colors.foreground,
                    }}
                    placeholder="Confirm password"
                    placeholderTextColor={colors.grey2}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    className="absolute right-4 top-3"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.grey2}
                    />
                  </TouchableOpacity>
                </View>
              )}

              {/* Forgot Password Link (only for sign in) */}
              {!isSignUp && (
                <View className="items-end mt-2">
                  <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
                    <Text className="text-sm" style={{ color: colors.primary }}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                className={`h-11 w-full items-center justify-center rounded-lg mt-6 ${isLoading ? 'opacity-50' : ''}`}
                style={{ backgroundColor: colors.primary }}
                onPress={handleAuth}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center text-base font-semibold text-white">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Sign Up/Sign In */}
              <View className="mt-6 flex-row items-center justify-center">
                <Text className="text-sm" style={{ color: colors.grey2 }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    if (!isSignUp) {
                      clearForm();
                    }
                  }}>
                  <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotPassword(false)}>
        <View 
          className="flex-1 items-center justify-center bg-black/50 p-6">
          <View 
            className="w-full max-w-sm rounded-2xl p-8"
            style={{ backgroundColor: colors.background }}>
            <Text 
              className="mb-2 text-2xl font-bold text-center"
              style={{ color: colors.foreground }}>
              Reset Password
            </Text>
            <Text 
              className="mb-8 text-center text-base"
              style={{ color: colors.grey }}>
              Enter your email and we'll send reset instructions.
            </Text>
            
            <View className="mb-6">
              <TextInput
                className="h-11 w-full rounded-lg border px-4 text-base"
                style={{
                  backgroundColor: colors.background,
                  borderColor: '#DBE2E9',
                  color: colors.foreground,
                }}
                placeholder="Email"
                placeholderTextColor={colors.grey2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 h-11 items-center justify-center rounded-lg border"
                style={{ borderColor: '#DBE2E9' }}
                onPress={() => setShowForgotPassword(false)}>
                <Text 
                  className="text-base font-medium"
                  style={{ color: colors.foreground }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 h-11 items-center justify-center rounded-lg ${isLoading ? 'opacity-50' : ''}`}
                style={{ backgroundColor: colors.primary }}
                onPress={handleForgotPassword}
                disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Send Reset
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AuthScreen;