import React from 'react';
import { router } from 'expo-router';
import TimeClockScreen from '../../screens/TimeClockScreen';

export default function TimeClockTab() {
  const handleBack = () => {
    router.back();
  };

  return <TimeClockScreen onBack={handleBack} />;
}