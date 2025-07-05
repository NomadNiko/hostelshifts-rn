import { useMemo } from 'react';
import { Message } from '../types/messaging';
import { shouldShowTimeGap } from '../utils/dateUtils';
import {
  shouldShowMessageSender,
  isLastMessageInGroup,
  isFirstMessageInGroup,
} from '../utils/userUtils';

interface MessageDisplayProps {
  message: Message;
  isOwnMessage: boolean;
  showSender: boolean;
  isLastInGroup: boolean;
  isFirstInGroup: boolean;
  showTimeGap: boolean;
}

export const useMessageList = (messages: Message[], currentUserId?: string) => {
  const processedMessages = useMemo((): MessageDisplayProps[] => {
    return messages.map((message, index) => {
      const isOwnMessage =
        currentUserId && message.senderId && message.senderId._id === currentUserId;
      const prevMessage = index > 0 ? messages[index - 1] : null;
      const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

      const showSender = shouldShowMessageSender(message, prevMessage, !!isOwnMessage);
      const isLastInGroup = isLastMessageInGroup(message, nextMessage);
      const isFirstInGroup = isFirstMessageInGroup(message, prevMessage);
      const showTimeGap = shouldShowTimeGap(message.timestamp, prevMessage?.timestamp);

      return {
        message,
        isOwnMessage: !!isOwnMessage,
        showSender,
        isLastInGroup,
        isFirstInGroup,
        showTimeGap,
      };
    });
  }, [messages, currentUserId]);

  return processedMessages;
};
