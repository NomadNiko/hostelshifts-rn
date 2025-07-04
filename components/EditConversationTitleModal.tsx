import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useConversations } from '../contexts/ConversationsContext';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from './LoadingSpinner';
import { TEXT_STYLES } from '../theme/fonts';

interface EditConversationTitleModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  currentTitle?: string;
}

export default function EditConversationTitleModal({
  visible,
  onClose,
  conversationId,
  currentTitle = '',
}: EditConversationTitleModalProps) {
  const { isDark } = useTheme();
  const { updateConversation } = useConversations();
  const [title, setTitle] = useState(currentTitle);
  const [isUpdating, setIsUpdating] = useState(false);

  const colors = isDark ? COLORS.dark : COLORS.light;

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, visible]);

  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateConversation(conversationId, { title: title.trim() });
      onClose();
    } catch (error) {
      console.error('Update title error:', error);
      Alert.alert('Error', 'Failed to update conversation title');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        padding: 24 
      }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
          }}>
          
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 20
          }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: colors.foreground,
                ...TEXT_STYLES.semibold,
              }}>
              Edit Conversation Title
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Title Input */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '500', 
              color: colors.grey2,
              marginBottom: 8,
              ...TEXT_STYLES.medium,
            }}>
              Title
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors.grey4,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.card,
                ...TEXT_STYLES.regular,
              }}
              placeholder="Enter conversation title..."
              placeholderTextColor={colors.grey2}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              autoFocus
            />
            <Text style={{ 
              fontSize: 12, 
              color: colors.grey2, 
              marginTop: 4,
              ...TEXT_STYLES.regular,
            }}>
              Leave empty to use participant names
            </Text>
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.grey4,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
              }}
              onPress={handleClose}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '500', 
                color: colors.foreground,
                ...TEXT_STYLES.medium,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: isUpdating ? 0.7 : 1,
              }}
              onPress={handleSave}
              disabled={isUpdating}>
              {isUpdating ? (
                <LoadingSpinner size={20} color="white" />
              ) : (
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: 'white',
                  ...TEXT_STYLES.semibold,
                }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}