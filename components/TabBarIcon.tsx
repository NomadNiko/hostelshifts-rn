import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.tabBarIconContainer}>
      {/* Main glass container with backdrop blur effect */}
      <View style={[
        styles.glassContainer,
        {
          backgroundColor: focused 
            ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.25)')
            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)'),
          borderColor: focused 
            ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.6)')
            : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.3)'),
          borderWidth: focused ? 1.5 : 1,
        }
      ]}>
        
        {/* Gloss overlay - top highlight */}
        <LinearGradient
          colors={focused 
            ? (isDark 
                ? ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent'] 
                : ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)', 'transparent'])
            : (isDark 
                ? ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'transparent'] 
                : ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.1)', 'transparent'])
          }
          style={styles.glossOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Lens effect - subtle inner glow */}
        <View style={[
          styles.lensEffect,
          {
            backgroundColor: focused 
              ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)')
              : 'transparent',
          }
        ]} />
        
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons size={24} {...iconProps} />
        </View>
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  tabBarIconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  glassContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    borderRadius: 16,
    opacity: 0.8,
  },
  lensEffect: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 14,
    opacity: 0.3,
  },
  iconContainer: {
    position: 'relative',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    marginBottom: -3,
  },
});
