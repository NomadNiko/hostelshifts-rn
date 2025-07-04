import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MessageInputProps } from '../../types/messaging';
import { createMessagingStyles, DIMENSIONS } from './styles';
import { COLORS } from '../../theme/colors';
import LoadingSpinner from '../LoadingSpinner';

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  isSending,
  placeholder = 'Type a message...',
  isDark,
}) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  const styles = createMessagingStyles(colors, isDark);

  const handleAttachment = () => {
    Alert.alert('Info', 'Attachments coming soon!');
  };

  const isEnabled = value.trim() && !isSending;

  return (
    <View
      className="rounded-t border-t px-4 py-4"
      style={[{ borderTopColor: colors.grey5 }, styles.colors.card, styles.shadow.large]}>
      <View className={styles.message.inputContainer}>
        {/* Attachment button */}
        <TouchableOpacity
          className="mb-2 mr-3 rounded p-3"
          style={[
            styles.colors.grey5,
            DIMENSIONS.button.small,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
          onPress={handleAttachment}
          activeOpacity={0.7}>
          <Ionicons name="add" size={20} color={colors.grey2} />
        </TouchableOpacity>

        {/* Message input */}
        <View
          className="mr-3 flex-1 rounded px-5 py-3"
          style={[
            styles.colors.background,
            {
              borderColor: colors.grey5,
              borderWidth: 1,
              minHeight: 48,
              maxHeight: 120,
            },
            styles.shadow.small,
          ]}>
          <TextInput
            className="text-base"
            style={{
              color: colors.foreground,
              flex: 1,
              paddingVertical: Platform.OS === 'android' ? 0 : 8,
              textAlignVertical: Platform.OS === 'android' ? 'center' : 'top',
              minHeight: Platform.OS === 'android' ? 20 : 32,
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.grey2}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={1000}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          className="mb-2 rounded"
          style={[
            {
              backgroundColor: isEnabled ? colors.primary : colors.grey4,
              ...DIMENSIONS.button.large,
              alignItems: 'center',
              justifyContent: 'center',
            },
            isEnabled && {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            },
          ]}
          onPress={onSend}
          disabled={!isEnabled}
          activeOpacity={0.8}>
          {isSending ? (
            <LoadingSpinner size={16} color="white" />
          ) : (
            <Ionicons name="send" size={22} color={isEnabled ? 'white' : colors.grey2} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageInput;
