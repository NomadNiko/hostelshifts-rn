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

type Participant = User;

interface Conversation {
  _id: string;
  name?: string;
  participants: Participant[];
  lastMessageAt: string;
}

export const getUserDisplayName = (user: User): string => {
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

export const getUserInitials = (user: User): string => {
  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

export const getConversationDisplayName = (
  conversation: Conversation,
  currentUserId?: string
): string => {
  // Always show participant names, ignore conversation.name
  if (conversation.participants && conversation.participants.length > 0) {
    // Try filtering out current user, but if that fails, show all participants
    let participantsToShow = conversation.participants.filter(
      (p: Participant) => p._id !== currentUserId
    );

    // If filtering removed everyone or current user ID doesn't match, show all participants
    if (participantsToShow.length === 0) {
      participantsToShow = conversation.participants;
    }

    if (participantsToShow.length === 1) {
      return getUserDisplayName(participantsToShow[0]);
    } else if (participantsToShow.length > 1) {
      return participantsToShow.map((p: Participant) => getUserDisplayName(p)).join(', ');
    }
  }

  return 'Unknown Conversation';
};

export const getConversationAvatar = (
  conversation: Conversation,
  currentUserId?: string
): string => {
  if (conversation.participants && conversation.participants.length > 0) {
    const otherParticipants = conversation.participants.filter(
      (p: Participant) => p._id !== currentUserId
    );

    if (otherParticipants.length === 1) {
      return getUserInitials(otherParticipants[0]);
    } else if (otherParticipants.length > 1) {
      return otherParticipants.length.toString();
    }
  }
  return '?';
};

export const getConversationSubtitle = (
  conversation: Conversation,
  currentUserId?: string
): string => {
  const participantCount = conversation.participants?.length || 0;
  const otherParticipants =
    conversation.participants?.filter((p: Participant) => p._id !== currentUserId) || [];

  if (otherParticipants.length === 1) {
    const participant = otherParticipants[0];
    return participant.role?.name === 'admin' ? 'Admin' : 'Team Member';
  } else if (otherParticipants.length > 1) {
    return `${otherParticipants.length} members`;
  }

  return `${participantCount} participant${participantCount !== 1 ? 's' : ''}`;
};

export const shouldShowMessageSender = (
  currentMessage: { senderId: { _id: string } },
  previousMessage: { senderId: { _id: string } } | null,
  isOwnMessage: boolean
): boolean => {
  return (
    !isOwnMessage &&
    (!previousMessage || previousMessage.senderId._id !== currentMessage.senderId._id)
  );
};

export const isLastMessageInGroup = (
  currentMessage: { senderId: { _id: string } },
  nextMessage: { senderId: { _id: string } } | null
): boolean => {
  return !nextMessage || nextMessage.senderId._id !== currentMessage.senderId._id;
};

export const isFirstMessageInGroup = (
  currentMessage: { senderId: { _id: string } },
  previousMessage: { senderId: { _id: string } } | null
): boolean => {
  return !previousMessage || previousMessage.senderId._id !== currentMessage.senderId._id;
};

export const getConversationPrimaryParticipant = (
  conversation: Conversation,
  currentUserId?: string
): User | null => {
  if (conversation.participants && conversation.participants.length > 0) {
    const otherParticipants = conversation.participants.filter(
      (p: Participant) => p._id !== currentUserId
    );

    if (otherParticipants.length > 0) {
      return otherParticipants[0]; // Return the first other participant
    }
  }
  return null;
};
