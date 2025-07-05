import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import authService from '../services/authService';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../components/LoadingSpinner';
import HostelShiftsLogo from '../components/HostelShiftsLogo';
import { TEXT_STYLES } from '../theme/fonts';

const AuthScreen: React.FC = () => {
  const { checkSession } = useAuth();
  const { isDark } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('aloha@ixplor.app');
  const [password, setPassword] = useState('password');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Animation values
  const slideAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  const colors = isDark ? COLORS.dark : COLORS.light;

  // Start animation on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
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
      if (isSignUp) {
        await authService.register(email.trim(), password, firstName.trim(), lastName.trim());
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. Please sign in with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSignUp(false);
                setConfirmPassword('');
                setFirstName('');
                setLastName('');
              },
            },
          ]
        );
      } else {
        const response = await authService.login(email.trim(), password);
        if (response.token) {
          await checkSession();
        }
      }
    } catch (error: any) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled">
          {/* Main Container */}
          <View
            style={{
              maxWidth: 400,
              width: '100%',
              alignSelf: 'center',
            }}>
            {/* Header */}
            <View style={{ marginBottom: 32, alignItems: 'center' }}>
              <Animated.View
                style={{
                  marginBottom: 48,
                  opacity: opacityAnim,
                  transform: [
                    {
                      scale: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                }}>
                <HostelShiftsLogo width={280} height={93} />
              </Animated.View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: colors.foreground,
                  textAlign: 'center',
                  marginBottom: 8,
                  ...TEXT_STYLES.semibold,
                }}>
                {isSignUp ? 'Create Account' : 'Login to your account'}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.grey2,
                  textAlign: 'center',
                  lineHeight: 20,
                  ...TEXT_STYLES.regular,
                }}>
                {isSignUp ? 'Sign up to manage your shifts' : ''}
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 20 }}>
              {/* Name Fields for Sign Up */}
              {isSignUp && (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.foreground,
                        ...TEXT_STYLES.medium,
                      }}>
                      First Name
                    </Text>
                    <TextInput
                      style={{
                        height: 44,
                        borderWidth: 1,
                        borderColor: colors.grey4,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        color: colors.foreground,
                        backgroundColor: colors.background,
                        textAlignVertical: 'center',
                        ...TEXT_STYLES.regular,
                      }}
                      placeholder="Enter your first name"
                      placeholderTextColor={colors.grey2}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoCapitalize="words"
                      keyboardAppearance={isDark ? 'dark' : 'light'}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: colors.foreground,
                        ...TEXT_STYLES.medium,
                      }}>
                      Last Name
                    </Text>
                    <TextInput
                      style={{
                        height: 44,
                        borderWidth: 1,
                        borderColor: colors.grey4,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        fontSize: 16,
                        color: colors.foreground,
                        backgroundColor: colors.background,
                        textAlignVertical: 'center',
                        ...TEXT_STYLES.regular,
                      }}
                      placeholder="Enter your last name"
                      placeholderTextColor={colors.grey2}
                      value={lastName}
                      onChangeText={setLastName}
                      autoCapitalize="words"
                      keyboardAppearance={isDark ? 'dark' : 'light'}
                    />
                  </View>
                </View>
              )}

              {/* Email Field */}
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: colors.foreground,
                    ...TEXT_STYLES.medium,
                  }}>
                  Email
                </Text>
                <TextInput
                  style={{
                    height: 44,
                    borderWidth: 1,
                    borderColor: colors.grey4,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    textAlignVertical: 'center',
                  }}
                  placeholder="m@example.com"
                  placeholderTextColor={colors.grey2}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardAppearance={isDark ? 'dark' : 'light'}
                />
              </View>

              {/* Password Field */}
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: colors.foreground,
                      ...TEXT_STYLES.medium,
                    }}>
                    Password
                  </Text>
                  {!isSignUp && (
                    <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
                      <Text style={{ fontSize: 14, color: colors.primary, ...TEXT_STYLES.regular }}>
                        Forgot your password?
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{
                      height: 44,
                      borderWidth: 1,
                      borderColor: colors.grey4,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingRight: 44,
                      fontSize: 16,
                      color: colors.foreground,
                      backgroundColor: colors.background,
                      textAlignVertical: 'center',
                      ...TEXT_STYLES.regular,
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.grey2}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    keyboardAppearance={isDark ? 'dark' : 'light'}
                  />
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: 20,
                    }}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color={colors.grey2}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password for Sign Up */}
              {isSignUp && (
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: colors.foreground,
                      ...TEXT_STYLES.medium,
                    }}>
                    Confirm Password
                  </Text>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={{
                        height: 44,
                        borderWidth: 1,
                        borderColor: colors.grey4,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingRight: 44,
                        fontSize: 16,
                        color: colors.foreground,
                        backgroundColor: colors.background,
                        textAlignVertical: 'center',
                      }}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.grey2}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      keyboardAppearance={isDark ? 'dark' : 'light'}
                    />
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 20,
                      }}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.grey2}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  height: 44,
                  borderRadius: 8,
                  marginTop: 8,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={handleAuth}
                disabled={isLoading}>
                <LinearGradient
                  colors={['#2563eb', '#06b6d4']} // blue to cyan to match logo
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  {isLoading ? (
                    <LoadingSpinner size={20} color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: 'white',
                        ...TEXT_STYLES.semibold,
                      }}>
                      {isSignUp ? 'Create Account' : 'Login'}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Toggle Sign Up/Sign In */}
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 14, color: colors.grey2, ...TEXT_STYLES.regular }}>
                  {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsSignUp(!isSignUp);
                    if (!isSignUp) {
                      clearForm();
                    }
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.primary,
                      ...TEXT_STYLES.semibold,
                    }}>
                    {isSignUp ? 'Sign In' : 'Sign up'}
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
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 24,
          }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 32,
              width: '100%',
              maxWidth: 400,
            }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: colors.foreground,
                textAlign: 'center',
                marginBottom: 8,
                ...TEXT_STYLES.semibold,
              }}>
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.grey,
                textAlign: 'center',
                marginBottom: 32,
                ...TEXT_STYLES.regular,
              }}>
              {"Enter your email and we'll send reset instructions."}
            </Text>

            <View style={{ marginBottom: 24, gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: colors.foreground,
                  ...TEXT_STYLES.medium,
                }}>
                Email
              </Text>
              <TextInput
                style={{
                  height: 44,
                  borderWidth: 1,
                  borderColor: colors.grey4,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  fontSize: 16,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                  textAlignVertical: 'center',
                }}
                placeholder="Email"
                placeholderTextColor={colors.grey2}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                keyboardAppearance={isDark ? 'dark' : 'light'}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 44,
                  borderWidth: 1,
                  borderColor: colors.grey4,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setShowForgotPassword(false)}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.foreground,
                    ...TEXT_STYLES.medium,
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 8,
                  opacity: isLoading ? 0.7 : 1,
                }}
                onPress={handleForgotPassword}
                disabled={isLoading}>
                <LinearGradient
                  colors={['#2563eb', '#06b6d4']} // blue to cyan to match logo
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  {isLoading ? (
                    <LoadingSpinner size={20} color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: 'white',
                        ...TEXT_STYLES.semibold,
                      }}>
                      Send Reset
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AuthScreen;
