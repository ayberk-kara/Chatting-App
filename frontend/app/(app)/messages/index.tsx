import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from "../../../lib/api-client";
import { ChatUser } from "../../../types/message";

export default function MessagesScreen() {
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadChats = useCallback(async () => {
    try {
      const friends = await apiClient.getFriends();
      const chatUsers = friends
        .map(friend => ({
          email: friend.email,
          firstName: friend.firstName,
          lastName: friend.lastName,
          lastMessage: undefined,
          lastMessageTime: undefined,
        }));
      setChats(chatUsers);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [loadChats]);

  const renderChatItem = ({ item }: { item: ChatUser; }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/messages/${item.email}`)}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>
          {item.email && item.email[0] ? item.email[0].toUpperCase() : '?'}
        </Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.emailText}>{item.email || 'Unknown User'}</Text>
        <Text style={styles.lastMessageText} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      {item.lastMessageTime && (
        <Text style={styles.timeText}>
          {(() => {
            const now = new Date();
            const messageDate = new Date(item.lastMessageTime);
            const diffInSeconds = Math.floor((now.getTime() - messageDate.getTime()) / 1000);

            if (diffInSeconds < 60) return 'just now';
            if (diffInSeconds < 3600) {
              const mins = Math.floor(diffInSeconds / 60);
              return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`;
            }
            if (diffInSeconds < 86400) {
              const hours = Math.floor(diffInSeconds / 3600);
              return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
            }
            if (diffInSeconds < 2592000) {
              const days = Math.floor(diffInSeconds / 86400);
              return `${days} ${days === 1 ? 'day' : 'days'} ago`;
            }
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
          })()}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.email}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Add friends to start chatting
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          chats.length === 0 && styles.emptyList,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  emailText: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000",
  },
  lastMessageText: {
    fontSize: 14,
    color: "#666",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
