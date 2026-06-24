import { BASE_URL } from './index';

export const API_ROUTES = {
    AUTH: {
        LOGIN: `${BASE_URL}/login`,
        REGISTER: `${BASE_URL}/register`,
    },
    FRIENDS: {
        LIST: `${BASE_URL}/friends`,
        ADD: `${BASE_URL}/friends/add`,
        ACCEPT: `${BASE_URL}/friends/accept`,
        PENDING: `${BASE_URL}/friends/pending`,
    },
    GROUPS: {
        LIST: `${BASE_URL}/groups`,
        CREATE: `${BASE_URL}/groups/create`,
        DETAILS: (groupId: string) => `${BASE_URL}/groups/${groupId}`,
        ADD_MEMBER: (groupId: string) => `${BASE_URL}/groups/${groupId}/add-member`,
        MEMBERS: (groupId: string) => `${BASE_URL}/groups/${groupId}/members`,
        MESSAGES: (groupId: string) => `${BASE_URL}/groups/${groupId}/messages`,
        SEND_MESSAGE: (groupId: string) => `${BASE_URL}/groups/${groupId}/send`,
    },
    MESSAGES: {
        SEND: `${BASE_URL}/messages/send`,
        GET_HISTORY: (otherEmail: string) => `${BASE_URL}/messages?otherEmail=${encodeURIComponent(otherEmail)}`,
    },
};
