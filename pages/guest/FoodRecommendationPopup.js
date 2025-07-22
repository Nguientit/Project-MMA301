"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Ionicons from "react-native-vector-icons/Ionicons"
import { LinearGradient } from "expo-linear-gradient"
import { recipes } from "../../data"

const { width, height } = Dimensions.get("window")

const FoodRecommendationPopup = ({ visible, onClose, onSelectDish }) => {
  const [recommendations, setRecommendations] = useState([])
  const [selectedDish, setSelectedDish] = useState(null)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (visible) {
      generateRecommendations()
    }
  }, [visible])

  const generateRecommendations = async () => {
    try {
      // Lấy lịch sử đơn hàng để phân tích sở thích
      const historyData = await AsyncStorage.getItem("history")
      const orderHistory = historyData ? JSON.parse(historyData) : []

      // Phân tích category yêu thích
      const categoryCount = {}
      orderHistory.forEach((order) => {
        order.items.forEach((item) => {
          const category = item.category || "Main Course"
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })
      })

      const favoriteCategory =
        Object.keys(categoryCount).length > 0
          ? Object.keys(categoryCount).reduce((a, b) => (categoryCount[a] > categoryCount[b] ? a : b))
          : null

      // Gợi ý dựa trên thời gian
      const hour = new Date().getHours()
      let timeBasedCategory = ""

      if (hour >= 6 && hour < 11) {
        timeBasedCategory = "Beverage"
      } else if (hour >= 11 && hour < 14) {
        timeBasedCategory = "Lunch"
      } else if (hour >= 17 && hour < 21) {
        timeBasedCategory = "Dinner"
      } else {
        timeBasedCategory = "Dessert"
      }

      // Tạo danh sách gợi ý
      const recommendedDishes = []

      // Ưu tiên category yêu thích
      if (favoriteCategory) {
        const favoriteDishes = recipes.filter((recipe) => recipe.category === favoriteCategory)
        recommendedDishes.push(...favoriteDishes.slice(0, 2))
      }

      // Thêm món theo thời gian
      const timeDishes = recipes.filter((recipe) => recipe.category === timeBasedCategory)
      recommendedDishes.push(...timeDishes.slice(0, 2))

      // Thêm món ngẫu nhiên nếu chưa đủ
      if (recommendedDishes.length < 4) {
        const randomDishes = recipes
          .filter((recipe) => !recommendedDishes.some((r) => r.id === recipe.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 4 - recommendedDishes.length)
        recommendedDishes.push(...randomDishes)
      }

      // Loại bỏ trùng lặp và giới hạn 4 món
      const uniqueRecommendations = recommendedDishes
        .filter((dish, index, self) => index === self.findIndex((d) => d.id === dish.id))
        .slice(0, 4)

      setRecommendations(uniqueRecommendations)
    } catch (error) {
      console.error("Error generating recommendations:", error)
      // Fallback: gợi ý ngẫu nhiên
      const randomRecommendations = recipes.sort(() => 0.5 - Math.random()).slice(0, 4)
      setRecommendations(randomRecommendations)
    }
  }

  const handleSelectDish = (dish) => {
    setSelectedDish(dish)
    setShowNoteInput(true)
  }

  const handleAddToCart = async () => {
    try {
      const dishWithNote = {
        ...selectedDish,
        quantity: quantity,
        note: note.trim(),
        addedAt: new Date().toISOString(),
      }

      await onSelectDish(dishWithNote)

      // Reset state
      setSelectedDish(null)
      setShowNoteInput(false)
      setNote("")
      setQuantity(1)

      Alert.alert("Thành công", `${selectedDish.name} đã được thêm vào giỏ hàng!`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      Alert.alert("Lỗi", "Không thể thêm món vào giỏ hàng")
    }
  }

  const renderRecommendationCard = (dish, index) => (
    <TouchableOpacity key={dish.id} style={styles.recommendationCard} onPress={() => handleSelectDish(dish)}>
      <Image source={{ uri: dish.image }} style={styles.dishImage} />
      <LinearGradient colors={["transparent", "rgba(44, 62, 80, 0.8)"]} style={styles.imageOverlay} />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        <View style={styles.dishDetails}>
          <View style={styles.priceContainer}>
            <Text style={styles.dishPrice}>{dish.price?.toLocaleString()}đ</Text>
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time" size={12} color="#FDEBD0" />
            <Text style={styles.cookingTime}>{dish.cookingTime}</Text>
          </View>
        </View>
        <View style={styles.caloriesContainer}>
          <Ionicons name="fitness" size={12} color="#FDEBD0" />
          <Text style={styles.calories}>{dish.calories} kcal</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {!showNoteInput ? (
            <>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Ionicons name="bulb" size={24} color="#E67E22" />
                  <Text style={styles.title}>Gợi ý món ăn cho bạn</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color="#4D5656" />
                </TouchableOpacity>
              </View>

              {/* Recommendations */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Dựa trên sở thích và thời gian hiện tại</Text>
                <View style={styles.recommendationsGrid}>
                  {recommendations.map((dish, index) => renderRecommendationCard(dish, index))}
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              {/* Note Input Screen */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setShowNoteInput(false)
                    setSelectedDish(null)
                    setNote("")
                    setQuantity(1)
                  }}
                >
                  <Ionicons name="arrow-back" size={24} color="#4D5656" />
                </TouchableOpacity>
                <Text style={styles.title}>Thêm ghi chú</Text>
              </View>

              <ScrollView style={styles.content}>
                {selectedDish && (
                  <View style={styles.selectedDishContainer}>
                    <Image source={{ uri: selectedDish.image }} style={styles.selectedDishImage} />
                    <View style={styles.selectedDishInfo}>
                      <Text style={styles.selectedDishName}>{selectedDish.name}</Text>
                      <Text style={styles.selectedDishPrice}>{selectedDish.price?.toLocaleString()}đ</Text>
                      <Text style={styles.selectedDishDescription} numberOfLines={3}>
                        {selectedDish.description}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Quantity Selector */}
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>Số lượng:</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Ionicons name="remove" size={20} color="#E67E22" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity(quantity + 1)}>
                      <Ionicons name="add" size={20} color="#E67E22" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Note Input */}
                <View style={styles.noteContainer}>
                  <Text style={styles.noteLabel}>Ghi chú đặc biệt:</Text>
                  <TextInput
                    style={styles.noteInput}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Ví dụ: Ít cay, không hành, thêm rau..."
                    placeholderTextColor="#4D5656"
                    multiline
                    maxLength={200}
                  />
                  <Text style={styles.noteCounter}>{note.length}/200</Text>
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                  <Ionicons name="cart" size={20} color="#FDEBD0" />
                  <Text style={styles.addToCartText}>
                    Thêm vào giỏ hàng - {(selectedDish?.price * quantity)?.toLocaleString()}đ
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FDEBD0",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: height * 0.85,
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
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#4D5656",
    textAlign: "center",
    marginBottom: 20,
  },
  recommendationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recommendationCard: {
    width: (width - 60) / 2,
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dishImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  dishInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginBottom: 4,
  },
  dishDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  priceContainer: {
    flex: 1,
  },
  dishPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cookingTime: {
    fontSize: 10,
    color: "#FDEBD0",
    marginLeft: 4,
  },
  caloriesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calories: {
    fontSize: 10,
    color: "#FDEBD0",
    marginLeft: 4,
  },
  selectedDishContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedDishImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  selectedDishInfo: {
    flex: 1,
  },
  selectedDishName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  selectedDishPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E67E22",
    marginBottom: 4,
  },
  selectedDishDescription: {
    fontSize: 12,
    color: "#4D5656",
    lineHeight: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FDEBD0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    minWidth: 30,
    textAlign: "center",
  },
  noteContainer: {
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
  noteLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: "#2C3E50",
    minHeight: 80,
    textAlignVertical: "top",
  },
  noteCounter: {
    fontSize: 12,
    color: "#4D5656",
    textAlign: "right",
    marginTop: 5,
  },
  addToCartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E67E22",
    borderRadius: 15,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginLeft: 10,
  },
})

export default FoodRecommendationPopup
