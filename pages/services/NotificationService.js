"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

// Cấu hình notification handler với API mới
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

class NotificationService {
  constructor() {
    this.initialize()
  }

  async initialize() {
    try {
      // Yêu cầu quyền notification
      await this.requestPermissions()

      // Lắng nghe notification responses
      this.setupNotificationListeners()
    } catch (error) {
      console.log("NotificationService initialization error:", error)
    }
  }

  async requestPermissions() {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#E67E22",
        })
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== "granted") {
        console.log("Notification permissions not granted")
        return false
      }

      return true
    } catch (error) {
      console.log("Error requesting notification permissions:", error)
      return false
    }
  }

  setupNotificationListeners() {
    // Lắng nghe khi notification được nhận
    Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)
    })

    // Lắng nghe khi user tap vào notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response)
      this.handleNotificationResponse(response)
    })
  }

  handleNotificationResponse(response) {
    const { data } = response.notification.request.content

    if (data?.type === "order_ready") {
      console.log("Order ready notification tapped")
    } else if (data?.type === "order_placed") {
      console.log("Order placed notification tapped")
    } else if (data?.type === "lunch_recommendation") {
      // Navigate to lunch recommendations page - sửa tên route
      console.log("Lunch recommendation notification tapped - navigate to LunchRecommendationsPage")
    }
  }

  // Gửi notification khi đơn hàng được đặt
  async sendOrderPlacedNotification(orderData) {
    try {
      const { table, items, id } = orderData
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Đặt hàng thành công!",
          body: `Đơn hàng ${table} với ${totalItems} món đã được gửi đến bếp`,
          data: {
            type: "order_placed",
            orderId: id,
            table: table,
          },
          sound: "default",
        },
        trigger: null,
      })

      await this.saveNotificationHistory({
        type: "order_placed",
        orderId: id,
        title: "Đặt hàng thành công!",
        body: `Đơn hàng ${table} với ${totalItems} món đã được gửi đến bếp`,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.log("Error sending order placed notification:", error)
    }
  }

  // Gửi notification khi món ăn sẵn sàng
  async sendOrderReadyNotification(orderData) {
    try {
      const { table, items, id } = orderData
      const dishNames = items.map((item) => item.name).join(", ")

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Món ăn đã sẵn sàng!",
          body: `${table}: ${dishNames} đã được chuẩn bị xong`,
          data: {
            type: "order_ready",
            orderId: id,
            table: table,
          },
          sound: "default",
        },
        trigger: null,
      })

      await this.saveNotificationHistory({
        type: "order_ready",
        orderId: id,
        title: "Món ăn đã sẵn sàng!",
        body: `${table}: ${dishNames} đã được chuẩn bị xong`,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.log("Error sending order ready notification:", error)
    }
  }

  // Gửi notification gợi ý món ăn trưa
  async sendLunchRecommendationNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Gợi ý món ăn trưa",
          body: "Đã đến giờ ăn trưa! Xem những combo cơm ngon được gợi ý cho bạn",
          data: {
            type: "lunch_recommendation",
            targetPage: "LunchRecommendationsPage",
          },
          sound: "default",
        },
        trigger: null,
      })

      await this.saveNotificationHistory({
        type: "lunch_recommendation",
        title: "Gợi ý món ăn trưa",
        body: "Đã đến giờ ăn trưa! Xem những combo cơm ngon được gợi ý cho bạn",
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.log("Error sending lunch recommendation notification:", error)
    }
  }

  // Lên lịch notification định kỳ
  async scheduleRecurringFoodRecommendations() {
    try {
      // Gợi ý lúc 11:30 (trước giờ ăn trưa)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍽️ Gợi ý món ăn trưa",
          body: "Đã đến giờ ăn trưa! Xem những combo cơm ngon được chọn riêng cho bạn",
          data: {
            type: "lunch_recommendation",
            targetPage: "LunchRecommendationsPage", // Sửa tên route
          },
        },
        trigger: {
          hour: 11,
          minute: 30,
          repeats: true,
        },
      })

      // Gợi ý lúc 17:30 (trước giờ ăn tối)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🌆 Gợi ý món ăn tối",
          body: "Bữa tối ăn gì nhỉ? Khám phá những món ngon được chọn riêng cho bạn!",
          data: {
            type: "dinner_recommendation",
            targetPage: "DinnerRecommendationsPage",
          },
        },
        trigger: {
          hour: 17,
          minute: 30,
          repeats: true,
        },
      })
    } catch (error) {
      console.log("Error scheduling recurring notifications:", error)
    }
  }

  async saveNotificationHistory(notification) {
    try {
      const existingHistory = await AsyncStorage.getItem("notificationHistory")
      const history = existingHistory ? JSON.parse(existingHistory) : []

      history.unshift(notification)

      if (history.length > 50) {
        history.splice(50)
      }

      await AsyncStorage.setItem("notificationHistory", JSON.stringify(history))
    } catch (error) {
      console.log("Error saving notification history:", error)
    }
  }

  async getNotificationHistory() {
    try {
      const history = await AsyncStorage.getItem("notificationHistory")
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.log("Error getting notification history:", error)
      return []
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
    } catch (error) {
      console.log("Error canceling notifications:", error)
    }
  }
}

export default new NotificationService()