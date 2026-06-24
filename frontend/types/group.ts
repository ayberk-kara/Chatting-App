export interface Group {
    id: string;
    name: string;
    creatorId: string;
    members: string[];
    createdAt: string;
    updatedAt: string;
}

export interface GroupMessage {
    id: string;
    senderId: string;
    recipientId: string | null;
    content: string;
    timestamp: string;
    groupId: string;
    readAt: string | null;
    deletedAt: string | null;
    deleted: boolean;
    read: boolean;
    groupMessage: boolean;
}
