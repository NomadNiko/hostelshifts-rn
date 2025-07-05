import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ConversationHeaderProps } from '../../types/messaging';
import { createMessagingStyles } from './styles';
import { COLORS } from '../../theme/colors';
import { getConversationDisplayName } from '../../utils/userUtils';
import EditConversationTitleModal from '../EditConversationTitleModal';
import AvatarDisplay from '../AvatarDisplay';
import AddParticipantModal from '../AddParticipantModal';
import { useConversations } from '../../contexts/ConversationsContext';

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onBack,
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  const styles = createMessagingStyles(colors, isDark);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const { removeParticipant } = useConversations();

  const participantCount = conversation.participants?.length || 0;
  const isGroupChat = participantCount > 2; // Show participants for any multi-user chat

  // Show "Group Chat" for groups without a title, otherwise use util function
  const displayName =
    isGroupChat && !conversation.title ? 'Group Chat' : getConversationDisplayName(conversation);

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  const handleRemoveParticipant = (participantId: string, participantName: string) => {
    Alert.alert(
      'Remove Participant',
      `Are you sure you want to remove ${participantName} from this conversation?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeParticipant(conversation._id, participantId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove participant');
            }
          },
        },
      ]
    );
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
          <Text className="font-bold text-xl" style={styles.colors.textPrimary}>
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
              name={showParticipants ? 'chevron-up' : 'people'}
              size={24}
              color={colors.foreground}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Participants Dropdown */}
      {isGroupChat && showParticipants && (
        <View className="mx-6 mb-4 rounded-lg p-4" style={{ backgroundColor: colors.grey5 }}>
          <Text className="mb-3 font-semibold" style={{ color: colors.foreground }}>
            Participants
          </Text>
          {conversation.participants?.map((participant, index) => (
            <View
              key={participant._id || index}
              className="mb-2 flex-row items-center justify-between">
              <View className="flex-1 flex-row items-center">
                <View className="mr-3">
                  <AvatarDisplay
                    user={participant}
                    avatarNumber={participant.avatar}
                    size="small"
                  />
                </View>
                <Text style={{ color: colors.foreground }}>
                  {participant.firstName && participant.lastName
                    ? `${participant.firstName} ${participant.lastName}`
                    : participant.email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  handleRemoveParticipant(
                    participant._id,
                    participant.firstName && participant.lastName
                      ? `${participant.firstName} ${participant.lastName}`
                      : participant.email
                  )
                }
                className="p-1"
                activeOpacity={0.7}>
                <Ionicons name="remove-circle" size={20} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add Participant Button */}
          <TouchableOpacity
            className="mt-3 rounded"
            onPress={() => setShowAddParticipantModal(true)}
            activeOpacity={0.7}>
            <LinearGradient
              colors={['#22c55e', '#16a34a']} // Green to dark green gradient
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Ionicons name="person-add" size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Add Participant</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Change Chat Name Button */}
          <TouchableOpacity
            className="mt-3 rounded"
            onPress={() => setShowEditTitleModal(true)}
            activeOpacity={0.7}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']} // Blue to dark blue gradient
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 8,
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Ionicons name="pencil" size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Change Chat Name</Text>
            </LinearGradient>
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

      {/* Add Participant Modal */}
      <AddParticipantModal
        visible={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        conversationId={conversation._id}
        currentParticipants={conversation.participants || []}
      />
    </View>
  );
};

export default ConversationHeader;
