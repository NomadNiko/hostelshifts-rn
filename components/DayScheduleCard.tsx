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
      className="rounded-lg border p-4"
      style={{ backgroundColor: colors.card, borderColor: colors.grey4 }}>
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
          const shiftColor = shift.shiftType?.colorIndex !== undefined 
            ? getColorForIndex(shift.shiftType.colorIndex) 
            : colors.background;
          
          return (
            <LinearGradient
              key={shift.id}
              colors={[
                shiftColor + '30', // 30% opacity for gradient start
                shiftColor + '10', // 10% opacity for gradient end
              ]}
              style={{
                borderRadius: 8,
                marginBottom: 4,
                borderWidth: 1,
                borderColor: shiftColor + '40', // 40% opacity border
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              
              <View className="flex-row items-center justify-between p-3">
                {/* Left column - Shift details */}
                <View className="flex-1 pr-3">
                  <Text className="text-sm font-medium" style={{ color: colors.foreground }}>
                    {shift.shiftType?.name || 'Shift'}
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: colors.foreground }}>
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
                        className="mt-1 text-right text-lg font-bold" 
                        style={{ color: colors.foreground }}
                        numberOfLines={1}>
                        {shift.user.firstName} {shift.user.lastName}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-sm font-medium text-right" style={{ color: colors.destructive }}>
                      Unassigned
                    </Text>
                  )}
                </View>
              </View>
            </LinearGradient>
          );
        })}
      </View>
    </View>
  );
}