import React, { useState } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { useSchedules } from '../../contexts/SchedulesContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../../components/ThemeToggle';
import WeekDayHeader from '../../components/WeekDayHeader';
import DayScheduleCard from '../../components/DayScheduleCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getWeekDatesFromStartDate,
  formatDate,
  getDayName,
  getCurrentWeekStartDate,
  getWeekDatesFromMonday,
  addWeeks,
  formatWeekRange,
} from '../../utils/dateUtils';

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
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(getCurrentWeekStartDate());
  const [scheduleView, setScheduleView] = useState<'my' | 'full'>('full');

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
            } catch {
              Alert.alert('Error', 'Failed to publish schedule. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getShiftsForDate = (date: string) => {
    const shifts = scheduleShifts.filter((shift) => {
      const shiftDate = shift.date ? shift.date.split('T')[0] : '';
      return shiftDate === date;
    });

    return shifts.sort((a, b) => {
      const timeA = a.shiftType?.startTime || '00:00';
      const timeB = b.shiftType?.startTime || '00:00';

      if (timeA !== timeB) {
        return timeA.localeCompare(timeB);
      }

      const nameA = a.shiftType?.name || '';
      const nameB = b.shiftType?.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  // Navigation functions
  const goToPreviousWeek = () => {
    setSelectedWeekStart((prev) => addWeeks(prev, -1));
    setSelectedDayFilter(null); // Clear day filter when changing weeks
  };

  const goToNextWeek = () => {
    setSelectedWeekStart((prev) => addWeeks(prev, 1));
    setSelectedDayFilter(null); // Clear day filter when changing weeks
  };

  // Find schedule for the selected week
  const getScheduleForWeek = (weekStartDate: string) => {
    return schedules.find((schedule) => {
      const scheduleStart = schedule.startDate.split('T')[0];
      return scheduleStart === weekStartDate;
    });
  };

  const weekSchedule = getScheduleForWeek(selectedWeekStart);

  // Load shifts when week schedule changes
  React.useEffect(() => {
    if (weekSchedule && weekSchedule.id !== currentSchedule?.id) {
      setCurrentSchedule(weekSchedule);
    }
  }, [weekSchedule, currentSchedule, setCurrentSchedule]);

  // Get week dates for the selected week
  const getCurrentWeekDates = () => {
    return getWeekDatesFromMonday(selectedWeekStart);
  };

  const toggleDayFilter = (targetDate: string) => {
    if (selectedDayFilter === targetDate) {
      // If already selected, clear the filter to show all days
      setSelectedDayFilter(null);
    } else {
      // Set the filter to show only this day
      setSelectedDayFilter(targetDate);
    }
  };

  const weekDates = getCurrentWeekDates();

  // Get shifts based on the selected week's schedule
  const getShiftsForSelectedWeek = (date: string) => {
    if (!weekSchedule) return [];

    // Use the scheduleShifts from context (they should be loaded for the current weekSchedule)
    let shifts = scheduleShifts.filter((shift) => {
      const shiftDate = shift.date ? shift.date.split('T')[0] : '';
      return shiftDate === date;
    });

    // Filter based on schedule view
    if (scheduleView === 'my') {
      console.log('DEBUG: Current user ID:', user?._id);
      console.log('DEBUG: Sample shift user object:', JSON.stringify(shifts[0]?.user, null, 2));

      shifts = shifts.filter((shift) => {
        // Try different possible user ID fields
        const userId = shift.user?._id || shift.user?.id;
        const match = shift.user && userId === user?._id;
        console.log(
          'DEBUG: Shift user:',
          { _id: shift.user?._id, id: shift.user?.id, firstName: shift.user?.firstName },
          'Match:',
          match
        );
        return match;
      });

      console.log('DEBUG: Filtered shifts:', shifts.length);
    }

    return shifts.sort((a, b) => {
      const timeA = a.shiftType?.startTime || '00:00';
      const timeB = b.shiftType?.startTime || '00:00';

      if (timeA !== timeB) {
        return timeA.localeCompare(timeB);
      }

      const nameA = a.shiftType?.name || '';
      const nameB = b.shiftType?.name || '';
      return nameA.localeCompare(nameB);
    });
  };

  const daysWithShifts = weekDates.filter((date) => getShiftsForSelectedWeek(date).length > 0);

  // Filter days based on selected filter
  const filteredDaysWithShifts = selectedDayFilter
    ? daysWithShifts.filter((date) => date === selectedDayFilter)
    : daysWithShifts;

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-between px-6 pb-4">
            <View>
              <Text className="font-bold text-2xl" style={{ color: colors.foreground }}>
                Schedules
              </Text>
              <Text className="text-sm" style={{ color: colors.grey }}>
                Welcome back, {user?.firstName || user?.email}!
              </Text>
            </View>
          </View>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          <Text
            className="mt-4 text-center font-semibold text-lg"
            style={{ color: colors.foreground }}>
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
      <SafeAreaView edges={['top']}>
        <View className="flex-row items-center justify-between px-6 pb-4">
          <View>
            <Text className="font-bold text-2xl" style={{ color: colors.foreground }}>
              Schedules
            </Text>
            <Text className="text-sm" style={{ color: colors.grey }}>
              Welcome back, {user?.firstName || user?.email}!
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Week Selector */}
        <View className="px-6 pb-4">
          <Text className="mb-3 font-semibold text-lg" style={{ color: colors.foreground }}>
            Week View
          </Text>

          {/* Week Navigation */}
          <View
            style={{
              borderRadius: 12,
              padding: 12,
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
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
            <View
              style={{
                position: 'relative',
                zIndex: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flex: 1,
              }}>
              <TouchableOpacity
                className="rounded p-2"
                style={{ backgroundColor: colors.background }}
                onPress={goToPreviousWeek}>
                <Ionicons name="chevron-back" size={24} color={colors.foreground} />
              </TouchableOpacity>

              <View className="flex-1 items-center">
                <Text className="font-bold text-lg" style={{ color: colors.foreground }}>
                  {formatWeekRange(selectedWeekStart)}
                </Text>
                {weekSchedule ? (
                  <View className="mt-1 flex-row items-center">
                    <View
                      className="mr-2 h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          weekSchedule.status.toLowerCase() === 'published'
                            ? colors.success
                            : colors.warning,
                      }}
                    />
                    <Text className="font-medium text-xs" style={{ color: colors.grey2 }}>
                      {weekSchedule.status.toUpperCase()} • {weekSchedule.name}
                    </Text>
                  </View>
                ) : (
                  <Text className="mt-1 text-sm" style={{ color: colors.grey2 }}>
                    No schedule posted for this week
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="rounded p-2"
                style={{ backgroundColor: colors.background }}
                onPress={goToNextWeek}>
                <Ionicons name="chevron-forward" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Publish Button */}
          {weekSchedule && weekSchedule.status.toLowerCase() === 'draft' && (
            <TouchableOpacity
              className="mt-3 rounded-lg py-3"
              style={{ backgroundColor: colors.primary }}
              onPress={() => handlePublishSchedule(weekSchedule.id)}>
              <Text className="text-center font-semibold text-white">Publish Schedule</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule View Toggle */}
        <View className="px-6 py-4">
          <View
            style={{
              borderRadius: 12,
              padding: 4,
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
              flexDirection: 'row',
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
            <View style={{ position: 'relative', zIndex: 10, flexDirection: 'row', flex: 1 }}>
              <TouchableOpacity
                className="flex-1 rounded-md py-2"
                style={{
                  backgroundColor: scheduleView === 'my' ? colors.primary : 'transparent',
                }}
                onPress={() => setScheduleView('my')}>
                <Text
                  className="text-center font-semibold"
                  style={{
                    color: scheduleView === 'my' ? 'white' : colors.grey2,
                  }}>
                  My Schedule
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-md py-2"
                style={{
                  backgroundColor: scheduleView === 'full' ? colors.primary : 'transparent',
                }}
                onPress={() => setScheduleView('full')}>
                <Text
                  className="text-center font-semibold"
                  style={{
                    color: scheduleView === 'full' ? 'white' : colors.grey2,
                  }}>
                  Full Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Schedule Content */}
        {weekSchedule ? (
          <>
            {/* Day Navigation Header */}
            <View
              className="px-6 py-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.20)',
                borderBottomColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
                borderBottomWidth: 1,
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
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                  opacity: 0.3,
                }}
              />
              {/* Content */}
              <View style={{ position: 'relative', zIndex: 10 }}>
                <View className="mb-3">
                  <Text className="font-semibold text-lg" style={{ color: colors.foreground }}>
                    {selectedDayFilter
                      ? `${getDayName(selectedDayFilter)} ${scheduleView === 'my' ? 'My' : 'Full'} Schedule`
                      : `${scheduleView === 'my' ? 'My' : 'Full'} Week Schedule`}
                  </Text>
                  {selectedDayFilter && (
                    <Text className="mt-1 text-sm" style={{ color: colors.grey2 }}>
                      Tap the green day button again to show all days
                    </Text>
                  )}
                </View>
                <WeekDayHeader
                  weekDates={weekDates}
                  getShiftsForDate={getShiftsForSelectedWeek}
                  selectedDayFilter={selectedDayFilter}
                  onDayToggle={toggleDayFilter}
                  colors={colors}
                />
              </View>
            </View>

            <View className="px-6 pb-6 pt-4">
              {/* Weekly View */}
              {filteredDaysWithShifts.length > 0 ? (
                <View>
                  {filteredDaysWithShifts.map((date) => {
                    const dayShifts = getShiftsForSelectedWeek(date);
                    return (
                      <View key={date} style={{ marginBottom: 6 }}>
                        <DayScheduleCard
                          date={date}
                          shifts={dayShifts}
                          colors={colors}
                          getColorForIndex={getColorForIndex}
                        />
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View className="items-center justify-center p-6" style={{ marginTop: 50 }}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text
                    className="mt-4 text-center font-semibold text-lg"
                    style={{ color: colors.foreground }}>
                    Schedules Loading...
                  </Text>
                  <Text className="mt-2 text-center" style={{ color: colors.grey2 }}>
                    Please wait while we load the schedule data.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : null}

        {/* Empty State */}
        {!isLoading && schedules.length === 0 && (
          <View className="flex-1 items-center justify-center p-6">
            <Ionicons name="calendar-outline" size={64} color={colors.grey2} />
            <Text
              className="mt-4 text-center font-semibold text-lg"
              style={{ color: colors.foreground }}>
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
            <LoadingSpinner size={48} color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
