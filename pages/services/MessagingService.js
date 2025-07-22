import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"

class MessagingService {
  constructor() {
    this.initialize()
  }

  async initialize() {
    // Thiết lập notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
  }

  // Gửi tin nhắn từ waiter đến guest
  async sendMessageToGuest(tableId, message, senderType = "waiter") {
    try {
      const messageData = {
        id: Date.now().toString(),
        tableId,
        message,
        senderType, // 'waiter' hoặc 'guest'
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      // Lưu tin nhắn vào storage
      await this.saveMessage(messageData)

      // Gửi push notification cho guest
      if (senderType === "waiter") {
        await this.sendPushNotification(tableId, message)
      }

      return messageData
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  // Lưu tin nhắn vào AsyncStorage
  async saveMessage(messageData) {
    try {
      const existingMessages = await AsyncStorage.getItem("tableMessages")
      const messages = existingMessages ? JSON.parse(existingMessages) : []

      messages.unshift(messageData)

      // Giới hạn số lượng tin nhắn (giữ 100 tin nhắn gần nhất)
      if (messages.length > 100) {
        messages.splice(100)
      }

      await AsyncStorage.setItem("tableMessages", JSON.stringify(messages))
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  // Lấy tin nhắn theo table ID
  async getMessagesByTable(tableId) {
    try {
      const existingMessages = await AsyncStorage.getItem("tableMessages")
      const messages = existingMessages ? JSON.parse(existingMessages) : []

      return messages
        .filter((msg) => msg.tableId === tableId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    } catch (error) {
      console.error("Error getting messages:", error)
      return []
    }
  }

  // Lấy tất cả tin nhắn chưa đọc
  async getUnreadMessages(tableId) {
    try {
      const messages = await this.getMessagesByTable(tableId)
      return messages.filter((msg) => !msg.isRead && msg.senderType === "waiter")
    } catch (error) {
      console.error("Error getting unread messages:", error)
      return []
    }
  }

  // Đánh dấu tin nhắn đã đọc
  async markMessagesAsRead(tableId) {
    try {
      const existingMessages = await AsyncStorage.getItem("tableMessages")
      const messages = existingMessages ? JSON.parse(existingMessages) : []

      const updatedMessages = messages.map((msg) => {
        if (msg.tableId === tableId && msg.senderType === "waiter") {
          return { ...msg, isRead: true }
        }
        return msg
      })

      await AsyncStorage.setItem("tableMessages", JSON.stringify(updatedMessages))
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  // Gửi push notification
  async sendPushNotification(tableId, message) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Tin nhắn từ nhân viên",
          body: message,
          data: {
            type: "waiter_message",
            tableId: tableId,
          },
          sound: "default",
        },
        trigger: null,
      })
    } catch (error) {
      console.error("Error sending push notification:", error)
    }
  }

  // Gửi phản hồi nhanh từ guest
  async sendQuickReply(tableId, replyMessage) {
    try {
      const messageData = {
        id: Date.now().toString(),
        tableId,
        message: replyMessage,
        senderType: "guest",
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      await this.saveMessage(messageData)
      return messageData
    } catch (error) {
      console.error("Error sending quick reply:", error)
      throw error
    }
  }

  // Simulate waiter sending message (for demo purposes)
  async simulateWaiterMessage(tableId) {
    const waiterMessages = [
      "Xin chào! Món ăn của bạn sẽ được phục vụ trong 10 phút nữa.",
      "Bạn có cần thêm nước uống không?",
      "Cảm ơn bạn đã chờ đợi. Món ăn đang được chuẩn bị.",
      "Bạn vui lòng đợi thêm 5 phút nữa nhé!",
      "Có gì cần hỗ trợ thêm không ạ?",
    ]

    const randomMessage = waiterMessages[Math.floor(Math.random() * waiterMessages.length)]
    return await this.sendMessageToGuest(tableId, randomMessage, "waiter")
  }
}

export default new MessagingService()
