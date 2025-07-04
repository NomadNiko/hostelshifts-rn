import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../theme/colors';

export const TabBarIcon = (props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused?: boolean;
}) => {
  const { isDark } = useTheme();
  const colors = isDark ? COLORS.dark : COLORS.light;
  const { focused, ...iconProps } = props;
  
  return (
    <View style={[
      styles.tabBarIconContainer,
      {
        backgroundColor: focused 
          ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
          : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
        borderColor: focused 
          ? (isDark ? colors.grey2 : colors.grey)
          : (isDark ? colors.grey4 : colors.grey3),
        borderWidth: focused ? 2 : 1,
      }
    ]}>
      <Ionicons size={24} {...iconProps} />
    </View>
  );
};

export const styles = StyleSheet.create({
  tabBarIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  tabBarIcon: {
    marginBottom: -3,
  },
});
