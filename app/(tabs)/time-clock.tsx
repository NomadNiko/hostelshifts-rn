import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeClock } from '../../contexts/TimeClockContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import { TEXT_STYLES } from '../../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { TimeClockEntry, TimeClockStatus } from '../../services/timeClockService';
import schedulesService, { ScheduleShift } from '../../services/schedulesService';

export default function TimeClockTab() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const {
    isClockedIn,
    isLoading,
    currentEntry,
    currentSessionDisplay,
    todayWorkTime,
    weekWorkTime,
    recentEntries,
    clockIn,
    clockOut,
    refreshStatus,
    loadRecentEntries,
    loadWorkTimeSummaries,
  } = useTimeClock();

  const [refreshing, setRefreshing] = useState(false);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [upcomingShift, setUpcomingShift] = useState<ScheduleShift | null>(null);
  const [upcomingShiftLoading, setUpcomingShiftLoading] = useState(true);

  const colors = isDark ? COLORS.dark : COLORS.light;

  const fetchUpcomingShift = async () => {
    try {
      setUpcomingShiftLoading(true);
      const myShifts = await schedulesService.getMyShifts();

      if (myShifts.length === 0) {
        setUpcomingShift(null);
        return;
      }

      // Filter to only future shifts and get the next one
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const futureShifts = myShifts
        .filter((shift) => {
          const shiftDate = new Date(shift.date);
          shiftDate.setHours(0, 0, 0, 0);
          return shiftDate >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setUpcomingShift(futureShifts.length > 0 ? futureShifts[0] : null);
    } catch (error) {
      console.error('Error fetching upcoming shift:', error);
    } finally {
      setUpcomingShiftLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingShift();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshStatus(),
        loadRecentEntries(),
        loadWorkTimeSummaries(),
        fetchUpcomingShift(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockActionLoading(true);
      await clockIn();
      Alert.alert('Success', 'You have been clocked in successfully');
    } catch (error: any) {
      console.error('Clock in error:', error);
      Alert.alert('Error', error.message || 'Failed to clock in');
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    Alert.alert('Clock Out', 'Are you sure you want to clock out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clock Out',
        style: 'destructive',
        onPress: async () => {
          try {
            setClockActionLoading(true);
            await clockOut();
            Alert.alert('Success', 'You have been clocked out successfully');
          } catch (error: any) {
            console.error('Clock out error:', error);
            Alert.alert('Error', error.message || 'Failed to clock out');
          } finally {
            setClockActionLoading(false);
          }
        },
      },
    ]);
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.lastName) {
      return user.lastName;
    } else {
      return user?.email || 'User';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTimeEntry = (entry: TimeClockEntry, index: number) => (
    <View
      key={typeof entry._id === 'string' ? entry._id : `entry-${index}-${entry.clockInTime}`}
      style={{
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
        position: 'relative',
      }}>
      {/* Gloss overlay */}
      <LinearGradient
        colors={
          isDark
            ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
            : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
        }
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
          borderRadius: 12,
          opacity: 0.8,
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {/* Lens effect */}
      <View
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          right: 2,
          bottom: 2,
          borderRadius: 10,
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
          opacity: 0.3,
        }}
      />
      {/* Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons
                name={
                  entry.status === TimeClockStatus.CLOCKED_IN ? 'play-circle' : 'checkmark-circle'
                }
                size={20}
                color={entry.status === TimeClockStatus.CLOCKED_IN ? colors.primary : '#10B981'}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.foreground,
                  marginLeft: 8,
                  ...TEXT_STYLES.semibold,
                }}>
                {entry.status === TimeClockStatus.CLOCKED_IN ? 'In Progress' : 'Completed'}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 14,
                color: colors.grey2,
                marginBottom: 4,
                ...TEXT_STYLES.regular,
              }}>
              Started: {formatDate(entry.clockInTime)}
            </Text>

            {entry.clockOutTime && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.grey2,
                  marginBottom: 4,
                  ...TEXT_STYLES.regular,
                }}>
                Ended: {formatDate(entry.clockOutTime)}
              </Text>
            )}

            {entry.notes && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.grey,
                  marginTop: 4,
                  fontStyle: 'italic',
                  ...TEXT_STYLES.regular,
                }}>
                &quot;{entry.notes}&quot;
              </Text>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.foreground,
                ...TEXT_STYLES.bold,
              }}>
              {entry.status === TimeClockStatus.CLOCKED_IN
                ? currentSessionDisplay
                : entry.durationDisplay}
            </Text>
            {entry.status === TimeClockStatus.CLOCKED_IN && (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.primary,
                  marginTop: 2,
                  ...TEXT_STYLES.regular,
                }}>
                Live
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-6 pb-4">
          <View>
            <Text
              className="font-bold text-2xl"
              style={{ color: colors.foreground, ...TEXT_STYLES.bold }}>
              Time Clock
            </Text>
            <Text className="text-sm" style={{ color: colors.grey, ...TEXT_STYLES.regular }}>
              Welcome back, {user?.firstName || user?.email}!
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Welcome Section */}
        <View className="px-6 pb-4">
          <View style={{ borderRadius: 16, marginBottom: 24 }}>
            <View
              style={{
                borderRadius: 16,
                padding: 20,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                overflow: 'hidden',
                position: 'relative',
              }}>
              {/* Gloss overlay */}
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
                    : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '60%',
                  borderRadius: 16,
                  opacity: 0.8,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              {/* Lens effect */}
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  right: 2,
                  bottom: 2,
                  borderRadius: 14,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  opacity: 0.3,
                }}
              />
              {/* Content */}
              <View style={{ position: 'relative', zIndex: 10 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.foreground,
                    marginBottom: 8,
                    ...TEXT_STYLES.bold,
                  }}>
                  Welcome, {getUserDisplayName()}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.grey2,
                    ...TEXT_STYLES.regular,
                  }}>
                  {isClockedIn ? 'You are currently clocked in' : 'Ready to start your shift?'}
                </Text>
              </View>
            </View>
          </View>

          {/* Upcoming Shift Card */}
          {upcomingShiftLoading ? (
            <View
              style={{
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                borderWidth: 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}>
              {/* Gloss overlay */}
              <LinearGradient
                colors={
                  isDark
                    ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
                    : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '60%',
                  borderRadius: 16,
                  opacity: 0.8,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
              {/* Lens effect */}
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  right: 2,
                  bottom: 2,
                  borderRadius: 14,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  opacity: 0.3,
                }}
              />
              {/* Content */}
              <View style={{ position: 'relative', zIndex: 10 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={{
                    color: colors.grey2,
                    marginTop: 8,
                    ...TEXT_STYLES.regular,
                  }}>
                  Loading upcoming shift...
                </Text>
              </View>
            </View>
          ) : upcomingShift ? (
            <View style={{ borderRadius: 16, marginBottom: 24 }}>
              <View
                style={{
                  borderRadius: 16,
                  padding: 20,
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.3)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay with blue tint */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.1)', 'transparent']
                      : ['rgba(59, 130, 246, 0.2)', 'rgba(59, 130, 246, 0.05)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 16,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 14,
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.08)'
                      : 'rgba(59, 130, 246, 0.04)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10, flexDirection: 'row' }}>
                  {/* Left Column */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={isDark ? 'white' : colors.primary}
                      />
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: '600',
                          color: isDark ? 'white' : colors.foreground,
                          marginLeft: 8,
                          ...TEXT_STYLES.semibold,
                        }}>
                        Upcoming Shift
                      </Text>
                    </View>

                    {upcomingShift.shiftType && (
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: '700',
                          color: isDark ? '#fbbf24' : colors.primary,
                          marginBottom: 4,
                          ...TEXT_STYLES.bold,
                        }}>
                        {upcomingShift.shiftType.name}
                      </Text>
                    )}
                  </View>

                  {/* Right Column - Date & Time */}
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? '#e2e8f0' : colors.grey2,
                        marginBottom: 8,
                        textAlign: 'center',
                        ...TEXT_STYLES.medium,
                      }}>
                      {new Date(upcomingShift.date).toDateString()}
                    </Text>
                    {upcomingShift.shiftType && (
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '700',
                          color: isDark ? 'white' : colors.foreground,
                          textAlign: 'center',
                          ...TEXT_STYLES.bold,
                        }}>
                        {upcomingShift.shiftType.startTime} - {upcomingShift.shiftType.endTime}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {/* Clock In/Out Button */}
          <TouchableOpacity
            style={{
              borderRadius: 16,
              marginBottom: 24,
              opacity: clockActionLoading ? 0.7 : 1,
            }}
            onPress={isClockedIn ? handleClockOut : handleClockIn}
            disabled={clockActionLoading || isLoading}>
            <LinearGradient
              colors={isClockedIn ? ['#dc2626', '#991b1b'] : ['#3b82f6', '#1d4ed8']}
              style={{
                paddingVertical: 24,
                paddingHorizontal: 32,
                alignItems: 'center',
                borderRadius: 16,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              {clockActionLoading ? (
                <ActivityIndicator size={24} color="white" />
              ) : (
                <>
                  <Ionicons
                    name={isClockedIn ? 'stop-circle' : 'play-circle'}
                    size={32}
                    color="white"
                    style={{ marginBottom: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: 'white',
                      ...TEXT_STYLES.bold,
                    }}>
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Current Session Info */}
          {isClockedIn && currentEntry && (
            <View style={{ borderRadius: 16, marginBottom: 24 }}>
              <View
                style={{
                  borderRadius: 16,
                  padding: 20,
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
                  borderColor: isDark ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.4)',
                  borderWidth: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay with blue tint */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.15)', 'transparent']
                      : ['rgba(59, 130, 246, 0.3)', 'rgba(59, 130, 246, 0.08)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 16,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 14,
                    backgroundColor: isDark
                      ? 'rgba(59, 130, 246, 0.08)'
                      : 'rgba(59, 130, 246, 0.04)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: isDark ? 'white' : colors.foreground,
                      marginBottom: 12,
                      ...TEXT_STYLES.semibold,
                    }}>
                    Current Session
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDark ? '#e2e8f0' : colors.grey2,
                          marginBottom: 4,
                          ...TEXT_STYLES.regular,
                        }}>
                        Started at
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '500',
                          color: isDark ? 'white' : colors.foreground,
                          ...TEXT_STYLES.medium,
                        }}>
                        {formatDate(currentEntry.clockInTime)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: isDark ? '#e2e8f0' : colors.grey2,
                          marginBottom: 4,
                          ...TEXT_STYLES.regular,
                        }}>
                        Duration
                      </Text>
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: '700',
                          color: isDark ? '#fbbf24' : colors.primary,
                          ...TEXT_STYLES.bold,
                        }}>
                        {currentSessionDisplay}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Work Time Summary */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 24,
            }}>
            <View style={{ flex: 1, borderRadius: 12 }}>
              <View
                style={{
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.08)',
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.25)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay with green tint */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)', 'transparent']
                      : ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 12,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 10,
                    backgroundColor: isDark
                      ? 'rgba(16, 185, 129, 0.08)'
                      : 'rgba(16, 185, 129, 0.04)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? '#a7f3d0' : colors.grey2,
                      marginBottom: 8,
                      ...TEXT_STYLES.regular,
                    }}>
                    Today
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: isDark ? 'white' : colors.foreground,
                      ...TEXT_STYLES.bold,
                    }}>
                    {todayWorkTime.durationDisplay}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flex: 1, borderRadius: 12 }}>
              <View
                style={{
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.08)',
                  borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.25)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay with lighter green tint */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.1)', 'transparent']
                      : ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.05)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 12,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 10,
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.04)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? '#86efac' : colors.grey2,
                      marginBottom: 8,
                      ...TEXT_STYLES.regular,
                    }}>
                    This Week
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: isDark ? 'white' : colors.foreground,
                      ...TEXT_STYLES.bold,
                    }}>
                    {weekWorkTime.durationDisplay}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent Entries */}
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.foreground,
                marginBottom: 16,
                ...TEXT_STYLES.semibold,
              }}>
              Recent Activity
            </Text>

            {recentEntries.length > 0 ? (
              recentEntries.map(renderTimeEntry)
            ) : (
              <View
                style={{
                  borderRadius: 12,
                  padding: 24,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay */}
                <LinearGradient
                  colors={
                    isDark
                      ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
                      : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 12,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    right: 2,
                    bottom: 2,
                    borderRadius: 10,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10, alignItems: 'center' }}>
                  <Ionicons name="time-outline" size={48} color={colors.grey2} />
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.grey2,
                      marginTop: 12,
                      textAlign: 'center',
                      ...TEXT_STYLES.regular,
                    }}>
                    No time entries yet.{'\n'}Clock in to start tracking your time!
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
