import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useConversations } from '../../contexts/ConversationsContext';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../../components/ThemeToggle';
import ConversationScreen from '../../screens/ConversationScreen';
import NewConversationModal from '../../components/NewConversationModal';

export default function ConversationsTab() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const {
    conversations,
    isLoading,
    error,
    refreshData,
    selectConversation,
  } = useConversations();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  const colors = isDark ? COLORS.dark : COLORS.light;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      } else if (diffInHours < 168) { // Less than a week
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    } catch (error) {
      return '';
    }
  };

  const getDisplayName = (conversation: any) => {
    // Debug logging
    console.log('🔍 getDisplayName - conversation:', conversation);
    console.log('🔍 getDisplayName - user:', user);
    console.log('🔍 getDisplayName - participants:', conversation.participants);
    
    // Always show participant names, ignore conversation.name
    if (conversation.participants && conversation.participants.length > 0) {
      // Try filtering out current user, but if that fails, show all participants
      let participantsToShow = conversation.participants.filter((p: any) => p._id !== user?._id);
      
      // If filtering removed everyone or current user ID doesn't match, show all participants
      if (participantsToShow.length === 0) {
        participantsToShow = conversation.participants;
      }
      
      console.log('🔍 getDisplayName - participantsToShow:', participantsToShow);
      
      if (participantsToShow.length === 1) {
        const participant = participantsToShow[0];
        if (participant.firstName && participant.lastName) {
          return `${participant.firstName} ${participant.lastName}`;
        } else if (participant.firstName) {
          return participant.firstName;
        } else if (participant.lastName) {
          return participant.lastName;
        } else if (participant.email) {
          return participant.email;
        } else {
          return 'User';
        }
      } else if (participantsToShow.length > 1) {
        return participantsToShow
          .map((p: any) => {
            if (p.firstName && p.lastName) {
              return `${p.firstName} ${p.lastName}`;
            } else if (p.firstName) {
              return p.firstName;
            } else if (p.lastName) {
              return p.lastName;
            } else if (p.email) {
              return p.email;
            } else {
              return 'User';
            }
          })
          .join(', ');
      }
    }
    
    return 'Unknown Conversation';
  };

  const getConversationAvatar = (conversation: any) => {
    if (conversation.participants && conversation.participants.length > 0) {
      const otherParticipants = conversation.participants.filter((p: any) => p._id !== user?._id);
      if (otherParticipants.length === 1) {
        const participant = otherParticipants[0];
        return (participant.firstName || participant.lastName || participant.email).charAt(0).toUpperCase();
      } else if (otherParticipants.length > 1) {
        return otherParticipants.length.toString();
      }
    }
    return '?';
  };

  const getConversationSubtitle = (conversation: any) => {
    const participantCount = conversation.participants?.length || 0;
    const otherParticipants = conversation.participants?.filter((p: any) => p._id !== user?._id) || [];
    
    if (otherParticipants.length === 1) {
      const participant = otherParticipants[0];
      return participant.role === 'admin' ? 'Admin' : 'Team Member';
    } else if (otherParticipants.length > 1) {
      return `${otherParticipants.length} members`;
    }
    
    return `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
  };

  const handleConversationPress = (conversation: any) => {
    console.log('📱 Opening conversation:', conversation._id);
    selectConversation(conversation);
    setSelectedConversationId(conversation._id);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
  };

  const handleNewConversation = () => {
    setShowNewConversationModal(true);
  };

  const handleConversationCreated = (conversation: any) => {
    // Refresh the conversations list to show the new conversation
    refreshData();
    // Optionally, navigate to the new conversation
    selectConversation(conversation);
    setSelectedConversationId(conversation._id);
  };

  // Show individual conversation if one is selected
  if (selectedConversationId) {
    return (
      <ConversationScreen 
        conversationId={selectedConversationId} 
        onBack={handleBackToList} 
      />
    );
  }

  if (error) {
    return (
      <View className="flex-1 rounded-t" style={{ backgroundColor: colors.background }}>
        <SafeAreaView>
          <View className="flex-row items-center justify-between px-6 py-4">
            <View>
              <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
                Messages
              </Text>
              <Text className="text-sm" style={{ color: colors.grey }}>
                Welcome back, {user?.firstName || user?.email}!
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center p-6 rounded mx-4" style={{ backgroundColor: colors.card + '50' }}>
          <View className="rounded p-6" style={{ backgroundColor: colors.destructive + '20' }}>
            <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          </View>
          <Text className="mt-6 text-lg font-semibold text-center px-4" style={{ color: colors.foreground }}>
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 rounded px-8 py-4"
            style={{ backgroundColor: colors.primary }}
            onPress={onRefresh}>
            <Text className="font-semibold text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 rounded-t" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <SafeAreaView>
        <View className="flex-row items-center justify-between px-6 py-4">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.foreground }}>
              Messages
            </Text>
            <Text className="text-sm" style={{ color: colors.grey }}>
              Welcome back, {user?.firstName || user?.email}!
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              className="rounded p-3"
              style={{ backgroundColor: colors.primary }}
              onPress={handleNewConversation}>
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1 rounded-t"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        
        {/* Conversations List */}
        {conversations.length > 0 ? (
          <View className="px-4 pt-4">
            {conversations.map((conversation, index) => (
              <TouchableOpacity
                key={conversation._id}
                className="mb-3 rounded px-5 py-5"
                style={{
                  backgroundColor: colors.card,
                  shadowColor: isDark ? '#000' : '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.3 : 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                onPress={() => handleConversationPress(conversation)}>
                <View className="flex-row items-center">
                  {/* Enhanced Avatar */}
                  <View className="relative mr-4">
                    <View 
                      className="rounded items-center justify-center"
                      style={{ 
                        width: 56, 
                        height: 56, 
                        backgroundColor: colors.primary + '15',
                        borderWidth: 2,
                        borderColor: colors.primary + '30',
                      }}>
                      <Text 
                        className="font-bold text-xl"
                        style={{ color: colors.primary }}>
                        {getConversationAvatar(conversation)}
                      </Text>
                    </View>
                    {/* Online status indicator - placeholder for future implementation */}
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
                    <View className="flex-row items-start justify-between mb-3">
                      <Text 
                        className="font-bold text-2xl flex-1" 
                        style={{ color: colors.foreground }}
                        numberOfLines={2}>
                        {getDisplayName(conversation)}
                      </Text>
                      <Text 
                        className="text-xs font-medium ml-3 mt-1" 
                        style={{ color: colors.grey2 }}>
                        {formatTime(conversation.lastMessageAt)}
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center justify-between">
                      <Text 
                        className="text-sm flex-1 font-medium" 
                        style={{ color: colors.grey }}
                        numberOfLines={1}>
                        {getConversationSubtitle(conversation)}
                      </Text>
                      
                      {/* Message count badge - placeholder for unread messages */}
                      <View className="flex-row items-center">
                        <View 
                          className="rounded px-3 py-1 ml-2"
                          style={{ 
                            backgroundColor: colors.primary,
                            minWidth: 24,
                            minHeight: 24,
                          }}>
                          <Text 
                            className="text-xs font-bold text-center"
                            style={{ color: 'white' }}>
                            2
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : !isLoading ? (
          <View className="flex-1 items-center justify-center p-6 rounded mx-4" style={{ backgroundColor: colors.card + '50' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.grey2} />
            </View>
            <Text className="mt-6 text-lg font-semibold text-center" style={{ color: colors.foreground }}>
              No Conversations Yet
            </Text>
            <Text className="mt-2 text-center px-4" style={{ color: colors.grey2 }}>
              Start a conversation with your team members to see them here.
            </Text>
            <TouchableOpacity
              className="mt-6 rounded px-8 py-4"
              style={{ backgroundColor: colors.primary }}
              onPress={handleNewConversation}>
              <Text className="font-semibold text-white">Start Conversation</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Loading State */}
        {isLoading && conversations.length === 0 && (
          <View className="flex-1 items-center justify-center p-6 rounded mx-4" style={{ backgroundColor: colors.card + '30' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
            <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
              Loading conversations...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* New Conversation Modal */}
      <NewConversationModal
        visible={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onConversationCreated={handleConversationCreated}
      />
    </View>
  );
}