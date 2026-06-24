import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';
import { API_ROUTES } from '../config/api-routes';
import { Friend } from '@/types/friend';
import { Message } from '@/types/message';
import { Group, GroupMessage } from '@/types/group';
import { FriendRequest } from '@/types/friend-request';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface SuccessResponse {
    message: string;
}

class ApiClient {
    private async getHeaders(): Promise<Headers> {
        const headers = new Headers({
            'Content-Type': 'application/json',
        });

        const token = await AsyncStorage.getItem(CONFIG.TOKEN_STORAGE_KEY);
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        };

        return headers;
    };

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized access
                await AsyncStorage.removeItem(CONFIG.TOKEN_STORAGE_KEY);
            }
            throw new Error(data.message || 'An error occurred');
        }

        return { data };
    }

    async get<T>(url: string): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });
            const { data, error } = await this.handleResponse<T>(response);
            if (error) throw new Error(error);
            return data as T;
        } catch (error: any) {
            throw new Error(error.message || 'Network request failed');
        }
    }

    async post<T>(url: string, body: any): Promise<T> {
        try {
            const headers = await this.getHeaders();
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });
            const { data, error } = await this.handleResponse<T>(response);
            if (error) throw new Error(error);
            return data as T;
        } catch (error: any) {
            throw new Error(error.message || 'Network request failed');
        }
    }

    // Auth methods
    async login(email: string, password: string): Promise<{ token: string; }> {
        await AsyncStorage.setItem(CONFIG.EMAIL_STORAGE_KEY, email);
        return this.post(API_ROUTES.AUTH.LOGIN, { email, password });
    }
    async register(data: RegisterRequest): Promise<void> {
        return this.post(API_ROUTES.AUTH.REGISTER, data);
    }

    // Friends methods
    async getFriends(): Promise<Friend[]> {
        return this.get(API_ROUTES.FRIENDS.LIST);
    }
    async sendFriendRequest(friendEmail: string): Promise<SuccessResponse> {
        return this.post(API_ROUTES.FRIENDS.ADD, { email: friendEmail });
    }
    async acceptFriendRequest(friendEmail: string): Promise<SuccessResponse> {
        return this.post(API_ROUTES.FRIENDS.ACCEPT, { email: friendEmail });
    }
    async getPendingFriendRequests(): Promise<FriendRequest[]> {
        return this.get(API_ROUTES.FRIENDS.PENDING);
    }

    // Messages methods
    async getMessages(otherEmail: string): Promise<Message[]> {
        return this.get(API_ROUTES.MESSAGES.GET_HISTORY(otherEmail));
    }
    async sendMessage(otherEmail: string, content: string) {
        return this.post(API_ROUTES.MESSAGES.SEND, {
            recipientEmail: otherEmail,
            content
        });
    }

    // Groups methods
    async getGroups(): Promise<Group[]> {
        return this.get(API_ROUTES.GROUPS.LIST);
    }
    async createGroup(name: string, memberEmails: string[]) {
        return this.post(API_ROUTES.GROUPS.CREATE, { name, memberEmails });
    }

    // Group methods
    async getGroupDetails(groupId: string): Promise<Group> {
        return this.get(API_ROUTES.GROUPS.DETAILS(groupId));
    }
    async getGroupMembers(groupId: string): Promise<string[]> {
        return this.get(API_ROUTES.GROUPS.MEMBERS(groupId));
    }
    async getGroupMessages(groupId: string): Promise<GroupMessage[]> {
        return this.get(API_ROUTES.GROUPS.MESSAGES(groupId));
    }
    async sendGroupMessage(groupId: string, content: string) {
        return this.post(API_ROUTES.GROUPS.SEND_MESSAGE(groupId), { content });
    }
}

export const apiClient = new ApiClient();
