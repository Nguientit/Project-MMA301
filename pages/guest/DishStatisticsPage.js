"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, RefreshControl } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import GeminiAIService from "../services/GeminiAIService"
import { recipes } from "../../data"

const { width: screenWidth } = Dimensions.get("window")

// Simple pie chart component without external dependencies
const SimplePieChart = ({ data, width, height }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <View style={styles.emptyChart}>
        <Ionicons name="pie-chart-outline" size={60} color="#4D5656" />
        <Text style={styles.emptyChartText}>Chưa có dữ liệu để hiển thị</Text>
      </View>
    )
  }

  return (
    <View style={styles.pieChartContainer}>
      <View style={styles.pieChartPlaceholder}>
        <Ionicons name="analytics" size={80} color="#E67E22" />
        <Text style={styles.chartPlaceholderText}>Biểu đồ phân loại món ăn</Text>
      </View>
      <View style={styles.chartLegend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.key}: {item.value} món ({Math.round((item.value / total) * 100)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function DishStatisticsPage() {
  const navigation = useNavigation()
  const [statistics, setStatistics] = useState({
    totalCalories: 0,
    totalOrders: 0,
    spicyPercentage: 0,
    categoryBreakdown: [],
    recentOrders: [],
  })
  const [filter, setFilter] = useState("all") // 'week', 'month', 'all'
  const [aiInsight, setAiInsight] = useState("")
  const [recommendedDishes, setRecommendedDishes] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [generatingInsight, setGeneratingInsight] = useState(false)

  useEffect(() => {
    loadStatistics()
    generateAIInsight()
  }, [filter])

  const loadStatistics = async () => {
    try {
      const historyData = await AsyncStorage.getItem("history")
      const orders = historyData ? JSON.parse(historyData) : []

      // Filter orders based on selected time period
      const filteredOrders = filterOrdersByTime(orders, filter)

      // Calculate statistics
      const stats = calculateStatistics(filteredOrders)
      setStatistics(stats)
    } catch (error) {
      console.error("Error loading statistics:", error)
    }
  }

  const filterOrdersByTime = (orders, timeFilter) => {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      switch (timeFilter) {
        case "week":
          return orderDate >= oneWeekAgo
        case "month":
          return orderDate >= oneMonthAgo
        default:
          return true
      }
    })
  }

  const calculateStatistics = (orders) => {
    let totalCalories = 0
    const totalOrders = orders.length
    let spicyCount = 0
    let totalDishes = 0
    const categoryCount = {}

    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          totalDishes++

          // Calculate calories (use recipe data or fallback)
          const recipe = recipes.find((r) => r.name === item.name)
          const calories = recipe?.calories || item.calories || Math.floor(Math.random() * 300) + 150
          totalCalories += calories * (item.quantity || 1)

          // Check if spicy (check recipe or mock data)
          const isSpicy =
            recipe?.name.toLowerCase().includes("tikka") ||
            recipe?.name.toLowerCase().includes("masala") ||
            (recipe?.description && recipe.description.toLowerCase().includes("cay")) ||
            Math.random() > 0.7
          if (isSpicy) spicyCount++

          // Category breakdown
          const category = recipe?.category || item.category || "Khác"
          categoryCount[category] = (categoryCount[category] || 0) + (item.quantity || 1)
        })
      }
    })

    const spicyPercentage = totalDishes > 0 ? Math.round((spicyCount / totalDishes) * 100) : 0

    // Convert category count to chart data
    const categoryBreakdown = Object.entries(categoryCount).map(([key, value], index) => ({
      key,
      value,
      color: getColorForCategory(key, index),
    }))

    return {
      totalCalories,
      totalOrders,
      spicyPercentage,
      categoryBreakdown,
      recentOrders: orders.slice(0, 5),
    }
  }

  const getColorForCategory = (category, index) => {
    const colors = ["#E67E22", "#3498DB", "#27AE60", "#E74C3C", "#9B59B6", "#F39C12"]
    return colors[index % colors.length]
  }

  const generateAIInsight = async () => {
    setGeneratingInsight(true)
    try {
      const prompt = `Phân tích thói quen ăn uống và đưa ra lời khuyên sức khỏe:

Thống kê:
- Tổng số món đã ăn: ${statistics.totalOrders}
- Tổng calories: ${statistics.totalCalories}
- Tỷ lệ món cay: ${statistics.spicyPercentage}%

Hãy đưa ra lời khuyên sức khỏe bằng tiếng Việt, tập trung vào:
1. Đánh giá thói quen ăn uống hiện tại
2. Gợi ý cải thiện dinh dưỡng
3. Khuyến nghị về món ăn phù hợp

Giữ nội dung ngắn gọn, thân thiện (khoảng 100-150 từ).`

      const insight = await GeminiAIService.generateResponse(prompt)
      setAiInsight(insight)

      // Generate recommended dishes based on statistics
      generateRecommendedDishes()
    } catch (error) {
      console.error("Error generating AI insight:", error)
      // Fallback insights
      const fallbackInsights = [
        "Bạn đã ăn khá nhiều món cay trong tuần qua. Để giảm nhiệt cơ thể, bạn có thể thử nước sâm mát, trà chanh hoặc sữa đậu nành.",
        "Tráng miệng nhẹ với sữa chua hoặc trái cây sẽ giúp hệ tiêu hóa ổn định hơn.",
        "Lượng calories tiêu thụ của bạn khá cân bằng. Hãy duy trì chế độ ăn này và kết hợp với vận động nhẹ.",
        "Bạn nên tăng cường rau xanh và giảm đồ chiên rán để cải thiện sức khỏe tim mạch.",
        "Chế độ ăn của bạn thiếu protein. Hãy thêm thịt nạc, cá hoặc đậu phụ vào bữa ăn.",
      ]
      const randomInsight = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)]
      setAiInsight(randomInsight)
      generateRecommendedDishes()
    } finally {
      setGeneratingInsight(false)
    }
  }

  const generateRecommendedDishes = () => {
    const recommendations = []

    // Based on spicy percentage
    if (statistics.spicyPercentage > 30) {
      const coolDrinks = recipes.filter(
        (dish) =>
          dish.category === "Beverage" &&
          (dish.name.toLowerCase().includes("nước") ||
            dish.name.toLowerCase().includes("trà") ||
            dish.name.toLowerCase().includes("sữa")),
      )
      recommendations.push(...coolDrinks.slice(0, 2))
    }

    // Add some healthy options
    const healthyOptions = recipes.filter((dish) => dish.category === "Salad" || (dish.calories && dish.calories < 300))
    recommendations.push(...healthyOptions.slice(0, 2))

    // Add desserts
    const desserts = recipes.filter((dish) => dish.category === "Dess")
    recommendations.push(...desserts.slice(0, 1))

    // Remove duplicates and limit to 3
    const uniqueRecommendations = recommendations
      .filter((dish, index, self) => index === self.findIndex((d) => d.id === dish.id))
      .slice(0, 3)

    setRecommendedDishes(uniqueRecommendations)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStatistics()
    await generateAIInsight()
    setRefreshing(false)
  }

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statInfo}>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={24} color="#FDEBD0" />
        </View>
      </View>
    </View>
  )

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {[
        { key: "week", label: "Tuần" },
        { key: "month", label: "Tháng" },
        { key: "all", label: "Tất cả" },
      ].map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
          onPress={() => setFilter(item.key)}
        >
          <Text style={[styles.filterButtonText, filter === item.key && styles.filterButtonTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Tổng quan món đã ăn</Text>
          <Text style={styles.headerSubtitle}>
            AI sẽ giúp bạn theo dõi thói quen ăn uống và đưa ra lời khuyên sức khỏe phù hợp.
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#27AE60"]} />}
      >
        {renderFilterButtons()}

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard("Tổng Calories", `${statistics.totalCalories.toLocaleString()} kcal`, "flame", "#E74C3C")}
          {renderStatCard("Số đơn hàng", statistics.totalOrders.toString(), "receipt", "#3498DB")}
          {renderStatCard("Món cay", `${statistics.spicyPercentage}%`, "flame-outline", "#E67E22")}
        </View>

        {/* Category Breakdown Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Phân loại món ăn</Text>
          <SimplePieChart data={statistics.categoryBreakdown} width={screenWidth - 40} height={200} />
        </View>

        {/* AI Insight */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={20} color="#E67E22" />
            <Text style={styles.aiTitle}>Lời khuyên từ AI</Text>
            <TouchableOpacity onPress={generateAIInsight} style={styles.refreshInsight} disabled={generatingInsight}>
              <Ionicons name={generatingInsight ? "hourglass" : "refresh"} size={16} color="#E67E22" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aiInsightText}>
            {generatingInsight ? "AI đang phân tích thói quen ăn uống của bạn..." : aiInsight}
          </Text>
        </View>

        {/* Recommended Dishes */}
        {recommendedDishes.length > 0 && (
          <View style={styles.recommendationSection}>
            <Text style={styles.sectionTitle}>Món ăn được khuyên dùng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendedDishes.map((dish) => (
                <TouchableOpacity
                  key={dish.id}
                  style={styles.recommendedDish}
                  onPress={() => navigation.navigate("RecipeDetail", { recipe: dish })}
                >
                  <View style={styles.dishImagePlaceholder}>
                    <Ionicons name="restaurant" size={30} color="#E67E22" />
                  </View>
                  <Text style={styles.dishName} numberOfLines={2}>
                    {dish.name}
                  </Text>
                  <Text style={styles.dishPrice}>{(dish.price || 50000).toLocaleString()}đ</Text>
                  <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => {
                      Alert.alert("Đặt món", `Bạn muốn đặt ${dish.name}?`, [
                        { text: "Hủy", style: "cancel" },
                        { text: "Đặt ngay", onPress: () => navigation.navigate("RecipeDetail", { recipe: dish }) },
                      ])
                    }}
                  >
                    <Text style={styles.orderButtonText}>Đặt ngay</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Orders */}
        {statistics.recentOrders.length > 0 && (
          <View style={styles.recentOrdersSection}>
            <Text style={styles.sectionTitle}>Đơn hàng gần đây</Text>
            {statistics.recentOrders.map((order, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</Text>
                  <Text style={styles.orderTable}>{order.table || "Bàn không xác định"}</Text>
                </View>
                <View style={styles.orderDetails}>
                  {order.items &&
                    order.items.slice(0, 2).map((item, itemIndex) => (
                      <View key={itemIndex} style={styles.orderDish}>
                        <Text style={styles.dishItemName}>{item.name}</Text>
                        <View style={styles.dishMeta}>
                          <Text style={styles.caloriesText}>
                            {item.calories || Math.floor(Math.random() * 300) + 150} kcal
                          </Text>
                          <View style={styles.spiceLevel}>
                            {[1, 2, 3].map((level) => (
                              <Ionicons
                                key={level}
                                name="flame"
                                size={12}
                                color={level <= (item.spiceLevel || 1) ? "#E74C3C" : "#BDC3C7"}
                              />
                            ))}
                          </View>
                        </View>
                      </View>
                    ))}
                  {order.items && order.items.length > 2 && (
                    <Text style={styles.moreItems}>+{order.items.length - 2} món khác</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.viewDetailButton}
                  onPress={() => {
                    Alert.alert("Chi tiết đơn hàng", "Chức năng đang phát triển")
                  }}
                >
                  <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
  },
  header: {
    backgroundColor: "#27AE60",
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#229954",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  headerContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.9,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: "#27AE60",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#4D5656",
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#FDEBD0",
  },
  statsGrid: {
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statInfo: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    color: "#4D5656",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  chartSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 15,
  },
  pieChartContainer: {
    alignItems: "center",
  },
  pieChartPlaceholder: {
    alignItems: "center",
    paddingVertical: 20,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: "#4D5656",
    marginTop: 10,
  },
  emptyChart: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 14,
    color: "#4D5656",
    marginTop: 10,
  },
  chartLegend: {
    marginTop: 15,
    alignSelf: "stretch",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: "#2C3E50",
  },
  aiSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E67E22",
    marginLeft: 8,
    flex: 1,
  },
  refreshInsight: {
    padding: 4,
  },
  aiInsightText: {
    fontSize: 15,
    color: "#2C3E50",
    lineHeight: 22,
    fontStyle: "italic",
  },
  recommendationSection: {
    marginBottom: 25,
  },
  recommendedDish: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 6,
    height: 35,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E67E22",
    marginBottom: 10,
  },
  orderButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  orderButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  recentOrdersSection: {
    marginBottom: 20,
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
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
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  orderTable: {
    fontSize: 14,
    color: "#E67E22",
    fontWeight: "600",
  },
  orderDetails: {
    marginBottom: 12,
  },
  orderDish: {
    marginBottom: 8,
  },
  dishItemName: {
    fontSize: 14,
    color: "#2C3E50",
    marginBottom: 4,
  },
  dishMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  caloriesText: {
    fontSize: 12,
    color: "#4D5656",
  },
  spiceLevel: {
    flexDirection: "row",
  },
  moreItems: {
    fontSize: 12,
    color: "#4D5656",
    fontStyle: "italic",
  },
  viewDetailButton: {
    alignSelf: "flex-end",
  },
  viewDetailText: {
    fontSize: 14,
    color: "#3498DB",
    fontWeight: "600",
  },
})
