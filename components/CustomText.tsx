import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { TEXT_STYLES } from '../theme/fonts';

interface CustomTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

const CustomText: React.FC<CustomTextProps> = ({ weight = 'regular', style, ...props }) => {
  return <RNText style={[TEXT_STYLES[weight], style]} {...props} />;
};

export default CustomText;
