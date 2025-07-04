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
  title?: string;
  lastMessageAt: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId?: User; // Optional for system messages
  content: string;
  timestamp: string;
  type?: 'user' | 'system'; // Added type field
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
  title?: string;
}

export interface UpdateConversationDto {
  title?: string;
}

export interface SendMessageDto {
  content: string;
}

// Helper function to convert buffer objects to string IDs
const convertBufferToId = (obj: any): string => {
  if (!obj) {
    return '';
  }
  
  if (obj && obj.buffer && typeof obj.buffer === 'object') {
    try {
      const buffer = obj.buffer;
      const bytes = Object.keys(buffer).map((key) => buffer[key]);
      return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('⚠️ Error converting buffer to ID:', error);
      return String(obj);
    }
  }
  
  // If it's already a string, return it
  if (typeof obj === 'string') {
    return obj;
  }
  
  // Try to convert to string
  try {
    return String(obj);
  } catch (error) {
    console.warn('⚠️ Error converting object to string:', error);
    return '';
  }
};

// Helper function to clean conversation data
const cleanConversationData = (conversation: any): Conversation => {
  if (!conversation) {
    throw new Error('Conversation data is null or undefined');
  }

  return {
    ...conversation,
    _id: convertBufferToId(conversation._id),
    // Map server's 'name' field to client's 'title' field
    title: conversation.name,
    participants:
      conversation.participants?.map((p: any) => {
        if (!p || !p._id) {
          console.warn('⚠️ Found participant without _id, skipping');
          return null;
        }
        return {
          ...p,
          _id: convertBufferToId(p._id),
        };
      }).filter(Boolean) || [],
    lastMessage: conversation.lastMessage ? cleanMessageData(conversation.lastMessage) : undefined,
  };
};

// Helper function to clean message data
const cleanMessageData = (message: any): Message => {
  return {
    ...message,
    _id: convertBufferToId(message._id),
    conversationId: convertBufferToId(message.conversationId),
    senderId: message.senderId ? {
      ...message.senderId,
      _id: convertBufferToId(message.senderId._id),
    } : undefined,
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

      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const cleanedConversations = data.map(cleanConversationData);
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

      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch conversation: ${response.status}`);
      }

      const data = await response.json();

      const cleanedConversation = cleanConversationData(data);
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

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      const cleanedMessages = {
        ...data,
        messages: data.messages?.map(cleanMessageData) || [],
      };

      return cleanedMessages;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, messageData: SendMessageDto): Promise<Message> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const data = await response.json();

      const cleanedMessage = cleanMessageData(data);
      return cleanedMessage;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  async createConversation(conversationData: CreateConversationDto): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();

      // Map title to name for server compatibility, but keep title for client use
      const serverData = {
        participantIds: conversationData.participantIds,
        name: conversationData.title || conversationData.name,
      };

      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(serverData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();

      const cleanedConversation = cleanConversationData(data);
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

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }

      const data = await response.json();

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

      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.status}`);
      }

    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  }

  async updateConversation(conversationId: string, updateData: UpdateConversationDto): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();

      // Map title to name for server compatibility
      const serverUpdateData = {
        name: updateData.title,
      };

      const response = await fetch(`${API_BASE}/conversations/${conversationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(serverUpdateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.status}`);
      }

      const data = await response.json();
      const cleanedConversation = cleanConversationData(data);
      return cleanedConversation;
    } catch (error) {
      console.error('Update conversation error:', error);
      throw error;
    }
  }

  async addParticipant(conversationId: string, participantId: string): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE}/conversations/${conversationId}/participants`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ participantId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Service: Add participant error response:', errorText);
        throw new Error(`Failed to add participant: ${response.status}`);
      }

      const data = await response.json();
      const cleanedConversation = cleanConversationData(data);
      return cleanedConversation;
    } catch (error) {
      console.error('Add participant error:', error);
      throw error;
    }
  }

  async removeParticipant(conversationId: string, participantId: string): Promise<Conversation> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE}/conversations/${conversationId}/participants/${participantId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Service: Remove participant error response:', errorText);
        throw new Error(`Failed to remove participant: ${response.status}`);
      }

      const data = await response.json();
      const cleanedConversation = cleanConversationData(data);
      return cleanedConversation;
    } catch (error) {
      console.error('Remove participant error:', error);
      throw error;
    }
  }
}

export default new ConversationsService();
