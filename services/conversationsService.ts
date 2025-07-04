import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

const API_BASE = `${API_CONFIG.baseUrl}${API_CONFIG.apiPath}`;

export interface User {
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

export interface Conversation {
  _id: string;
  participants: User[];
  name?: string;
  lastMessageAt: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateConversationDto {
  participantIds: string[];
  name?: string;
}

export interface SendMessageDto {
  content: string;
}

// Helper function to convert buffer objects to string IDs
const convertBufferToId = (obj: any): string => {
  if (obj && obj.buffer && typeof obj.buffer === 'object') {
    const buffer = obj.buffer;
    const bytes = Object.keys(buffer).map((key) => buffer[key]);
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return obj;
};

// Helper function to clean conversation data
const cleanConversationData = (conversation: any): Conversation => {
  return {
    ...conversation,
    _id: convertBufferToId(conversation._id),
    participants:
      conversation.participants?.map((p: any) => ({
        ...p,
        _id: convertBufferToId(p._id),
      })) || [],
    lastMessage: conversation.lastMessage ? cleanMessageData(conversation.lastMessage) : undefined,
  };
};

// Helper function to clean message data
const cleanMessageData = (message: any): Message => {
  return {
    ...message,
    _id: convertBufferToId(message._id),
    conversationId: convertBufferToId(message.conversationId),
    senderId: {
      ...message.senderId,
      _id: convertBufferToId(message.senderId._id),
    },
  };
};

class ConversationsService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('hostelshifts_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching conversations from:', `${API_BASE}/conversations`);

      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();
      console.log('💬 Raw conversations data from backend:', JSON.stringify(data, null, 2));

      if (Array.isArray(data)) {
        const cleanedConversations = data.map(cleanConversationData);
        console.log('💬 Cleaned conversations:', JSON.stringify(cleanedConversations, null, 2));
        return cleanedConversations;
      }

      return [];
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🔍 Fetching conversation:', conversationId);

      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      const data = await response.json();
      console.log('💬 Raw conversation data:', JSON.stringify(data, null, 2));

      const cleanedConversation = cleanConversationData(data);
      console.log('💬 Cleaned conversation:', JSON.stringify(cleanedConversation, null, 2));
      return cleanedConversation;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<MessagesResponse> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
      console.log('🔍 Fetching messages from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      console.log('📝 Raw messages data:', JSON.stringify(data, null, 2));

      const cleanedMessages = {
        ...data,
        messages: data.messages?.map(cleanMessageData) || [],
      };

      console.log('📝 Cleaned messages:', JSON.stringify(cleanedMessages, null, 2));
      return cleanedMessages;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, messageData: SendMessageDto): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('📤 Sending message to:', conversationId, messageData);

      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();
      console.log('📤 Raw sent message data:', JSON.stringify(data, null, 2));

      const cleanedMessage = cleanMessageData(data);
      console.log('📤 Cleaned sent message:', JSON.stringify(cleanedMessage, null, 2));
      return cleanedMessage;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async createConversation(conversationData: CreateConversationDto): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🆕 Creating conversation:', conversationData);

      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();
      console.log('🆕 Raw created conversation data:', JSON.stringify(data, null, 2));

      const cleanedConversation = cleanConversationData(data);
      console.log('🆕 Cleaned created conversation:', JSON.stringify(cleanedConversation, null, 2));
      return cleanedConversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE}/conversations/users/search?q=${encodeURIComponent(searchTerm)}`;
      console.log('🔍 Searching users:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }

      const data = await response.json();
      console.log('👥 Raw user search data:', JSON.stringify(data, null, 2));

      if (Array.isArray(data)) {
        // Ensure all user IDs are converted from buffer objects to strings
        return data.map((user) => ({
          ...user,
          _id: convertBufferToId(user._id),
        }));
      }

      return [];
    } catch (error) {
      console.error('Search users error:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      console.log('🗑️ Deleting conversation:', conversationId);

      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`);
      }

      console.log('🗑️ Conversation deleted successfully');
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  }
}

export default new ConversationsService();
