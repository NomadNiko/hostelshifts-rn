import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConversationHeaderProps } from '../../types/messaging';
import { createMessagingStyles } from './styles';
import { COLORS } from '../../theme/colors';
import { getConversationDisplayName } from '../../utils/userUtils';

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onBack,
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  const styles = createMessagingStyles(colors, isDark);

  const displayName = getConversationDisplayName(conversation);
  const participantCount = conversation.participants?.length || 0;

  return (
    <View
      className={styles.layout.headerWithBorder}
      style={[{ borderBottomColor: colors.grey4 }, styles.colors.card]}>
      <TouchableOpacity
        onPress={onBack}
        className="mr-4 rounded p-2"
        style={styles.colors.grey5}
        activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </TouchableOpacity>

      <View className="flex-1">
        <Text className="text-xl font-bold" style={styles.colors.textPrimary}>
          {displayName}
        </Text>
        <Text className="text-sm" style={styles.colors.textCaption}>
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );
};

export default ConversationHeader;
