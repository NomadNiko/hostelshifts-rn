import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ConversationCardProps } from '../../types/messaging';
import { COLORS } from '../../theme/colors';
import { formatTime } from '../../utils/dateUtils';
import {
  getConversationDisplayName,
  getConversationSubtitle,
  getConversationPrimaryParticipant,
} from '../../utils/userUtils';
import AvatarDisplay from '../AvatarDisplay';

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  currentUserId,
  onPress,
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const primaryParticipant = getConversationPrimaryParticipant(conversation, currentUserId);
  const subtitle = getConversationSubtitle(conversation, currentUserId);
  const timeText = formatTime(conversation.lastMessageAt);
  
  // Get message preview
  const messagePreview = conversation.lastMessage?.content || 'No messages yet';
  const isOwnMessage = conversation.lastMessage?.senderId._id === currentUserId;
  const messagePrefix = isOwnMessage ? 'You: ' : `${conversation.lastMessage?.senderId.firstName || 'User'}: `;
  const displayPreview = conversation.lastMessage ? `${messagePrefix}${messagePreview}` : messagePreview;

  return (
    <TouchableOpacity
      className="mb-3 rounded px-5 py-5"
      style={{
        backgroundColor: colors.card,
        shadowColor: isDark ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 3,
        elevation: 2,
      }}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}>
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="relative mr-4">
          <AvatarDisplay
            user={primaryParticipant}
            avatarNumber={primaryParticipant?.avatar}
            size="medium"
          />

          {/* Online status indicator - placeholder */}
          <View
            className="absolute -bottom-1 -right-1 rounded border-2"
            style={{
              width: 18,
              height: 18,
              backgroundColor: '#10B981', // Green for online
              borderColor: colors.card,
            }}
          />
        </View>

        {/* Conversation Info */}
        <View className="flex-1 justify-center">
          <View className="mb-3 flex-row items-start justify-between">
            <Text
              className="flex-1 text-2xl font-bold"
              style={{ color: colors.foreground }}
              numberOfLines={2}>
              {displayName}
            </Text>
            <Text className="ml-3 mt-1 text-xs font-medium" style={{ color: colors.grey2 }}>
              {timeText}
            </Text>
          </View>

          <Text
            className="text-sm"
            style={{ color: colors.grey }}
            numberOfLines={2}>
            {displayPreview}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationCard;
