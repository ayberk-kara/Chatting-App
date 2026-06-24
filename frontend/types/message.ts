export interface Message {
    id: string;
    content: string;
    deleted: boolean;
    deletedAt: string | null;
    groupMessage: boolean;
    read: boolean;
    readAt: string | null;
    senderId: string;
    recipientId: string;
    timestamp: string;
}

export interface ChatUser {
    email: string;
    firstName: string;
    lastName: string;
    lastMessage?: string;
    lastMessageTime?: string;
} 
