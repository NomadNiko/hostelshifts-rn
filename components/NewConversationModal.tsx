import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useConversations } from '../contexts/ConversationsContext';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AvatarDisplay from './AvatarDisplay';
import LoadingSpinner from './LoadingSpinner';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: number | null;
  role?: {
    id: string | number;
    _id?: string;
    name?: string;
  };
}

interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: any) => void;
}

export default function NewConversationModal({
  visible,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const { isDark } = useTheme();
  const { searchUsers, createConversation } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const colors = isDark ? COLORS.dark : COLORS.light;

  const handleSearch = async (term: string) => {
    setSearchTerm(term);

    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchUsers(term.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u._id === user._id);
      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one user');
      return;
    }

    try {
      setIsCreating(true);
      const participantIds = selectedUsers.map((user) => user._id);
      const conversationData: any = { participantIds };

      // Add title if provided
      if (conversationTitle.trim()) {
        conversationData.title = conversationTitle.trim();
      }

      const conversation = await createConversation(conversationData);

      onConversationCreated(conversation);
      handleClose();
    } catch (error) {
      console.error('Create conversation error:', error);
      Alert.alert('Error', 'Failed to create conversation');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSelectedUsers([]);
    setConversationTitle('');
    setIsSearching(false);
    setIsCreating(false);
    onClose();
  };

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.lastName) {
      return user.lastName;
    } else {
      return user.email;
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.find((u) => u._id === item._id);

    return (
      <TouchableOpacity
        className="flex-row items-center rounded px-4 py-3"
        style={{
          backgroundColor: isSelected ? colors.primary + '20' : colors.card,
          marginBottom: 8,
          borderWidth: isSelected ? 1 : 0,
          borderColor: colors.primary,
        }}
        onPress={() => toggleUserSelection(item)}>
        {/* Avatar */}
        <View className="mr-3">
          <AvatarDisplay user={item} avatarNumber={item.avatar} size="medium" />
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text className="font-semibold text-base" style={{ color: colors.foreground }}>
            {getUserDisplayName(item)}
          </Text>
          <Text className="text-sm" style={{ color: colors.grey2 }}>
            {item.email}
          </Text>
          {item.role?.name && (
            <Text className="text-xs" style={{ color: colors.grey }}>
              {item.role.name}
            </Text>
          )}
        </View>

        {/* Selection indicator */}
        {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item }: { item: User }) => (
    <View
      className="mb-2 mr-2 flex-row items-center rounded px-3 py-2"
      style={{ backgroundColor: colors.primary + '20' }}>
      <View className="mr-2">
        <AvatarDisplay user={item} avatarNumber={item.avatar} size="small" />
      </View>
      <Text className="mr-2 font-medium text-sm" style={{ color: colors.primary }}>
        {getUserDisplayName(item)}
      </Text>
      <TouchableOpacity onPress={() => toggleUserSelection(item)}>
        <Ionicons name="close" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View
            className="flex-row items-center justify-between border-b px-6 py-4"
            style={{ borderBottomColor: colors.grey4 }}>
            <Text className="font-bold text-xl" style={{ color: colors.foreground }}>
              New Conversation
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View className="px-6 py-4">
            <View
              className="flex-row items-center rounded px-4 py-3"
              style={{ backgroundColor: colors.card, borderColor: colors.grey4, borderWidth: 1 }}>
              <Ionicons name="search" size={20} color={colors.grey2} />
              <TextInput
                className="ml-3 flex-1 text-base"
                style={{ color: colors.foreground }}
                placeholder="Search users by name or email..."
                placeholderTextColor={colors.grey2}
                value={searchTerm}
                onChangeText={handleSearch}
                autoFocus
                keyboardAppearance={isDark ? 'dark' : 'light'}
              />
              {isSearching && <LoadingSpinner size={16} color={colors.primary} />}
            </View>
          </View>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <View className="px-6 pb-4">
              <Text className="mb-2 font-medium text-sm" style={{ color: colors.grey2 }}>
                Selected ({selectedUsers.length})
              </Text>
              <FlatList
                horizontal
                data={selectedUsers}
                renderItem={renderSelectedUser}
                keyExtractor={(item) => item._id}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Conversation Title */}
          {selectedUsers.length > 0 && (
            <View className="px-6 pb-4">
              <Text className="mb-2 font-medium text-sm" style={{ color: colors.grey2 }}>
                Conversation Title (Optional)
              </Text>
              <TextInput
                className="rounded px-4 py-3 text-base"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.grey4,
                  borderWidth: 1,
                  color: colors.foreground,
                }}
                placeholder="Enter a title for this conversation..."
                placeholderTextColor={colors.grey2}
                value={conversationTitle}
                onChangeText={setConversationTitle}
                maxLength={50}
                keyboardAppearance={isDark ? 'dark' : 'light'}
              />
            </View>
          )}

          {/* Search Results */}
          <View className="flex-1 px-6">
            {searchTerm.length < 2 ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="people-outline" size={64} color={colors.grey2} />
                <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
                  Type at least 2 characters to search for users
                </Text>
              </View>
            ) : searchResults.length === 0 && !isSearching ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={64} color={colors.grey2} />
                <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
                  {`No users found for "${searchTerm}"`}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              />
            )}
          </View>

          {/* Create Button */}
          {selectedUsers.length > 0 && (
            <View className="border-t px-6 py-4" style={{ borderTopColor: colors.grey4 }}>
              <TouchableOpacity
                className="rounded py-4"
                style={{
                  backgroundColor: colors.primary,
                  opacity: isCreating ? 0.7 : 1,
                }}
                onPress={handleCreateConversation}
                disabled={isCreating}>
                {isCreating ? (
                  <LoadingSpinner size={20} color="white" />
                ) : (
                  <Text className="text-center font-semibold text-white">
                    Create Conversation with {selectedUsers.length} user
                    {selectedUsers.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
