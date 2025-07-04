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

export interface MessageSender extends User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: number | null;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: MessageSender;
  content: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  name?: string;
  participants: User[];
  lastMessageAt: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationCardProps {
  conversation: Conversation;
  currentUserId?: string;
  onPress: (conversation: Conversation) => void;
  isDark: boolean;
}

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender: boolean;
  isLastInGroup: boolean;
  showTimeGap: boolean;
  isDark: boolean;
}

export interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder?: string;
  isDark: boolean;
}

export interface ConversationHeaderProps {
  conversation: Conversation;
  onBack: () => void;
  isDark: boolean;
}

export interface NewConversationModalProps {
  visible: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export interface CreateConversationDto {
  participantIds: string[];
  name?: string;
}

export interface SendMessageDto {
  content: string;
}

export interface MessagesResponse {
  messages: Message[];
  page: number;
  limit: number;
  total: number;
}
