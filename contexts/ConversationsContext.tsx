import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import conversationsService, { 
  Conversation, 
  Message, 
  MessagesResponse, 
  CreateConversationDto, 
  SendMessageDto,
  User 
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
  searchUsers: (searchTerm: string) => Promise<User[]>;
  refreshData: () => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
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
      console.log('🚀 ConversationsContext: Starting to load conversations...');
      
      const conversationsData = await conversationsService.getConversations();
      console.log('📥 ConversationsContext: Received conversations data:', conversationsData);
      
      // Sort conversations by lastMessageAt (most recent first)
      const sortedConversations = conversationsData.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      setConversations(sortedConversations);
      console.log('✅ ConversationsContext: Conversations loaded successfully');
    } catch (error) {
      console.error('❌ ConversationsContext: Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    console.log('🎯 ConversationsContext: Selecting conversation:', conversation._id);
    setCurrentConversation(conversation);
  };

  const loadMessages = async (conversationId: string, page: number = 1) => {
    try {
      console.log(`📝 ConversationsContext: Loading messages for conversation ${conversationId}, page ${page}`);
      
      const messagesResponse: MessagesResponse = await conversationsService.getMessages(
        conversationId, 
        page, 
        20
      );
      
      console.log('📥 ConversationsContext: Received messages:', messagesResponse);
      
      setMessages(prev => {
        const existingMessages = prev[conversationId] || [];
        // Messages from API are already in chronological order (oldest first)
        // For page 1, replace all messages. For subsequent pages, append to existing
        const newMessages = page === 1 
          ? messagesResponse.messages 
          : [...existingMessages, ...messagesResponse.messages];
        
        return {
          ...prev,
          [conversationId]: newMessages,
        };
      });
      
      setMessagePages(prev => ({
        ...prev,
        [conversationId]: page,
      }));
      
      setHasMoreMessages(prev => ({
        ...prev,
        [conversationId]: messagesResponse.messages.length === messagesResponse.limit,
      }));
      
      console.log('✅ ConversationsContext: Messages loaded successfully');
    } catch (error) {
      console.error('❌ ConversationsContext: Error loading messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    try {
      setSendingMessage(true);
      console.log(`📤 ConversationsContext: Sending message to ${conversationId}:`, content);
      
      const messageData: SendMessageDto = { content };
      const sentMessage = await conversationsService.sendMessage(conversationId, messageData);
      
      console.log('📤 ConversationsContext: Message sent:', sentMessage);
      
      // Add the new message to the end of the messages list (newest at bottom)
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), sentMessage],
      }));
      
      // Update the conversation's lastMessageAt
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, lastMessageAt: sentMessage.timestamp }
            : conv
        ).sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      );
      
      console.log('✅ ConversationsContext: Message sent successfully');
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
      console.log('🆕 ConversationsContext: Creating conversation:', data);
      
      const newConversation = await conversationsService.createConversation(data);
      console.log('🆕 ConversationsContext: Conversation created:', newConversation);
      
      // Add the new conversation to the list
      setConversations(prev => [newConversation, ...prev]);
      
      console.log('✅ ConversationsContext: Conversation created successfully');
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
      console.log('🔍 ConversationsContext: Searching users:', searchTerm);
      
      const users = await conversationsService.searchUsers(searchTerm);
      console.log('👥 ConversationsContext: Users found:', users);
      
      return users;
    } catch (error) {
      console.error('❌ ConversationsContext: Error searching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to search users');
      return [];
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      console.log('🗑️ ConversationsContext: Deleting conversation:', conversationId);
      
      await conversationsService.deleteConversation(conversationId);
      
      // Remove from conversations list
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      
      // Clear messages for this conversation
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });
      
      // Clear current conversation if it's the one being deleted
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
      
      console.log('✅ ConversationsContext: Conversation deleted successfully');
    } catch (error) {
      console.error('❌ ConversationsContext: Error deleting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete conversation');
      throw error;
    }
  };

  const refreshData = async () => {
    await loadConversations();
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
    searchUsers,
    refreshData,
    deleteConversation,
  };

  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
};