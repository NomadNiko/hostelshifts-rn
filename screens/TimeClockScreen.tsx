import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeClock } from '../contexts/TimeClockContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';
import { TEXT_STYLES } from '../theme/fonts';
import { Ionicons } from '@expo/vector-icons';
import { TimeClockEntry, TimeClockStatus } from '../services/timeClockService';

interface TimeClockScreenProps {
  onBack: () => void;
}

export default function TimeClockScreen({ onBack }: TimeClockScreenProps) {
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

  const colors = isDark ? COLORS.dark : COLORS.light;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshStatus(), loadRecentEntries(), loadWorkTimeSummaries()]);
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
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.grey5,
      }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.grey5,
          backgroundColor: colors.card,
        }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.grey5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.foreground,
            ...TEXT_STYLES.bold,
          }}>
          Time Clock
        </Text>

        <TouchableOpacity
          onPress={onRefresh}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.grey5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size={20} color={colors.foreground} />
          ) : (
            <Ionicons name="refresh" size={24} color={colors.foreground} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Welcome Section */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.grey5,
          }}>
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

        {/* Clock In/Out Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isClockedIn ? colors.destructive : colors.primary,
            borderRadius: 16,
            paddingVertical: 24,
            paddingHorizontal: 32,
            alignItems: 'center',
            marginBottom: 24,
            opacity: clockActionLoading ? 0.7 : 1,
          }}
          onPress={isClockedIn ? handleClockOut : handleClockIn}
          disabled={clockActionLoading || isLoading}>
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
        </TouchableOpacity>

        {/* Current Session Info */}
        {isClockedIn && currentEntry && (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 2,
              borderColor: colors.primary,
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.foreground,
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
                    color: colors.grey2,
                    marginBottom: 4,
                    ...TEXT_STYLES.regular,
                  }}>
                  Started at
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: colors.foreground,
                    ...TEXT_STYLES.medium,
                  }}>
                  {formatDate(currentEntry.clockInTime)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.grey2,
                    marginBottom: 4,
                    ...TEXT_STYLES.regular,
                  }}>
                  Duration
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.primary,
                    ...TEXT_STYLES.bold,
                  }}>
                  {currentSessionDisplay}
                </Text>
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
          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.grey5,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.grey2,
                marginBottom: 8,
                ...TEXT_STYLES.regular,
              }}>
              Today
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.foreground,
                ...TEXT_STYLES.bold,
              }}>
              {todayWorkTime.durationDisplay}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: colors.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.grey5,
            }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.grey2,
                marginBottom: 8,
                ...TEXT_STYLES.regular,
              }}>
              This Week
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.foreground,
                ...TEXT_STYLES.bold,
              }}>
              {weekWorkTime.durationDisplay}
            </Text>
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
                backgroundColor: colors.card,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.grey5,
              }}>
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
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
