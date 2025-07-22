"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Modal, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import MessagingService from "../services/MessagingService"

const WaiterMessagingPage = () => {
  const navigation = useNavigation()
  const [selectedTable, setSelectedTable] = useState("")
  const [message, setMessage] = useState("")
  const [recentMessages, setRecentMessages] = useState([])
  const [showTablePicker, setShowTablePicker] = useState(false)
  const [waiterName, setWaiterName] = useState("")
  const [sending, setSending] = useState(false)

  const availableTables = [
    { id: "table_1", name: "Bàn 1" },
    { id: "table_2", name: "Bàn 2" },
    { id: "table_3", name: "Bàn 3" },
    { id: "table_4", name: "Bàn 4" },
    { id: "table_5", name: "Bàn 5" },
    { id: "table_6", name: "Bàn 6" },
    { id: "table_7", name: "Bàn 7" },
    { id: "table_8", name: "Bàn 8" },
  ]

  const quickMessages = [
    "Món ăn của bạn sẽ được phục vụ trong 10 phút nữa.",
    "Bạn vui lòng đợi thêm 5 phút nữa nhé!",
    "Cảm ơn bạn đã chờ đợi. Món ăn đang được chuẩn bị.",
    "Bạn có cần thêm nước uống không?",
    "Có gì cần hỗ trợ thêm không ạ?",
    "Món ăn đã sẵn sàng, chúng tôi sẽ mang ra ngay.",
    "Xin lỗi vì sự chậm trễ, món ăn sẽ ra trong 3 phút nữa.",
    "Bạn có muốn thêm tráng miệng không?",
  ]

  useEffect(() => {
    loadWaiterInfo()
    loadRecentMessages()
  }, [])

  const loadWaiterInfo = async () => {
    try {
      const name = await AsyncStorage.getItem("nameUser")
      setWaiterName(name || "Nhân viên")
    } catch (error) {
      console.error("Error loading waiter info:", error)
    }
  }

  const loadRecentMessages = async () => {
    try {
      const existingMessages = await AsyncStorage.getItem("tableMessages")
      const messages = existingMessages ? JSON.parse(existingMessages) : []

      // Lấy 10 tin nhắn gần nhất từ waiter
      const waiterMessages = messages
        .filter((msg) => msg.senderType === "waiter")
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10)

      setRecentMessages(waiterMessages)
    } catch (error) {
      console.error("Error loading recent messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedTable) {
      Alert.alert("Lỗi", "Vui lòng chọn bàn trước khi gửi tin nhắn")
      return
    }

    if (!message.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập nội dung tin nhắn")
      return
    }

    setSending(true)
    try {
      await MessagingService.sendMessageToGuest(selectedTable, message.trim(), "waiter")

      Alert.alert("Thành công", `Tin nhắn đã được gửi đến ${getTableName(selectedTable)}!`)
      setMessage("")
      await loadRecentMessages()
    } catch (error) {
      console.error("Error sending message:", error)
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.")
    } finally {
      setSending(false)
    }
  }

  const handleQuickMessage = async (quickMsg) => {
    if (!selectedTable) {
      Alert.alert("Lỗi", "Vui lòng chọn bàn trước khi gửi tin nhắn")
      return
    }

    setSending(true)
    try {
      await MessagingService.sendMessageToGuest(selectedTable, quickMsg, "waiter")
      Alert.alert("Thành công", `Tin nhắn đã được gửi đến ${getTableName(selectedTable)}!`)
      await loadRecentMessages()
    } catch (error) {
      console.error("Error sending quick message:", error)
      Alert.alert("Lỗi", "Không thể gửi tin nhắn. Vui lòng thử lại.")
    } finally {
      setSending(false)
    }
  }

  const getTableName = (tableId) => {
    const table = availableTables.find((t) => t.id === tableId)
    return table ? table.name : tableId
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderRecentMessage = ({ item }) => (
    <View style={styles.recentMessageItem}>
      <View style={styles.recentMessageHeader}>
        <Text style={styles.recentMessageTable}>{getTableName(item.tableId)}</Text>
        <Text style={styles.recentMessageTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.recentMessageText} numberOfLines={2}>
        {item.message}
      </Text>
    </View>
  )

  const renderTableOption = (table) => (
    <TouchableOpacity
      key={table.id}
      style={[styles.tableOption, selectedTable === table.id && styles.tableOptionSelected]}
      onPress={() => {
        setSelectedTable(table.id)
        setShowTablePicker(false)
      }}
    >
      <Ionicons name="restaurant" size={20} color={selectedTable === table.id ? "#FDEBD0" : "#E67E22"} />
      <Text style={[styles.tableOptionText, selectedTable === table.id && styles.tableOptionTextSelected]}>
        {table.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Gửi tin nhắn</Text>
          <Text style={styles.headerSubtitle}>Nhân viên: {waiterName}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Table Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn bàn</Text>
          <TouchableOpacity style={styles.tableSelector} onPress={() => setShowTablePicker(true)}>
            <Ionicons name="restaurant" size={20} color="#E67E22" />
            <Text style={styles.tableSelectorText}>{selectedTable ? getTableName(selectedTable) : "Chọn bàn..."}</Text>
            <Ionicons name="chevron-down" size={20} color="#4D5656" />
          </TouchableOpacity>
        </View>

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tin nhắn tùy chỉnh</Text>
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Nhập tin nhắn cho khách hàng..."
              placeholderTextColor="#4D5656"
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!selectedTable || !message.trim() || sending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!selectedTable || !message.trim() || sending}
            >
              <Ionicons name={sending ? "hourglass" : "send"} size={20} color="#FDEBD0" />
            </TouchableOpacity>
          </View>
          <Text style={styles.characterCount}>{message.length}/200</Text>
        </View>

        {/* Quick Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tin nhắn nhanh</Text>
          <View style={styles.quickMessagesContainer}>
            {quickMessages.map((quickMsg, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickMessageButton, (!selectedTable || sending) && styles.quickMessageButtonDisabled]}
                onPress={() => handleQuickMessage(quickMsg)}
                disabled={!selectedTable || sending}
              >
                <Text style={styles.quickMessageText} numberOfLines={2}>
                  {quickMsg}
                </Text>
                <Ionicons name="send-outline" size={16} color="#E67E22" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Messages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tin nhắn gần đây</Text>
          {recentMessages.length > 0 ? (
            <FlatList
              data={recentMessages}
              keyExtractor={(item) => item.id}
              renderItem={renderRecentMessage}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyRecentMessages}>
              <Ionicons name="chatbubbles-outline" size={40} color="#4D5656" />
              <Text style={styles.emptyRecentMessagesText}>Chưa có tin nhắn nào được gửi</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Table Picker Modal */}
      <Modal
        visible={showTablePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTablePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn bàn</Text>
              <TouchableOpacity onPress={() => setShowTablePicker(false)}>
                <Ionicons name="close" size={24} color="#4D5656" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.tableOptionsContainer}>{availableTables.map(renderTableOption)}</ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
  },
  tableSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tableSelectorText: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 10,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    maxHeight: 100,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#4D5656",
    opacity: 0.5,
  },
  characterCount: {
    fontSize: 12,
    color: "#4D5656",
    textAlign: "right",
    marginTop: 5,
  },
  quickMessagesContainer: {
    gap: 10,
  },
  quickMessageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  quickMessageButtonDisabled: {
    opacity: 0.5,
  },
  quickMessageText: {
    flex: 1,
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
    marginRight: 10,
  },
  recentMessageItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recentMessageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recentMessageTable: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E67E22",
  },
  recentMessageTime: {
    fontSize: 12,
    color: "#4D5656",
  },
  recentMessageText: {
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 20,
  },
  emptyRecentMessages: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyRecentMessagesText: {
    fontSize: 14,
    color: "#4D5656",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FDEBD0",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  tableOptionsContainer: {
    padding: 20,
  },
  tableOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tableOptionSelected: {
    backgroundColor: "#E67E22",
  },
  tableOptionText: {
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 10,
    fontWeight: "500",
  },
  tableOptionTextSelected: {
    color: "#FDEBD0",
  },
})

export default WaiterMessagingPage
