/**
 * DayScheduleCard Component
 *
 * Single responsibility: Display shifts for a single day
 * KISS: Simple card layout with shift list
 * YAGNI: Only displays shift data, no editing
 */
import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDate, getDayName, formatShiftTime } from '../utils/dateUtils';
import type { ScheduleShift } from '../services/schedulesService';
import AvatarDisplay from './AvatarDisplay';

interface DayScheduleCardProps {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Array of shifts for this day */
  shifts: ScheduleShift[];
  /** Color scheme object */
  colors: any;
  /** Function to get color for shift type color index */
  getColorForIndex: (colorIndex: number) => string;
}

export default function DayScheduleCard({
  date,
  shifts,
  colors,
  getColorForIndex,
}: DayScheduleCardProps) {
  return (
    <View
      style={{
        borderRadius: 12,
        padding: 16,
        backgroundColor:
          colors.background === '#ffffff' ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.08)',
        borderColor:
          colors.background === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
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
          colors.background === '#ffffff'
            ? ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
            : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
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
          backgroundColor:
            colors.background === '#ffffff' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          opacity: 0.3,
        }}
      />
      {/* Content */}
      <View style={{ position: 'relative', zIndex: 10 }}>
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-semibold" style={{ color: colors.foreground }}>
            {getDayName(date)} {formatDate(date)}
          </Text>
          <Text className="text-sm" style={{ color: colors.grey2 }}>
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View className="space-y-1">
          {shifts.map((shift) => {
            const shiftColor =
              shift.shiftType?.colorIndex !== undefined
                ? getColorForIndex(shift.shiftType.colorIndex)
                : colors.background;

            // Convert hex to RGB for better color tinting
            const hexToRgb = (hex: string) => {
              const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
              return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                  }
                : null;
            };

            const rgb = hexToRgb(shiftColor);
            const isDark = colors.background !== '#ffffff';

            return (
              <View
                key={shift.id}
                style={{
                  borderRadius: 8,
                  marginBottom: 4,
                  backgroundColor: rgb
                    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.15 : 0.08})`
                    : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(255,255,255,0.20)',
                  borderColor: rgb
                    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.4 : 0.3})`
                    : isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(255,255,255,0.4)',
                  borderWidth: 1,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 2,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                {/* Gloss overlay with color tint */}
                <LinearGradient
                  colors={
                    rgb
                      ? [
                          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.3 : 0.2})`,
                          `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.1 : 0.05})`,
                          'transparent',
                        ]
                      : isDark
                        ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)', 'transparent']
                        : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent']
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '60%',
                    borderRadius: 8,
                    opacity: 0.8,
                  }}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
                {/* Lens effect */}
                <View
                  style={{
                    position: 'absolute',
                    top: 1,
                    left: 1,
                    right: 1,
                    bottom: 1,
                    borderRadius: 7,
                    backgroundColor: rgb
                      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${isDark ? 0.08 : 0.04})`
                      : isDark
                        ? 'rgba(255,255,255,0.03)'
                        : 'rgba(255,255,255,0.06)',
                    opacity: 0.3,
                  }}
                />
                {/* Content */}
                <View style={{ position: 'relative', zIndex: 10 }}>
                  <View className="flex-row items-center justify-between p-3">
                    {/* Left column - Shift details */}
                    <View className="flex-1 pr-3">
                      <Text className="font-medium text-sm" style={{ color: colors.foreground }}>
                        {shift.shiftType?.name || 'Shift'}
                      </Text>
                      <Text className="font-semibold text-lg" style={{ color: colors.foreground }}>
                        {formatShiftTime(shift.shiftType?.startTime || '')} -{' '}
                        {formatShiftTime(shift.shiftType?.endTime || '')}
                      </Text>
                    </View>

                    {/* Right column - User */}
                    <View className="items-end">
                      {shift.user ? (
                        <>
                          <AvatarDisplay
                            user={shift.user}
                            avatarNumber={shift.user.avatar}
                            size="medium"
                          />
                          <Text
                            className="mt-1 text-right font-bold text-lg"
                            style={{ color: colors.foreground }}
                            numberOfLines={1}>
                            {shift.user.firstName} {shift.user.lastName}
                          </Text>
                        </>
                      ) : (
                        <Text
                          className="text-right font-medium text-sm"
                          style={{ color: colors.destructive }}>
                          Unassigned
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
