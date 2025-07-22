"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import { recipes } from "../../data"

const { width } = Dimensions.get("window")

const TodayComboPage = () => {
  const navigation = useNavigation()
  const [todayCombos, setTodayCombos] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [eventMessage, setEventMessage] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    setCurrentDate(getCurrentDate())
    await generateEventMessage()
    await generateTodayCombos()
  }

  const getCurrentDate = () => {
    const today = new Date()
    return today.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const generateEventMessage = async () => {
    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const dayOfWeek = today.getDay()

    let message = ""

    if (month === 9 && day >= 10 && day <= 17) {
      message = "🌕 Sắp tới là Tết Trung Thu, hãy thưởng thức những món đặc biệt cùng gia đình!"
    } else if (month === 12 && day >= 20) {
      message = "🎄 Mùa Giáng Sinh đang đến, cùng chia sẻ bữa ăn ấm áp!"
    } else if (month === 1 && day <= 15) {
      message = "🧧 Chúc Mừng Năm Mới! Khởi đầu năm với những món ăn may mắn!"
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      message = "🎉 Cuối tuần vui vẻ! Thời gian hoàn hảo để thử những combo mới!"
    } else if (dayOfWeek === 1) {
      message = "💪 Thứ Hai năng lượng! Bắt đầu tuần mới với những món ăn bổ dưỡng!"
    } else if (dayOfWeek === 5) {
      message = "🎊 Thứ Sáu rồi! Chuẩn bị cho cuối tuần với những combo thú vị!"
    } else {
      message = "☀️ Chúc bạn có một ngày tuyệt vời với những món ăn ngon!"
    }

    setEventMessage(message)
  }

  const generateTodayCombos = async () => {
    try {
      const today = new Date()
      const dayOfWeek = today.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      const combos = [
        {
          id: "combo_today_1",
          title: isWeekend ? "Combo Gia Đình Cuối Tuần" : "Combo Năng Lượng Tuần Mới",
          dishes: getRandomDishes(3),
          aiExplanation: isWeekend
            ? "Phù hợp cho gia đình 4-6 người, thưởng thức cùng nhau trong không khí ấm cúng cuối tuần"
            : "Cung cấp đủ năng lượng cho một ngày làm việc hiệu quả, cân bằng dinh dưỡng và hương vị",
          price: calculateComboPrice(3),
          originalPrice: calculateComboPrice(3) + 20000,
          badge: isWeekend ? "Gia đình" : "Năng lượng",
          color: isWeekend ? "#E74C3C" : "#27AE60",
        },
        {
          id: "combo_today_2",
          title: "Combo Đặc Sản Ấn Độ",
          dishes: getSpicyDishes(2),
          aiExplanation:
            "Trải nghiệm hương vị đậm đà của ẩm thực Ấn Độ truyền thống, phù hợp cho những ai yêu thích vị cay nồng",
          price: calculateComboPrice(2),
          originalPrice: calculateComboPrice(2) + 15000,
          badge: "Đặc sản",
          color: "#E67E22",
        },
        {
          id: "combo_today_3",
          title: "Combo Healthy & Light",
          dishes: getHealthyDishes(3),
          aiExplanation:
            "Lựa chọn hoàn hảo cho những ai quan tâm đến sức khỏe, ít calories nhưng vẫn đầy đủ dinh dưỡng",
          price: calculateComboPrice(3),
          originalPrice: calculateComboPrice(3) + 18000,
          badge: "Healthy",
          color: "#27AE60",
        },
        {
          id: "combo_today_4",
          title: "Combo Tiết Kiệm",
          dishes: getBudgetDishes(2),
          aiExplanation:
            "Giá cả phải chăng nhưng vẫn đảm bảo chất lượng và hương vị, phù hợp cho sinh viên và người trẻ",
          price: calculateComboPrice(2) - 10000,
          originalPrice: calculateComboPrice(2),
          badge: "Tiết kiệm",
          color: "#3498DB",
        },
      ]

      setTodayCombos(combos)
    } catch (error) {
      console.error("Error generating combos:", error)
      Alert.alert("Lỗi", "Không thể tạo combo hôm nay")
    }
  }

  const getRandomDishes = (count) => {
    const validDishes = recipes.filter((dish) => dish && dish.name && dish.image && dish.price)
    const shuffled = [...validDishes].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const getSpicyDishes = (count) => {
    const spicyDishes = recipes.filter(
      (dish) =>
        dish &&
        dish.name &&
        dish.image &&
        dish.price &&
        (dish.name.toLowerCase().includes("tikka") ||
          dish.name.toLowerCase().includes("masala") ||
          (dish.description && dish.description.toLowerCase().includes("cay"))),
    )

    if (spicyDishes.length >= count) {
      return spicyDishes.slice(0, count)
    } else {
      // Nếu không đủ món cay, bổ sung bằng món ngẫu nhiên
      const remainingCount = count - spicyDishes.length
      const otherDishes = getRandomDishes(remainingCount)
      return [...spicyDishes, ...otherDishes]
    }
  }

  const getHealthyDishes = (count) => {
    const healthyDishes = recipes.filter(
      (dish) => dish && dish.name && dish.image && dish.price && dish.calories && dish.calories < 350,
    )

    if (healthyDishes.length >= count) {
      return healthyDishes.slice(0, count)
    } else {
      const remainingCount = count - healthyDishes.length
      const otherDishes = getRandomDishes(remainingCount)
      return [...healthyDishes, ...otherDishes]
    }
  }

  const getBudgetDishes = (count) => {
    const budgetDishes = recipes.filter((dish) => dish && dish.name && dish.image && dish.price && dish.price < 50000)

    if (budgetDishes.length >= count) {
      return budgetDishes.slice(0, count)
    } else {
      const remainingCount = count - budgetDishes.length
      const otherDishes = getRandomDishes(remainingCount)
      return [...budgetDishes, ...otherDishes]
    }
  }

  const calculateComboPrice = (dishCount) => {
    return dishCount * 65000
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await generateEventMessage()
    await generateTodayCombos()
    setRefreshing(false)
  }

  const handleAddComboToCart = async (combo) => {
    try {
      const storedCart = await AsyncStorage.getItem("cartItems")
      const cart = storedCart ? JSON.parse(storedCart) : []

      const comboItem = {
        id: combo.id,
        name: combo.title,
        price: combo.price,
        image: combo.dishes[0]?.image || "/placeholder.svg?height=100&width=100",
        description: combo.aiExplanation,
        quantity: 1,
        isCombo: true,
        comboItems: combo.dishes,
      }

      const existing = cart.find((item) => item.id === combo.id)
      let updatedCart

      if (existing) {
        updatedCart = cart.map((item) => (item.id === combo.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        updatedCart = [...cart, comboItem]
      }

      await AsyncStorage.setItem("cartItems", JSON.stringify(updatedCart))
      Alert.alert("Thành công", `${combo.title} đã được thêm vào giỏ hàng!`)
    } catch (error) {
      console.error("Add combo to cart error:", error)
      Alert.alert("Lỗi", "Không thể thêm combo vào giỏ hàng")
    }
  }

  const renderComboCard = (combo) => (
    <View key={combo.id} style={styles.comboCard}>
      <View style={styles.comboHeader}>
        <View style={styles.comboTitleContainer}>
          <Text style={styles.comboTitle}>{combo.title}</Text>
          <View style={[styles.comboBadge, { backgroundColor: combo.color }]}>
            <Text style={styles.comboBadgeText}>{combo.badge}</Text>
          </View>
        </View>
        <View style={styles.comboPriceContainer}>
          <Text style={styles.comboOriginalPrice}>{combo.originalPrice.toLocaleString()}đ</Text>
          <Text style={styles.comboPrice}>{combo.price.toLocaleString()}đ</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dishesContainer}>
        {combo.dishes.map((dish, index) => (
          <TouchableOpacity
            key={index}
            style={styles.dishCard}
            onPress={() => navigation.navigate("RecipeDetail", { recipe: dish })}
          >
            <Image source={{ uri: dish.image || "/placeholder.svg?height=80&width=80" }} style={styles.dishImage} />
            <Text style={styles.dishName} numberOfLines={2}>
              {dish.name || "Món ăn"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.aiExplanationContainer}>
        <Ionicons name="sparkles" size={16} color="#E67E22" />
        <Text style={styles.aiExplanationText}>{combo.aiExplanation}</Text>
      </View>

      <View style={styles.comboActions}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate("RecipeDetail", { recipe: combo.dishes[0] })}
        >
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => handleAddComboToCart(combo)}>
          <Ionicons name="add" size={20} color="#FDEBD0" />
          <Text style={styles.addButtonText}>Thêm combo</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Combo hôm nay</Text>
          <Text style={styles.headerSubtitle}>Gợi ý đặc biệt từ AI</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#E67E22"]} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.eventMessage}>{eventMessage}</Text>
        </View>

        <View style={styles.combosContainer}>{todayCombos.map(renderComboCard)}</View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingRefreshButton} onPress={handleRefresh}>
        <Ionicons name="refresh" size={24} color="#FDEBD0" />
      </TouchableOpacity>
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
  dateContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  eventMessage: {
    fontSize: 16,
    color: "#4D5656",
    lineHeight: 22,
  },
  combosContainer: {
    gap: 20,
  },
  comboCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  comboHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  comboTitleContainer: {
    flex: 1,
    marginRight: 15,
  },
  comboTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 8,
  },
  comboBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comboBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  comboPriceContainer: {
    alignItems: "flex-end",
  },
  comboOriginalPrice: {
    fontSize: 14,
    color: "#4D5656",
    textDecorationLine: "line-through",
    marginBottom: 2,
  },
  comboPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#D35400",
  },
  dishesContainer: {
    marginBottom: 15,
  },
  dishCard: {
    width: 100,
    marginRight: 15,
    alignItems: "center",
  },
  dishImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  dishName: {
    fontSize: 12,
    color: "#2C3E50",
    textAlign: "center",
    fontWeight: "500",
  },
  aiExplanationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FDEBD0",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  aiExplanationText: {
    fontSize: 14,
    color: "#4D5656",
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  comboActions: {
    flexDirection: "row",
    gap: 12,
  },
  detailButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#E67E22",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E67E22",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#E67E22",
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FDEBD0",
    marginLeft: 8,
  },
  floatingRefreshButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
})

export default TodayComboPage
