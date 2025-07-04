import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConversationHeaderProps } from '../../types/messaging';
import { createMessagingStyles } from './styles';
import { COLORS } from '../../theme/colors';
import { getConversationDisplayName } from '../../utils/userUtils';
import EditConversationTitleModal from '../EditConversationTitleModal';

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onBack,
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  const styles = createMessagingStyles(colors, isDark);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);

  const participantCount = conversation.participants?.length || 0;
  const isGroupChat = participantCount > 3;
  
  // Show "Group Chat" for groups >3 people without a title, otherwise use util function
  const displayName = isGroupChat && !conversation.title 
    ? "Group Chat" 
    : getConversationDisplayName(conversation);

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  return (
    <View style={styles.colors.card}>
      <View className="flex-row items-center justify-between px-6 pb-4">
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

        {isGroupChat && (
          <TouchableOpacity
            onPress={toggleParticipants}
            className="rounded p-2"
            style={styles.colors.grey5}
            activeOpacity={0.7}>
            <Ionicons 
              name={showParticipants ? "chevron-up" : "people"} 
              size={24} 
              color={colors.foreground} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Participants Dropdown */}
      {isGroupChat && showParticipants && (
        <View 
          className="mx-6 mb-4 rounded-lg p-4"
          style={{ backgroundColor: colors.grey5 }}>
          <Text className="mb-3 font-semibold" style={{ color: colors.foreground }}>
            Participants
          </Text>
          {conversation.participants?.map((participant, index) => (
            <View key={participant._id || index} className="mb-2 flex-row items-center">
              <View 
                className="mr-3 h-8 w-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}>
                <Text className="text-sm font-bold text-white">
                  {(participant.firstName?.[0] || participant.email?.[0] || '?').toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: colors.foreground }}>
                {participant.firstName && participant.lastName 
                  ? `${participant.firstName} ${participant.lastName}`
                  : participant.email}
              </Text>
            </View>
          ))}
          
          {/* Edit Title Button */}
          <TouchableOpacity
            className="mt-3 flex-row items-center justify-center rounded py-3"
            style={{ backgroundColor: colors.primary + '20', borderColor: colors.primary, borderWidth: 1 }}
            onPress={() => setShowEditTitleModal(true)}
            activeOpacity={0.7}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text className="ml-2 font-medium" style={{ color: colors.primary }}>
              Edit Conversation Title
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Edit Title Modal */}
      <EditConversationTitleModal
        visible={showEditTitleModal}
        onClose={() => setShowEditTitleModal(false)}
        conversationId={conversation._id}
        currentTitle={conversation.title}
      />
    </View>
  );
};

export default ConversationHeader;
