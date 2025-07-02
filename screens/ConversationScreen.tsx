import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useConversations } from '../contexts/ConversationsContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

interface ConversationScreenProps {
  conversationId: string;
  onBack: () => void;
}

export default function ConversationScreen({ conversationId, onBack }: ConversationScreenProps) {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const {
    currentConversation,
    messages,
    loadMessages,
    sendMessage,
    sendingMessage,
  } = useConversations();
  
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const colors = isDark ? COLORS.dark : COLORS.light;
  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (conversationId && currentConversation) {
      loadConversationMessages();
    }
  }, [conversationId, currentConversation]);

  const loadConversationMessages = async () => {
    try {
      setIsLoading(true);
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return '';
    }
  };

  const getDisplayName = () => {
    if (!currentConversation) return 'Loading...';
    
    if (currentConversation.name) {
      return currentConversation.name;
    }
    
    if (currentConversation.participants && currentConversation.participants.length > 0) {
      const names = currentConversation.participants
        .map((p) => {
          if (p.firstName && p.lastName) {
            return `${p.firstName} ${p.lastName}`;
          } else if (p.firstName) {
            return p.firstName;
          } else if (p.lastName) {
            return p.lastName;
          } else {
            return p.email;
          }
        })
        .join(', ');
      return names || 'Unknown';
    }
    
    return 'Unknown Conversation';
  };

  if (!currentConversation) {
    return (
      <View className="flex-1 rounded-t" style={{ backgroundColor: colors.background }}>
        <SafeAreaView>
          <View className="flex-row items-center px-6 py-4 rounded-b" style={{ backgroundColor: colors.card }}>
            <TouchableOpacity onPress={onBack} className="mr-4 rounded p-2" style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Loading...
            </Text>
          </View>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center rounded mx-4" style={{ backgroundColor: colors.card + '30' }}>
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
        <View className="flex-row items-center px-6 py-5 border-b rounded-b" style={{ borderBottomColor: colors.grey4, backgroundColor: colors.card }}>
          <TouchableOpacity onPress={onBack} className="mr-4 rounded p-2" style={{ backgroundColor: colors.grey5 }}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              {getDisplayName()}
            </Text>
            <Text className="text-sm" style={{ color: colors.grey2 }}>
              {currentConversation.participants?.length || 0} participant{currentConversation.participants?.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6 rounded-t"
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}>
        
        {isLoading && conversationMessages.length === 0 ? (
          <View className="flex-1 items-center justify-center rounded" style={{ backgroundColor: colors.card + '30' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
              Loading messages...
            </Text>
          </View>
        ) : conversationMessages.length > 0 ? (
          conversationMessages.map((message, index) => {
            const isOwnMessage = user && message.senderId._id === user._id;
            const prevMessage = index > 0 ? conversationMessages[index - 1] : null;
            const nextMessage = index < conversationMessages.length - 1 ? conversationMessages[index + 1] : null;
            
            const showSenderName = !isOwnMessage && (!prevMessage || prevMessage.senderId._id !== message.senderId._id);
            const isLastInGroup = !nextMessage || nextMessage.senderId._id !== message.senderId._id;
            const isFirstInGroup = !prevMessage || prevMessage.senderId._id !== message.senderId._id;
            
            // Calculate time gap for grouping
            const prevTime = prevMessage ? new Date(prevMessage.timestamp) : null;
            const currentTime = new Date(message.timestamp);
            const showTimeGap = prevTime && (currentTime.getTime() - prevTime.getTime()) > 5 * 60 * 1000; // 5 minutes
            
            return (
              <View key={message._id}>
                {/* Time gap separator */}
                {showTimeGap && (
                  <View className="items-center my-6">
                    <View 
                      className="px-4 py-2 rounded"
                      style={{ backgroundColor: colors.grey5 }}>
                      <Text className="text-xs font-medium" style={{ color: colors.grey2 }}>
                        {formatMessageTime(message.timestamp)}
                      </Text>
                    </View>
                  </View>
                )}
                
                <View
                  className={`mb-1 max-w-[85%] ${isOwnMessage ? 'self-end' : 'self-start'}`}
                  style={{ marginBottom: isLastInGroup ? 12 : 2 }}>
                  
                  {/* Sender name for other people's messages */}
                  {showSenderName && (
                    <View className="mb-2 ml-4 px-3 py-1 rounded self-start" style={{ backgroundColor: colors.grey5 }}>
                      <Text className="text-xs font-medium" style={{ color: colors.grey2 }}>
                        {message.senderId.firstName && message.senderId.lastName
                          ? `${message.senderId.firstName} ${message.senderId.lastName}`
                          : message.senderId.firstName || message.senderId.lastName || message.senderId.email}
                      </Text>
                    </View>
                  )}
                  
                  <View className="flex-row items-end">
                    {/* Avatar for other users (only on last message in group) */}
                    {!isOwnMessage && isLastInGroup && (
                      <View 
                        className="rounded mr-3 items-center justify-center mb-1"
                        style={{ 
                          width: 32, 
                          height: 32, 
                          backgroundColor: colors.primary + '20',
                          borderWidth: 2,
                          borderColor: colors.primary + '40',
                        }}>
                        <Text 
                          className="font-semibold text-xs"
                          style={{ color: colors.primary }}>
                          {(message.senderId.firstName || message.senderId.email).charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    {!isOwnMessage && !isLastInGroup && <View style={{ width: 35 }} />}
                    
                    {/* Enhanced Message bubble */}
                    <View
                      className="px-5 py-4 rounded"
                      style={{
                        backgroundColor: isOwnMessage 
                          ? colors.primary
                          : colors.card,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2,
                        borderWidth: isOwnMessage ? 0 : 1,
                        borderColor: colors.grey5,
                        maxWidth: '100%',
                        flex: 1,
                      }}>
                      <Text
                        className="text-base leading-6"
                        style={{
                          color: isOwnMessage ? 'white' : colors.foreground,
                          fontWeight: '400',
                        }}>
                        {message.content}
                      </Text>
                      
                      {/* Message status and timestamp inline */}
                      <View className={`flex-row items-center mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <Text
                          className="text-xs"
                          style={{ 
                            color: isOwnMessage ? 'rgba(255,255,255,0.7)' : colors.grey3,
                            fontSize: 10,
                          }}>
                          {formatMessageTime(message.timestamp)}
                        </Text>
                        
                        {/* Message status indicators for own messages */}
                        {isOwnMessage && (
                          <View className="ml-1 flex-row">
                            <Ionicons 
                              name="checkmark" 
                              size={12} 
                              color="rgba(255,255,255,0.7)" 
                            />
                            <Ionicons 
                              name="checkmark" 
                              size={12} 
                              color="rgba(255,255,255,0.7)" 
                              style={{ marginLeft: -6 }}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center py-16 rounded mx-4" style={{ backgroundColor: colors.card + '30' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.grey2} />
            </View>
            <Text className="mt-6 text-lg font-semibold text-center" style={{ color: colors.foreground }}>
              No Messages Yet
            </Text>
            <Text className="mt-2 text-center px-6" style={{ color: colors.grey2 }}>
              Start the conversation by sending a message below.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Enhanced Message Input */}
      <View 
        className="border-t px-4 py-4 rounded-t" 
        style={{ 
          borderTopColor: colors.grey5, 
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        }}>
        <View className="flex-row items-end">
          {/* Attachment button */}
          <TouchableOpacity
            className="rounded p-3 mr-3 mb-2"
            style={{
              backgroundColor: colors.grey5,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => Alert.alert('Info', 'Attachments coming soon!')}>
            <Ionicons name="add" size={20} color={colors.grey2} />
          </TouchableOpacity>
          
          {/* Message input */}
          <View 
            className="flex-1 rounded px-5 py-3 mr-3"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.grey5,
              borderWidth: 1,
              minHeight: 48,
              maxHeight: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
            }}>
            <TextInput
              className="text-base"
              style={{
                color: colors.foreground,
                flex: 1,
                paddingVertical: Platform.OS === 'android' ? 0 : 8,
                textAlignVertical: Platform.OS === 'android' ? 'center' : 'top',
                minHeight: Platform.OS === 'android' ? 20 : 32,
              }}
              placeholder="Type a message..."
              placeholderTextColor={colors.grey2}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>
          
          {/* Send button */}
          <TouchableOpacity
            className="rounded mb-2"
            style={{
              backgroundColor: messageText.trim() ? colors.primary : colors.grey4,
              width: 52,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: messageText.trim() ? colors.primary : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: messageText.trim() ? 4 : 0,
            }}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sendingMessage}>
            {sendingMessage ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name="send" 
                size={22} 
                color={messageText.trim() ? 'white' : colors.grey2} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}