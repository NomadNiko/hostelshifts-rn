import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversations } from '../contexts/ConversationsContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ConversationHeader from '../components/messaging/ConversationHeader';
import MessageBubble from '../components/messaging/MessageBubble';
import MessageInput from '../components/messaging/MessageInput';
import { useMessagingStyles } from '../hooks/useMessagingStyles';
import { useMessageList } from '../hooks/useMessageList';

interface ConversationScreenProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const { user } = useAuth();
  const { currentConversation, messages, loadMessages, sendMessage, sendingMessage } =
    useConversations();

  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { colors, isDark } = useMessagingStyles();
  const conversationMessages = messages[conversationId] || [];
  const processedMessages = useMessageList(conversationMessages, user?._id);

  useEffect(() => {
    if (conversationId && currentConversation) {
      loadConversationMessages();
    }
  }, [conversationId, currentConversation, loadConversationMessages]);

  const loadConversationMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendingMessage) return;

    const content = messageText.trim();
    setMessageText('');

    try {
      await sendMessage(conversationId, content);
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      // Restore message text on error
      setMessageText(content);
    }
  };

  if (!currentConversation) {
    return (
      <View className="flex-1 rounded-t" style={{ backgroundColor: colors.background }}>
        <SafeAreaView>
          <View
            className="flex-row items-center rounded-b px-6 py-4"
            style={{ backgroundColor: colors.card }}>
            <TouchableOpacity
              onPress={onBack}
              className="mr-4 rounded p-2"
              style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Loading...
            </Text>
          </View>
        </SafeAreaView>
        <View
          className="mx-4 flex-1 items-center justify-center rounded"
          style={{ backgroundColor: colors.card + '30' }}>
          <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 rounded-t"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Header */}
      <SafeAreaView>
        <ConversationHeader conversation={currentConversation} onBack={onBack} isDark={isDark} />
      </SafeAreaView>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 rounded-t px-6"
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
        {isLoading && conversationMessages.length === 0 ? (
          <View
            className="flex-1 items-center justify-center rounded"
            style={{ backgroundColor: colors.card + '30' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
              Loading messages...
            </Text>
          </View>
        ) : processedMessages.length > 0 ? (
          processedMessages.map(
            ({ message, isOwnMessage, showSender, isLastInGroup, showTimeGap }) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwnMessage={isOwnMessage}
                showSender={showSender}
                isLastInGroup={isLastInGroup}
                showTimeGap={showTimeGap}
                isDark={isDark}
              />
            )
          )
        ) : (
          <View
            className="mx-4 flex-1 items-center justify-center rounded py-16"
            style={{ backgroundColor: colors.card + '30' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.grey2} />
            </View>
            <Text
              className="mt-6 text-center text-lg font-semibold"
              style={{ color: colors.foreground }}>
              No Messages Yet
            </Text>
            <Text className="mt-2 px-6 text-center" style={{ color: colors.grey2 }}>
              Start the conversation by sending a message below.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Message Input */}
      <MessageInput
        value={messageText}
        onChangeText={setMessageText}
        onSend={handleSendMessage}
        isSending={sendingMessage}
        isDark={isDark}
      />
    </KeyboardAvoidingView>
  );
}
