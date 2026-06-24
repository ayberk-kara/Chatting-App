import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from "../../../lib/api-client";
import { Friend } from "../../../types/friend";

export default function CreateGroupScreen() {
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await apiClient.getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Failed to load friends:', error);
      Alert.alert("Error", "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (selectedFriends.size === 0) {
      Alert.alert("Error", "Please select at least one friend");
      return;
    }

    setCreating(true);
    try {
      await apiClient.createGroup(groupName.trim(), Array.from(selectedFriends));
      Alert.alert("Success", "Group created successfully", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Failed to create group:', error);
      Alert.alert("Error", error.message || "Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const toggleFriendSelection = (email: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(email)) {
      newSelection.delete(email);
    } else {
      newSelection.add(email);
    }
    setSelectedFriends(newSelection);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="people" size={20} color="#666" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Group Name"
          value={groupName}
          onChangeText={setGroupName}
          maxLength={30}
        />
      </View>

      <Text style={styles.sectionTitle}>
        Select Members ({selectedFriends.size} selected)
      </Text>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.friendItem,
              selectedFriends.has(item.email) && styles.selectedFriend,
            ]}
            onPress={() => toggleFriendSelection(item.email)}
          >
            <View style={styles.friendAvatarContainer}>
              <Text style={styles.friendAvatarText}>
                {item.firstName[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.friendEmail}>{item.email}</Text>
            </View>
            {selectedFriends.has(item.email) && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#007AFF"
                style={styles.checkmark}
              />
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friends available</Text>
            <Text style={styles.emptySubtext}>
              Add some friends first to create a group
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[
          styles.createButton,
          (creating || !groupName.trim() || selectedFriends.size === 0) && styles.createButtonDisabled
        ]}
        onPress={handleCreateGroup}
        disabled={creating || !groupName.trim() || selectedFriends.size === 0}
      >
        {creating ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.createButtonText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: "#f8f9fa",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  selectedFriend: {
    backgroundColor: "#e3f2fd",
  },
  friendAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendAvatarText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  friendEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  checkmark: {
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: "#007AFF",
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  createButtonDisabled: {
    backgroundColor: "#ccc",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
