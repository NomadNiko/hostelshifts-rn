import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
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

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  currentParticipants: User[];
}

export default function AddParticipantModal({
  visible,
  onClose,
  conversationId,
  currentParticipants,
}: AddParticipantModalProps) {
  const { isDark } = useTheme();
  const { searchUsers, addParticipant } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

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
      
      // Filter out users who are already participants
      const availableUsers = results.filter(
        user => !currentParticipants.some(participant => participant._id === user._id)
      );
      
      setSearchResults(availableUsers);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddParticipant = async (user: User) => {
    try {
      setIsAdding(true);
      await addParticipant(conversationId, user._id);
      Alert.alert('Success', `${getUserDisplayName(user)} has been added to the conversation!`);
      handleClose();
    } catch (error) {
      console.error('Add participant error:', error);
      Alert.alert('Error', 'Failed to add participant');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setIsAdding(false);
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

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      className="flex-row items-center rounded px-4 py-3"
      style={{
        backgroundColor: colors.card,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.grey4,
      }}
      onPress={() => handleAddParticipant(item)}
      disabled={isAdding}>
      {/* Avatar */}
      <View className="mr-3">
        <AvatarDisplay
          user={item}
          avatarNumber={item.avatar}
          size="medium"
        />
      </View>

      {/* User Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: colors.foreground }}>
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

      {/* Add button */}
      <Ionicons name="add-circle" size={24} color={colors.primary} />
    </TouchableOpacity>
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
            <Text className="text-xl font-bold" style={{ color: colors.foreground }}>
              Add Participant
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

          {/* Search Results */}
          <View className="flex-1 px-6">
            {searchTerm.length < 2 ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="person-add-outline" size={64} color={colors.grey2} />
                <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
                  Type at least 2 characters to search for users
                </Text>
              </View>
            ) : searchResults.length === 0 && !isSearching ? (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="search-outline" size={64} color={colors.grey2} />
                <Text className="mt-4 text-center" style={{ color: colors.grey2 }}>
                  {`No available users found for "${searchTerm}"`}
                </Text>
                <Text className="mt-2 text-center text-sm" style={{ color: colors.grey }}>
                  All matching users are already in this conversation
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

          {/* Loading overlay */}
          {isAdding && (
            <View 
              className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center"
              style={{ backgroundColor: colors.background + '80' }}>
              <LoadingSpinner size={40} color={colors.primary} />
              <Text className="mt-4 text-lg" style={{ color: colors.foreground }}>
                Adding participant...
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}