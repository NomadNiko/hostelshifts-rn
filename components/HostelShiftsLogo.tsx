import React from 'react';
import { Image } from 'react-native';

interface HostelShiftsLogoProps {
  width?: number;
  height?: number;
}

const HostelShiftsLogo: React.FC<HostelShiftsLogoProps> = ({ 
  width = 160, 
  height = 53 
}) => {
  return (
    <Image
      source={require('../assets/hostel-shifts-grad.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
};

export default HostelShiftsLogo;