import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const messagePrefix = isOwnMessage
    ? 'You: '
    : `${conversation.lastMessage?.senderId.firstName || 'User'}: `;
  const displayPreview = conversation.lastMessage
    ? `${messagePrefix}${messagePreview}`
    : messagePreview;

  return (
    <TouchableOpacity
      className="mb-2 rounded"
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}>
      <View
        style={{
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: isDark ? 'rgba(30, 58, 138, 0.15)' : 'rgba(30, 58, 138, 0.08)',
          borderColor: isDark ? 'rgba(30, 58, 138, 0.4)' : 'rgba(30, 58, 138, 0.3)',
          borderWidth: 1.5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          overflow: 'hidden',
          position: 'relative',
        }}>
        {/* Gloss overlay with blue tint */}
        <LinearGradient
          colors={
            isDark
              ? ['rgba(30, 58, 138, 0.4)', 'rgba(30, 58, 138, 0.15)', 'transparent']
              : ['rgba(30, 58, 138, 0.3)', 'rgba(30, 58, 138, 0.08)', 'transparent']
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
            backgroundColor: isDark ? 'rgba(30, 58, 138, 0.08)' : 'rgba(30, 58, 138, 0.04)',
            opacity: 0.3,
          }}
        />
        {/* Content */}
        <View style={{ position: 'relative', zIndex: 10 }}>
          <View className="flex-row items-center">
            {/* Avatar */}
            <View className="relative mr-3">
              <AvatarDisplay
                user={primaryParticipant}
                avatarNumber={primaryParticipant?.avatar}
                size="medium"
              />

              {/* Online status indicator - placeholder */}
              <View
                className="absolute -bottom-1 -right-1 rounded border-2"
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: '#10B981', // Green for online
                  borderColor: colors.card,
                }}
              />
            </View>

            {/* Conversation Info */}
            <View className="flex-1 justify-center">
              <View className="mb-2 flex-row items-start justify-between">
                <Text
                  className="flex-1 font-bold text-2xl"
                  style={{ color: isDark ? 'white' : 'black' }}
                  numberOfLines={2}>
                  {displayName}
                </Text>
                <Text
                  className="ml-3 mt-1 font-medium text-xs"
                  style={{ color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)' }}>
                  {timeText}
                </Text>
              </View>

              <Text
                className="text-sm"
                style={{ color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.7)' }}
                numberOfLines={2}>
                {displayPreview}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ConversationCard;
