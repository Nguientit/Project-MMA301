"use client"

import { useState, useEffect } from "react"
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")

const OrderStatsModal = ({ visible, onClose }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategory: "",
    favoriteDish: "",
    orderHistory: [],
    monthlyStats: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      loadOrderStats()
    }
  }, [visible])

  const loadOrderStats = async () => {
    setLoading(true)
    try {
      // Lấy lịch sử đơn hàng
      const historyData = await AsyncStorage.getItem("history")
      const orderHistory = historyData ? JSON.parse(historyData) : []

      if (orderHistory.length === 0) {
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          favoriteCategory: "Chưa có dữ liệu",
          favoriteDish: "Chưa có dữ liệu",
          orderHistory: [],
          monthlyStats: [],
        })
        setLoading(false)
        return
      }

      // Tính tổng số đơn hàng
      const totalOrders = orderHistory.length

      // Tính tổng số tiền đã chi
      const totalSpent = orderHistory.reduce((sum, order) => {
        return (
          sum +
          order.items.reduce((orderSum, item) => {
            return orderSum + item.price * item.quantity
          }, 0)
        )
      }, 0)

      // Tìm category yêu thích
      const categoryCount = {}
      const dishCount = {}

      orderHistory.forEach((order) => {
        order.items.forEach((item) => {
          // Đếm category
          const category = item.category || "Other"
          categoryCount[category] = (categoryCount[category] || 0) + item.quantity

          // Đếm món ăn
          dishCount[item.name] = (dishCount[item.name] || 0) + item.quantity
        })
      })

      const favoriteCategory =
        Object.keys(categoryCount).length > 0
          ? Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b))
          : "Chưa có dữ liệu"

      const favoriteDish =
        Object.keys(dishCount).length > 0
          ? Object.keys(dishCount).reduce((a, b) => (dishCount[a] > dishCount[b] ? a : b))
          : "Chưa có dữ liệu"

      // Thống kê theo tháng (3 tháng gần nhất)
      const monthlyStats = getMonthlyStats(orderHistory)

      setStats({
        totalOrders,
        totalSpent,
        favoriteCategory,
        favoriteDish,
        orderHistory: orderHistory.slice(0, 5), // 5 đơn gần nhất
        monthlyStats,
      })
    } catch (error) {
      console.error("Error loading order stats:", error)
      Alert.alert("Lỗi", "Không thể tải thống kê đơn hàng")
    } finally {
      setLoading(false)
    }
  }

  const getMonthlyStats = (orderHistory) => {
    const monthlyData = {}
    const currentDate = new Date()

    // Tạo dữ liệu cho 3 tháng gần nhất
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

      monthlyData[monthKey] = {
        name: monthName,
        orders: 0,
        spent: 0,
      }
    }

    // Tính toán dữ liệu thực tế
    orderHistory.forEach((order) => {
      const orderDate = new Date(order.createdAt)
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].orders += 1
        monthlyData[monthKey].spent += order.items.reduce((sum, item) => {
          return sum + item.price * item.quantity
        }, 0)
      }
    })

    return Object.values(monthlyData)
  }

  const StatCard = ({ icon, title, value, color = "#E67E22" }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="#FDEBD0" />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Ionicons name="analytics" size={24} color="#E67E22" />
              <Text style={styles.title}>Thống kê đơn hàng</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#4D5656" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="analytics" size={40} color="#E67E22" />
                <Text style={styles.loadingText}>Đang tải thống kê...</Text>
              </View>
            ) : (
              <>
                {/* Tổng quan */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tổng quan</Text>
                  <View style={styles.statsGrid}>
                    <StatCard
                      icon="receipt"
                      title="Tổng đơn hàng"
                      value={stats.totalOrders.toString()}
                      color="#E67E22"
                    />
                    <StatCard
                      icon="card"
                      title="Tổng chi tiêu"
                      value={`${stats.totalSpent.toLocaleString()}đ`}
                      color="#D35400"
                    />
                  </View>
                  <View style={styles.statsGrid}>
                    <StatCard icon="heart" title="Loại món yêu thích" value={stats.favoriteCategory} color="#A04000" />
                    <StatCard icon="star" title="Món ăn yêu thích" value={stats.favoriteDish} color="#8B4513" />
                  </View>
                </View>

                {/* Thống kê theo tháng */}
                {stats.monthlyStats.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Thống kê 3 tháng gần nhất</Text>
                    {stats.monthlyStats.map((month, index) => (
                      <View key={index} style={styles.monthlyCard}>
                        <View style={styles.monthlyHeader}>
                          <Text style={styles.monthName}>{month.name}</Text>
                          <View style={styles.monthlyStats}>
                            <Text style={styles.monthlyValue}>{month.orders} đơn</Text>
                            <Text style={styles.monthlySpent}>{month.spent.toLocaleString()}đ</Text>
                          </View>
                        </View>
                        <View style={styles.progressBar}>
                          <LinearGradient
                            colors={["#E67E22", "#D35400"]}
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min((month.orders / Math.max(...stats.monthlyStats.map((m) => m.orders), 1)) * 100, 100)}%`,
                              },
                            ]}
                            start={[0, 0]}
                            end={[1, 0]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Đơn hàng gần nhất */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Đơn hàng gần nhất</Text>
                  {stats.orderHistory.length > 0 ? (
                    stats.orderHistory.map((order, index) => (
                      <View key={order.id || index} style={styles.orderCard}>
                        <View style={styles.orderHeader}>
                          <View style={styles.orderInfo}>
                            <Ionicons name="restaurant" size={16} color="#E67E22" />
                            <Text style={styles.orderTable}>{order.table}</Text>
                          </View>
                          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</Text>
                        </View>
                        <Text style={styles.orderItems} numberOfLines={2}>
                          {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                        </Text>
                        <Text style={styles.orderTotal}>
                          Tổng:{" "}
                          {order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Ionicons name="receipt-outline" size={40} color="#4D5656" />
                      <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FDEBD0",
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: "85%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#4D5656",
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 90,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statTitle: {
    fontSize: 10,
    color: "#4D5656",
    textAlign: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  monthlyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  monthName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  monthlyStats: {
    alignItems: "flex-end",
  },
  monthlyValue: {
    fontSize: 12,
    color: "#E67E22",
    fontWeight: "600",
  },
  monthlySpent: {
    fontSize: 10,
    color: "#4D5656",
  },
  progressBar: {
    height: 3,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTable: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
    marginLeft: 4,
  },
  orderDate: {
    fontSize: 10,
    color: "#4D5656",
  },
  orderItems: {
    fontSize: 12,
    color: "#4D5656",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#D35400",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: "#4D5656",
    marginTop: 10,
  },
})

export default OrderStatsModal
