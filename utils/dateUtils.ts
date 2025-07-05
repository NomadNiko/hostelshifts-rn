export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    return '';
  }
};

export const formatMessageTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export const formatDate = (dateString: string): string => {
  try {
    // Fix timezone issue by parsing as UTC
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return 'Invalid Date';
  }
};

export const shouldShowTimeGap = (
  currentMessageTime: string,
  previousMessageTime?: string
): boolean => {
  if (!previousMessageTime) return false;

  try {
    const current = new Date(currentMessageTime);
    const previous = new Date(previousMessageTime);
    const diffInMinutes = (current.getTime() - previous.getTime()) / (1000 * 60);
    return diffInMinutes > 5; // 5 minutes gap
  } catch {
    return false;
  }
};

export const formatShiftTime = (timeString: string): string => {
  try {
    if (!timeString) return 'N/A';

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
  } catch {
    return timeString || 'N/A';
  }
};

/**
 * Get Monday-Sunday dates for a given week containing the startDate
 * This matches the exact logic from hostelshifts-client/components/full-schedule-grid.tsx
 */
export const getWeekDatesFromStartDate = (startDateString: string): string[] => {
  try {
    // Parse the start date in UTC to avoid timezone issues
    const dateOnly = startDateString.split('T')[0]; // Get just YYYY-MM-DD part
    const start = new Date(dateOnly + 'T12:00:00.000Z'); // Use noon UTC to avoid timezone shifts

    if (isNaN(start.getTime())) {
      console.error('Invalid start date:', startDateString);
      return [];
    }

    // Since the backend gives us the start date as Monday, just use it directly
    // and generate the week from there
    const startDate = new Date(start);

    // Generate 7 days starting from the given start date (which should be Monday)
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + i);
      const dateString = date.toISOString().split('T')[0];
      weekDates.push(dateString);
    }

    return weekDates;
  } catch {
    console.error('Error generating week dates');
    return [];
  }
};

/**
 * Get day name for a date string
 * Uses UTC to avoid timezone issues
 */
export const getDayName = (dateString: string): string => {
  try {
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      return 'Invalid';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  } catch {
    console.error('Error getting day name');
    return 'Invalid';
  }
};

/**
 * Get the start date (Monday) of the current week
 */
export const getCurrentWeekStartDate = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, otherwise go to Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);

  return monday.toISOString().split('T')[0];
};

/**
 * Get week dates for a given Monday date
 */
export const getWeekDatesFromMonday = (mondayDateString: string): string[] => {
  try {
    const monday = new Date(mondayDateString + 'T00:00:00.000Z');
    if (isNaN(monday.getTime())) {
      return [];
    }

    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setUTCDate(monday.getUTCDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    return weekDates;
  } catch {
    return [];
  }
};

/**
 * Add or subtract weeks from a date
 */
export const addWeeks = (dateString: string, weeks: number): string => {
  try {
    const date = new Date(dateString + 'T00:00:00.000Z');
    if (isNaN(date.getTime())) {
      return dateString;
    }

    date.setUTCDate(date.getUTCDate() + weeks * 7);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
};

/**
 * Format week range for display
 */
export const formatWeekRange = (mondayDateString: string): string => {
  try {
    const monday = new Date(mondayDateString + 'T00:00:00.000Z');
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const mondayFormatted = monday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    const sundayFormatted = sunday.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });

    return `${mondayFormatted} - ${sundayFormatted}`;
  } catch {
    return 'Invalid Week';
  }
};
