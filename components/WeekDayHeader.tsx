/**
 * WeekDayHeader Component
 *
 * Single responsibility: Display the day navigation buttons for the week
 * KISS: Simple interface, takes week dates and callback
 * YAGNI: Only what's needed for day selection
 */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getDayName } from '../utils/dateUtils';

interface WeekDayHeaderProps {
  /** Array of week dates in YYYY-MM-DD format (Monday-Sunday) */
  weekDates: string[];
  /** Function to get shifts for a specific date */
  getShiftsForDate: (date: string) => any[];
  /** Currently selected day filter (null means show all days) */
  selectedDayFilter: string | null;
  /** Callback when a day is selected/deselected */
  onDayToggle: (date: string) => void;
  /** Color scheme object */
  colors: any;
}

export default function WeekDayHeader({
  weekDates,
  getShiftsForDate,
  selectedDayFilter,
  onDayToggle,
  colors,
}: WeekDayHeaderProps) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          gap: 8,
        }}>
        {weekDates.map((date, index) => {
          const hasShifts = getShiftsForDate(date).length > 0;
          const dayName = getDayName(date).substring(0, 1); // First letter only
          // Fix timezone issue by parsing as UTC
          const dayNumber = new Date(date + 'T00:00:00.000Z').getUTCDate();
          const isSelected = selectedDayFilter === date;

          // Check if this date is today
          const today = new Date().toISOString().split('T')[0];
          const isToday = date === today;

          return (
            <TouchableOpacity
              key={date}
              className="items-center justify-center rounded-full"
              style={{
                width: 44, // Smaller button
                height: 44, // Smaller button
                backgroundColor: hasShifts ? colors.primary : colors.grey5,
                opacity: selectedDayFilter === null ? (hasShifts ? 1 : 0.5) : isSelected ? 1 : 0.3,
                borderWidth: isSelected ? 2 : isToday ? 2 : 0, // Thinner yellow ring
                borderColor: isSelected ? colors.background : isToday ? '#fbbf24' : 'transparent', // Yellow ring for today
              }}
              onPress={() => hasShifts && onDayToggle(date)}
              disabled={!hasShifts}
              activeOpacity={0.7}>
              <Text
                className="font-bold text-base" // Even larger font
                style={{ color: hasShifts ? 'white' : colors.grey3 }}>
                {dayName}
              </Text>
              <Text
                className="font-semibold text-base" // Even larger font
                style={{ color: hasShifts ? 'white' : colors.grey3 }}>
                {dayNumber}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
