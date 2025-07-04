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
import LoadingSpinner from '../../components/LoadingSpinner';
import { useMessagingStyles } from '../../hooks/useMessagingStyles';
import { Conversation } from '../../types/messaging';
import { TEXT_STYLES } from '../../theme/fonts';

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
        {/* Fixed Header */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
            <View className="flex-row items-center justify-between px-6 pb-4">
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground, ...TEXT_STYLES.bold }}>
                  Messages
                </Text>
                <Text className="text-sm" style={{ color: colors.grey, ...TEXT_STYLES.regular }}>
                  Welcome back, {user?.firstName || user?.email}!
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
        
        <View
          className="mx-4 flex-1 items-center justify-center rounded p-6"
          style={{ backgroundColor: colors.card + '50', marginTop: 160 }}>
          <View className="rounded p-6" style={{ backgroundColor: colors.destructive + '20' }}>
            <Ionicons name="alert-circle" size={48} color={colors.destructive} />
          </View>
          <Text
            className="mt-6 px-4 text-center text-lg font-semibold"
            style={{ color: colors.foreground, ...TEXT_STYLES.semibold }}>
            {error}
          </Text>
          <TouchableOpacity
            className="mt-6 rounded px-8 py-4"
            style={{ backgroundColor: colors.primary }}
            onPress={onRefresh}>
            <Text style={{ ...TEXT_STYLES.semibold, color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 rounded-t" style={{ backgroundColor: colors.background }}>
        {/* Fixed Header */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
            <View className="flex-row items-center justify-between px-6 pb-4">
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.foreground, ...TEXT_STYLES.bold }}>
                  Messages
                </Text>
                <Text className="text-sm" style={{ color: colors.grey, ...TEXT_STYLES.regular }}>
                  Welcome back, {user?.firstName || user?.email}!
                </Text>
              </View>
              <TouchableOpacity
                className="rounded p-3"
                style={{ backgroundColor: colors.primary }}
                onPress={handleNewConversation}>
                <Ionicons name="add" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView
          className="flex-1 rounded-t"
          contentContainerStyle={{ paddingTop: 120, paddingBottom: 20 }}
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
                style={{ color: colors.foreground, ...TEXT_STYLES.semibold }}>
                No Conversations Yet
              </Text>
              <Text className="mt-2 px-4 text-center" style={{ color: colors.grey2, ...TEXT_STYLES.regular }}>
                Start a conversation with your team members to see them here.
              </Text>
              <TouchableOpacity
                className="mt-6 rounded px-8 py-4"
                style={{ backgroundColor: colors.primary }}
                onPress={handleNewConversation}>
                <Text style={{ ...TEXT_STYLES.semibold, color: 'white' }}>Start Conversation</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        {/* New Conversation Modal */}
        <NewConversationModal
          visible={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onConversationCreated={handleConversationCreated}
        />
      </View>
      
      {/* Full Screen Loading Overlay */}
      {isLoading && conversations.length === 0 && (
        <LoadingSpinner size={100} color={colors.primary} />
      )}
    </>
  );
}
