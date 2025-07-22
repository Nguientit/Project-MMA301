"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import MessagingService from "../services/MessagingService"

const NotificationsPage = () => {
  const navigation = useNavigation()
  const [messages, setMessages] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [currentTableId, setCurrentTableId] = useState("")
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [replyingToMessage, setReplyingToMessage] = useState(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      // Lấy table ID hiện tại
      const tableId = await AsyncStorage.getItem("selectedTable")
      if (tableId) {
        setCurrentTableId(tableId)
        const tableMessages = await MessagingService.getMessagesByTable(tableId)
        setMessages(tableMessages)

        // Đánh dấu tin nhắn đã đọc
        await MessagingService.markMessagesAsRead(tableId)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadMessages()
    setRefreshing(false)
  }

  const handleQuickReply = async (replyMessage) => {
    try {
      if (currentTableId) {
        await MessagingService.sendQuickReply(currentTableId, replyMessage)
        Alert.alert("Đã gửi", "Phản hồi của bạn đã được gửi đến nhân viên!")
        await loadMessages() // Reload để hiển thị tin nhắn mới
      }
    } catch (error) {
      console.error("Error sending quick reply:", error)
      Alert.alert("Lỗi", "Không thể gửi phản hồi")
    }
  }

  const handleCustomReply = (message) => {
    setReplyingToMessage(message)
    setShowReplyModal(true)
  }

  const sendCustomReply = async () => {
    if (replyText.trim() && currentTableId) {
      try {
        await MessagingService.sendCustomerMessage(currentTableId, replyText.trim())
        Alert.alert("Đã gửi", "Tin nhắn của bạn đã được gửi đến nhân viên!")
        setShowReplyModal(false)
        setReplyText("")
        setReplyingToMessage(null)
        await loadMessages()
      } catch (error) {
        console.error("Error sending custom reply:", error)
        Alert.alert("Lỗi", "Không thể gửi tin nhắn")
      }
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes} phút trước`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
  }

  const renderMessageItem = ({ item }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <Ionicons
            name={item.senderType === "waiter" ? "person-circle" : "chatbubble-ellipses"}
            size={20}
            color={item.senderType === "waiter" ? "#E67E22" : "#27AE60"}
          />
          <Text style={styles.senderText}>{item.senderType === "waiter" ? "Nhân viên" : "Bạn"}</Text>
        </View>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
      </View>

      <Text style={styles.messageText}>{item.message}</Text>

      {item.senderType === "waiter" && (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Phản hồi:</Text>
          <View style={styles.quickReplyButtons}>
            <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply("OK, mình đợi")}>
              <Text style={styles.quickReplyButtonText}>OK, mình đợi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickReplyButton, styles.quickReplyButtonSecondary]}
              onPress={() => handleQuickReply("Gọi nhân viên")}
            >
              <Text style={[styles.quickReplyButtonText, styles.quickReplyButtonSecondaryText]}>Gọi nhân viên</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.customReplyButton} onPress={() => handleCustomReply(item)}>
            <Ionicons name="create-outline" size={16} color="#3498DB" />
            <Text style={styles.customReplyButtonText}>Trả lời tùy chỉnh</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={60} color="#4D5656" />
      <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
      <Text style={styles.emptyText}>Nhân viên sẽ gửi thông báo về tình trạng đơn hàng của bạn tại đây</Text>
      <TouchableOpacity
        style={styles.simulateButton}
        onPress={async () => {
          if (currentTableId) {
            await MessagingService.simulateWaiterMessage(currentTableId)
            await loadMessages()
          }
        }}
      >
        <Text style={styles.simulateButtonText}>Mô phỏng tin nhắn (Demo)</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Thông báo</Text>
          <Text style={styles.headerSubtitle}>
            {currentTableId ? `Bàn ${currentTableId.replace("table_", "")}` : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="#FDEBD0" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#E67E22"]} />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Custom Reply Modal */}
      <Modal visible={showReplyModal} transparent animationType="slide" onRequestClose={() => setShowReplyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.replyModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trả lời nhân viên</Text>
              <TouchableOpacity onPress={() => setShowReplyModal(false)}>
                <Ionicons name="close" size={24} color="#4D5656" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.replyInput}
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Nhập tin nhắn của bạn..."
              placeholderTextColor="#4D5656"
              multiline
              maxLength={200}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowReplyModal(false)}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !replyText.trim() && styles.sendButtonDisabled]}
                onPress={sendCustomReply}
                disabled={!replyText.trim()}
              >
                <Text style={styles.sendButtonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
  },
  header: {
    backgroundColor: "#E67E22",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.9,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: 20,
    flexGrow: 1,
  },
  messageItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  senderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#4D5656",
  },
  messageText: {
    fontSize: 16,
    color: "#2C3E50",
    lineHeight: 22,
    marginBottom: 15,
  },
  replyContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 15,
  },
  replyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4D5656",
    marginBottom: 10,
  },
  quickReplyButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  quickReplyButton: {
    flex: 1,
    backgroundColor: "#E67E22",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  quickReplyButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#E67E22",
  },
  quickReplyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FDEBD0",
  },
  quickReplyButtonSecondaryText: {
    color: "#E67E22",
  },
  customReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#3498DB",
  },
  customReplyButtonText: {
    fontSize: 12,
    color: "#3498DB",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#4D5656",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  simulateButton: {
    backgroundColor: "#E67E22",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  simulateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FDEBD0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  replyModal: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  replyInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#2C3E50",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#4D5656",
    fontWeight: "600",
  },
  sendButton: {
    flex: 1,
    backgroundColor: "#E67E22",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#BDC3C7",
  },
  sendButtonText: {
    fontSize: 16,
    color: "#FDEBD0",
    fontWeight: "600",
  },
})

export default NotificationsPage
