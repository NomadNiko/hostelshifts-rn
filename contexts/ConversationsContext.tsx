import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import conversationsService, {
  Conversation,
  Message,
  MessagesResponse,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  User,
} from '../services/conversationsService';

interface ConversationsContextType {
  // Conversations state
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;

  // Messages state
  messages: { [conversationId: string]: Message[] };
  messagePages: { [conversationId: string]: number };
  hasMoreMessages: { [conversationId: string]: boolean };
  sendingMessage: boolean;

  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  loadMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (data: CreateConversationDto) => Promise<Conversation>;
  updateConversation: (conversationId: string, data: UpdateConversationDto) => Promise<Conversation>;
  searchUsers: (searchTerm: string) => Promise<User[]>;
  refreshData: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  addParticipant: (conversationId: string, participantId: string) => Promise<Conversation>;
  removeParticipant: (conversationId: string, participantId: string) => Promise<Conversation>;
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(undefined);

export const useConversations = (): ConversationsContextType => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationsProvider');
  }
  return context;
};

interface ConversationsProviderProps {
  children: ReactNode;
}

export const ConversationsProvider: React.FC<ConversationsProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [messagePages, setMessagePages] = useState<{ [conversationId: string]: number }>({});
  const [hasMoreMessages, setHasMoreMessages] = useState<{ [conversationId: string]: boolean }>({});
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const conversationsData = await conversationsService.getConversations();

      // Sort conversations by lastMessageAt (most recent first)
      const sortedConversations = conversationsData.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );

      setConversations(sortedConversations);
    } catch (error) {
      console.error('❌ ConversationsContext: Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const loadMessages = async (conversationId: string, page: number = 1) => {
    try {

      const messagesResponse: MessagesResponse = await conversationsService.getMessages(
        conversationId,
        page,
        20
      );


      setMessages((prev) => {
        const existingMessages = prev[conversationId] || [];
        // Messages from API are already in chronological order (oldest first)
        // For page 1, replace all messages. For subsequent pages, append to existing
        const newMessages =
          page === 1
            ? messagesResponse.messages
            : [...existingMessages, ...messagesResponse.messages];

        return {
          ...prev,
          [conversationId]: newMessages,
        };
      });

      setMessagePages((prev) => ({
        ...prev,
        [conversationId]: page,
      }));

      setHasMoreMessages((prev) => ({
        ...prev,
        [conversationId]: messagesResponse.messages.length === messagesResponse.limit,
      }));

    } catch (error) {
      console.error('❌ ConversationsContext: Error loading messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      setSendingMessage(true);

      const messageData: SendMessageDto = { content };
      const sentMessage = await conversationsService.sendMessage(conversationId, messageData);


      // Add the new message to the end of the messages list (newest at bottom)
      setMessages((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), sentMessage],
      }));

      // Update the conversation's lastMessageAt
      setConversations((prev) =>
        prev
          .map((conv) =>
            conv._id === conversationId ? { ...conv, lastMessageAt: sentMessage.timestamp } : conv
          )
          .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
      );

    } catch (error) {
      console.error('❌ ConversationsContext: Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    } finally {
      setSendingMessage(false);
    }
  };

  const createConversation = async (data: CreateConversationDto): Promise<Conversation> => {
    try {
      setIsLoading(true);

      const newConversation = await conversationsService.createConversation(data);

      // Add the new conversation to the list
      setConversations((prev) => [newConversation, ...prev]);

      return newConversation;
    } catch (error) {
      console.error('❌ ConversationsContext: Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (searchTerm: string): Promise<User[]> => {
    try {

      const users = await conversationsService.searchUsers(searchTerm);

      return users;
    } catch (error) {
      console.error('❌ ConversationsContext: Error searching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to search users');
      return [];
    }
  };

  const updateConversation = async (conversationId: string, data: UpdateConversationDto): Promise<Conversation> => {
    try {
      const updatedConversation = await conversationsService.updateConversation(conversationId, data);

      // Update the conversation in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? updatedConversation : conv
        )
      );

      // Update current conversation if it's the one being updated
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(updatedConversation);
      }

      return updatedConversation;
    } catch (error) {
      console.error('❌ ConversationsContext: Error updating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to update conversation');
      throw error;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {

      await conversationsService.deleteConversation(conversationId);

      // Remove from conversations list
      setConversations((prev) => prev.filter((conv) => conv._id !== conversationId));

      // Clear messages for this conversation
      setMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });

      // Clear current conversation if it's the one being deleted
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }

    } catch (error) {
      console.error('❌ ConversationsContext: Error deleting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete conversation');
      throw error;
    }
  };

  const refreshData = async () => {
    await loadConversations();
  };

  const addParticipant = async (conversationId: string, participantId: string): Promise<Conversation> => {
    try {
      const updatedConversation = await conversationsService.addParticipant(conversationId, participantId);

      // Update the conversation in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? updatedConversation : conv
        )
      );

      // Update current conversation if it's the one being updated
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(updatedConversation);
      }

      // Refresh messages to show the system message
      await loadMessages(conversationId, 1);

      return updatedConversation;
    } catch (error) {
      console.error('❌ ConversationsContext: Error adding participant:', error);
      setError(error instanceof Error ? error.message : 'Failed to add participant');
      throw error;
    }
  };

  const removeParticipant = async (conversationId: string, participantId: string): Promise<Conversation> => {
    try {
      const updatedConversation = await conversationsService.removeParticipant(conversationId, participantId);

      // Update the conversation in the list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? updatedConversation : conv
        )
      );

      // Update current conversation if it's the one being updated
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(updatedConversation);
      }

      return updatedConversation;
    } catch (error) {
      console.error('❌ ConversationsContext: Error removing participant:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove participant');
      throw error;
    }
  };

  // Load conversations when provider mounts
  useEffect(() => {
    loadConversations();
  }, []);

  const value: ConversationsContextType = {
    conversations,
    currentConversation,
    isLoading,
    error,
    messages,
    messagePages,
    hasMoreMessages,
    sendingMessage,
    loadConversations,
    selectConversation,
    loadMessages,
    sendMessage,
    createConversation,
    updateConversation,
    searchUsers,
    refreshData,
    deleteConversation,
    addParticipant,
    removeParticipant,
  };

  return <ConversationsContext.Provider value={value}>{children}</ConversationsContext.Provider>;
};
