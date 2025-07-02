import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../../components/ThemeToggle';

export default function SchedulesScreen() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const {
    schedules,
    currentSchedule,
    scheduleShifts,
    isLoading,
    error,
    refreshData,
    setCurrentSchedule,
    publishSchedule,
  } = useSchedules();
  const [refreshing, setRefreshing] = useState(false);

  const colors = isDark ? COLORS.dark : COLORS.light;

  // Color mapping for shift types (based on colorIndex from backend)
  const getColorForIndex = (colorIndex: number) => {
    const colorMap = [
      '#ef4444', // red
      '#f97316', // orange  
      '#eab308', // yellow
      '#22c55e', // green
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#6b7280', // gray
    ];
    return colorMap[colorIndex] || '#6b7280'; // default to gray
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handlePublishSchedule = async (scheduleId: string) => {
    Alert.alert(
      'Publish Schedule',
      'Are you sure you want to publish this schedule? This will lock all shifts and allow time tracking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          style: 'default',
          onPress: async () => {
            try {
              await publishSchedule(scheduleId);
              Alert.alert('Success', 'Schedule has been published successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to publish schedule. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      console.log('🗓️ formatDate input:', dateString);
      const date = new Date(dateString);
      console.log('🗓️ Date object:', date);
      console.log('🗓️ Date.getTime():', date.getTime());
      if (isNaN(date.getTime())) {
        console.warn('🗓️ Invalid date detected:', dateString);
        return 'Invalid Date';
      }
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      console.log('🗓️ Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('🗓️ Date formatting error:', error, 'for input:', dateString);
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'N/A';
      // Handle both HH:MM and HH:MM:SS formats
      const timeParts = timeString.split(':');
      if (timeParts.length < 2) return timeString;
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) return timeString;
      
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return timeString || 'N/A';
    }
  };

  const getShiftsForDate = (date: string) => {
    const shifts = scheduleShifts.filter(shift => {
      // Backend returns full ISO date strings like "2025-06-30T00:00:00.000Z"
      // We need to compare just the date part
      const shiftDate = shift.date ? shift.date.split('T')[0] : '';
      return shiftDate === date;
    });

    // Sort by start time first, then by shift type name
    return shifts.sort((a, b) => {
      // Primary sort: start time
      const timeA = a.shiftType?.startTime || '00:00';
      const timeB = b.shiftType?.startTime || '00:00';
      
      if (timeA !== timeB) {
        return timeA.localeCompare(timeB);
      }
      
      // Secondary sort: shift type name
      const nameA = a.shiftType?.name || '';
      const nameB = b.shiftType?.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const getCurrentWeekDates = () => {
    console.log('📅 getCurrentWeekDates - currentSchedule:', currentSchedule);
    if (!currentSchedule || !currentSchedule.startDate) {
      console.log('📅 No current schedule or startDate');
      return [];
    }
    
    try {
      console.log('📅 startDate value:', currentSchedule.startDate);
      const start = new Date(currentSchedule.startDate);
      console.log('📅 start date object:', start);
      if (isNaN(start.getTime())) {
        console.log('📅 Invalid start date');
        return [];
      }
      
      const dates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        if (!isNaN(date.getTime())) {
          const dateString = date.toISOString().split('T')[0];
          dates.push(dateString);
          console.log(`📅 Day ${i}: ${dateString}`);
        }
      }
      
      console.log('📅 Generated week dates:', dates);
      return dates;
    } catch (error) {
      console.error('📅 Error generating week dates:', error);
      return [];
    }
  };

  const getDayName = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid';
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } catch (error) {
      return 'Invalid';
    }
  };

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Schedules
            </Text>
            <ThemeToggle />
          </View>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          <Text className="mt-4 text-lg font-semibold text-center" style={{ color: colors.foreground }}>
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 rounded-lg px-6 py-3"
            style={{ backgroundColor: colors.primary }}
            onPress={onRefresh}>
            <Text className="font-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-6 py-4">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Schedules
            </Text>
            <Text className="text-sm" style={{ color: colors.grey }}>
              Welcome back, {user?.firstName || user?.email}!
            </Text>
          </View>
          <ThemeToggle />
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Schedule Selector */}
        {schedules.length > 0 && (
          <View className="px-6 pb-4">
            <Text className="mb-3 text-lg font-semibold" style={{ color: colors.foreground }}>
              Select Week
            </Text>
            
            {/* Compact Schedule Toggles */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row space-x-2">
                {schedules.map((schedule) => (
                  <TouchableOpacity
                    key={schedule.id}
                    className={`rounded-md border px-3 py-1.5 ${
                      currentSchedule?.id === schedule.id ? 'border-opacity-100' : 'border-opacity-30'
                    }`}
                    style={{
                      borderColor: currentSchedule?.id === schedule.id ? colors.primary : colors.grey4,
                      backgroundColor: currentSchedule?.id === schedule.id ? colors.primary + '15' : 'transparent',
                    }}
                    onPress={() => setCurrentSchedule(schedule)}>
                    <Text 
                      className={`text-xs font-medium ${
                        currentSchedule?.id === schedule.id ? 'font-semibold' : ''
                      }`} 
                      style={{ 
                        color: currentSchedule?.id === schedule.id ? colors.primary : colors.grey 
                      }}>
                      {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Schedule Info Panel */}
            {currentSchedule && (
              <View 
                className="mt-3 rounded-lg border p-3"
                style={{ backgroundColor: colors.card, borderColor: colors.grey4 }}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.foreground }}>
                      {currentSchedule.name}
                    </Text>
                    <View className="mt-1 flex-row items-center">
                      <View
                        className="mr-2 h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: currentSchedule.status.toLowerCase() === 'published' ? colors.success : colors.warning,
                        }}
                      />
                      <Text className="text-xs font-medium" style={{ color: colors.grey2 }}>
                        {currentSchedule.status.toUpperCase()}
                      </Text>
                      {currentSchedule.createdBy && (
                        <>
                          <Text className="mx-2 text-xs" style={{ color: colors.grey2 }}>•</Text>
                          <Text className="text-xs" style={{ color: colors.grey2 }}>
                            Created by {currentSchedule.createdBy.firstName} {currentSchedule.createdBy.lastName}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  {currentSchedule.status.toLowerCase() === 'draft' && (
                    <TouchableOpacity
                      className="ml-3 rounded-lg px-3 py-1.5"
                      style={{ backgroundColor: colors.primary }}
                      onPress={() => handlePublishSchedule(currentSchedule.id)}>
                      <Text className="text-xs font-semibold text-white">Publish</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Current Schedule Details */}
        {currentSchedule && (
          <View className="px-6 pb-6">
            <Text className="text-lg font-semibold mb-4" style={{ color: colors.foreground }}>
              Week Schedule
            </Text>

            {/* Weekly View */}
            <View className="space-y-3">
              {getCurrentWeekDates().map((date) => {
                const dayShifts = getShiftsForDate(date);
                return (
                  <View
                    key={date}
                    className="rounded-lg border p-4"
                    style={{ backgroundColor: colors.card, borderColor: colors.grey4 }}>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-semibold" style={{ color: colors.foreground }}>
                        {getDayName(date)} {formatDate(date)}
                      </Text>
                      <Text className="text-sm" style={{ color: colors.grey2 }}>
                        {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
                      </Text>
                    </View>

                    {dayShifts.length > 0 ? (
                      <View className="space-y-2">
                        {dayShifts.map((shift) => (
                          <View
                            key={shift.id}
                            className="flex-row items-center justify-between rounded-lg p-3"
                            style={{ backgroundColor: colors.background }}>
                            <View className="flex-1">
                              <Text className="font-medium" style={{ color: colors.foreground }}>
                                {shift.shiftType?.name || 'Shift'}
                              </Text>
                              <Text className="text-sm" style={{ color: colors.grey2 }}>
                                {formatTime(shift.shiftType?.startTime)} - {formatTime(shift.shiftType?.endTime)}
                              </Text>
                              {shift.user && (
                                <Text className="text-sm" style={{ color: colors.grey }}>
                                  Assigned: {shift.user.firstName} {shift.user.lastName}
                                </Text>
                              )}
                            </View>
                            {shift.shiftType?.colorIndex !== undefined && (
                              <View
                                className="h-4 w-4 rounded-full"
                                style={{ 
                                  backgroundColor: getColorForIndex(shift.shiftType.colorIndex)
                                }}
                              />
                            )}
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-center text-sm" style={{ color: colors.grey2 }}>
                        No shifts scheduled
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && schedules.length === 0 && (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="calendar-outline" size={64} color={colors.grey2} />
            <Text className="mt-4 text-lg font-semibold text-center" style={{ color: colors.foreground }}>
              No Schedules Found
            </Text>
            <Text className="mt-2 text-center" style={{ color: colors.grey2 }}>
              Ask your manager to create a schedule or check back later.
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && schedules.length === 0 && (
          <View className="flex-1 items-center justify-center p-6">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
              Loading schedules...
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
