import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversations } from '../../contexts/ConversationsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ThemeToggle from '../../components/ThemeToggle';
import ConversationScreen from '../../screens/ConversationScreen';
import NewConversationModal from '../../components/NewConversationModal';
import ConversationCard from '../../components/messaging/ConversationCard';
import { useMessagingStyles } from '../../hooks/useMessagingStyles';
import { Conversation } from '../../types/messaging';

export default function ConversationsTab() {
  const { user } = useAuth();
  const { conversations, isLoading, error, refreshData, selectConversation } = useConversations();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  const { colors, isDark } = useMessagingStyles();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
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

  const handleConversationCreated = (conversation: Conversation) => {
    // Refresh the conversations list to show the new conversation
    refreshData();
    // Optionally, navigate to the new conversation
    selectConversation(conversation);
    setSelectedConversationId(conversation._id);
  };

  // Show individual conversation if one is selected
  if (selectedConversationId) {
    return <ConversationScreen conversationId={selectedConversationId} onBack={handleBackToList} />;
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
        <View
          className="mx-4 flex-1 items-center justify-center rounded p-6"
          style={{ backgroundColor: colors.card + '50' }}>
          <View className="rounded p-6" style={{ backgroundColor: colors.destructive + '20' }}>
            <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          </View>
          <Text
            className="mt-6 px-4 text-center text-lg font-semibold"
            style={{ color: colors.foreground }}>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Conversations List */}
        {conversations.length > 0 ? (
          <View className="px-4 pt-4">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation._id}
                conversation={conversation}
                currentUserId={user?._id}
                onPress={handleConversationPress}
                isDark={isDark}
              />
            ))}
          </View>
        ) : !isLoading ? (
          <View
            className="mx-4 flex-1 items-center justify-center rounded p-6"
            style={{ backgroundColor: colors.card + '50' }}>
            <View className="rounded p-6" style={{ backgroundColor: colors.grey5 }}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.grey2} />
            </View>
            <Text
              className="mt-6 text-center text-lg font-semibold"
              style={{ color: colors.foreground }}>
              No Conversations Yet
            </Text>
            <Text className="mt-2 px-4 text-center" style={{ color: colors.grey2 }}>
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
          <View
            className="mx-4 flex-1 items-center justify-center rounded p-6"
            style={{ backgroundColor: colors.card + '30' }}>
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
