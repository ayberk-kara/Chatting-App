import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from "../../../../lib/api-client";
import { GroupMessage } from "../../../../types/group";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../../../config';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const email = await AsyncStorage.getItem(CONFIG.EMAIL_STORAGE_KEY);
        if (email) {
          setCurrentUserEmail(email);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to get current user');
      }
    };
    getCurrentUser();
  }, []);

  const loadGroupDetails = useCallback(async () => {
    try {
      const groupDetails = await apiClient.getGroupDetails(id as string);
      setGroupName(groupDetails.name);
    } catch (error) {
      Alert.alert('Error', 'Failed to load group details');
    }
  }, [id]);

  const loadMessages = useCallback(async () => {
    try {
      setError(null);
      const messagesData = await apiClient.getGroupMessages(id as string);
      setMessages(messagesData);
    } catch (error: any) {
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await apiClient.sendGroupMessage(id as string, newMessage.trim());
      setNewMessage("");
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: GroupMessage; }) => {
    const isSender = item.senderId === currentUserEmail;

    return (
      <View style={[
        styles.messageContainer,
        isSender ? styles.sentContainer : styles.receivedContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isSender ? styles.sentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isSender ? styles.sentText : styles.receivedText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timeText,
            isSender ? styles.sentTimeText : styles.receivedTimeText
          ]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const formatMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - (messageDate.getTime() - (60 * 60 * 1000))) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins}m`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    }
    return messageDate.toLocaleDateString();
  };

  const handleOpenDetails = () => {
    router.push({
      pathname: "/groups/[id]",
      params: { id: id as string }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: groupName || "Group Chat",
          headerTitle: groupName || "Group Chat",
          headerBackTitle: "Groups",
          headerTitleAlign: "center",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleOpenDetails}
              style={styles.headerButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={true}
          ListEmptyComponent={
            <View style={[styles.emptyContainer]}>
              <Ionicons
                name="chatbubbles-outline"
                size={48}
                color="#666"
              />
              <Text style={styles.emptyText}>
                No messages yet
              </Text>
              <Text style={styles.emptySubtext}>
                Start the conversation!
              </Text>
            </View>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Ionicons name="send" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
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
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: "row",
    width: '100%',
  },
  sentContainer: {
    justifyContent: "flex-end",
  },
  receivedContainer: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 20,
  },
  sentBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  receivedBubble: {
    backgroundColor: "#E9ECEF",
    borderBottomLeftRadius: 4,
    marginRight: 'auto',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: "#FFFFFF",
  },
  receivedText: {
    color: "#000000",
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  sentTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: 'right',
  },
  receivedTimeText: {
    color: "#666666",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    marginRight: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
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
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  senderInfo: {
    marginRight: 8,
    alignItems: 'center',
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  senderAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
});
