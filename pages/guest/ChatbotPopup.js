"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import GeminiAIService from "../services/GeminiAIService"
import { recipes } from "../../data"

const { width, height } = Dimensions.get("window")

const ChatbotPopup = () => {
  const navigation = useNavigation()
  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef(null)

  useEffect(() => {
    if (isVisible && messages.length === 0) {
      setTimeout(() => {
        addBotMessage(
          "Xin chào! Tôi là AI trợ lý của BTN Restaurant 🤖\n\nTôi có thể giúp bạn tìm món ăn phù hợp và gửi thông tin chi tiết ngay trong chat!\n\nHãy thử hỏi: 'Tôi muốn ăn cay một chút' hoặc 'Có món gì nhẹ nhàng?' hoặc 'Combo hôm nay có gì?'",
          "text",
        )
      }, 500)
    }
  }, [isVisible])

  const addBotMessage = (text, type = "text", dishes = []) => {
    const newMessage = {
      id: Date.now(),
      text,
      type,
      dishes,
      isBot: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    scrollToBottom()
  }

  const addUserMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      type: "text",
      isBot: false,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    scrollToBottom()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const processUserMessage = async (userInput) => {
    setIsTyping(true)

    try {
      // Kiểm tra xem có phải yêu cầu tìm món ăn hoặc combo không
      const searchKeywords = [
        "tìm",
        "có món",
        "gợi ý",
        "cay",
        "ngọt",
        "nhẹ",
        "healthy",
        "rẻ",
        "đắt",
        "combo",
        "hôm nay",
      ]
      const isSearchQuery = searchKeywords.some((keyword) => userInput.toLowerCase().includes(keyword))

      if (isSearchQuery) {
        // Tìm món ăn phù hợp
        const foundDishes = findRelevantDishes(userInput)

        // Luôn đảm bảo có ít nhất 3 món để hiển thị
        let dishesToShow = foundDishes
        if (dishesToShow.length < 3) {
          // Nếu không đủ món theo tiêu chí, thêm món ngẫu nhiên
          const remainingDishes = recipes.filter((dish) => !foundDishes.find((f) => f.id === dish.id))
          const shuffled = remainingDishes.sort(() => 0.5 - Math.random())
          dishesToShow = [...foundDishes, ...shuffled].slice(0, 3)
        }

        const textResponse = await GeminiAIService.generateResponse(userInput)

        // Thêm delay để tạo cảm giác AI đang suy nghĩ
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setIsTyping(false)
        // Luôn gửi với type "text_with_cards" để hiển thị món ăn
        addBotMessage(textResponse, "text_with_cards", dishesToShow.slice(0, 3))
      } else {
        // Câu hỏi thông thường nhưng vẫn gợi ý một số món
        const aiResponse = await GeminiAIService.generateResponse(userInput)
        const randomDishes = recipes.sort(() => 0.5 - Math.random()).slice(0, 3)

        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsTyping(false)

        // Thêm gợi ý món ăn vào cuối response
        const responseWithSuggestion = aiResponse + "\n\nBạn có muốn xem một số món ăn được gợi ý không?"
        addBotMessage(responseWithSuggestion, "text_with_cards", randomDishes)
      }
    } catch (error) {
      console.error("Error processing message:", error)
      setIsTyping(false)
      // Ngay cả khi lỗi, vẫn hiển thị một số món ăn
      const randomDishes = recipes.sort(() => 0.5 - Math.random()).slice(0, 3)
      addBotMessage(
        "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Tuy nhiên, đây là một số món ăn bạn có thể quan tâm! 😅",
        "text_with_cards",
        randomDishes,
      )
    }
  }

  const findRelevantDishes = (query) => {
    const input = query.toLowerCase()
    let foundDishes = []

    if (input.includes("combo") || input.includes("hôm nay")) {
      // Tạo combo ngẫu nhiên cho hôm nay
      const mainDishes = recipes.filter((dish) => dish.category === "Lunch" || dish.category === "Dinner")
      const beverages = recipes.filter((dish) => dish.category === "Beverage")
      const desserts = recipes.filter((dish) => dish.category === "Dess")

      const randomMain = mainDishes[Math.floor(Math.random() * mainDishes.length)]
      const randomBeverage = beverages[Math.floor(Math.random() * beverages.length)]
      const randomDessert = desserts[Math.floor(Math.random() * desserts.length)]

      foundDishes = [randomMain, randomBeverage, randomDessert].filter(Boolean)
    } else if (input.includes("cay") || input.includes("spicy")) {
      foundDishes = recipes.filter(
        (dish) =>
          dish.name.toLowerCase().includes("tikka") ||
          dish.name.toLowerCase().includes("masala") ||
          (dish.description && dish.description.toLowerCase().includes("cay")),
      )
    } else if (input.includes("nhẹ") || input.includes("healthy")) {
      foundDishes = recipes.filter((dish) => (dish.calories || 300) < 350)
    } else if (input.includes("ngọt") || input.includes("sweet")) {
      foundDishes = recipes.filter((dish) => dish.category === "Dess")
    } else if (input.includes("rẻ") || input.includes("budget")) {
      foundDishes = recipes.filter((dish) => (dish.price || 50000) < 50000)
    } else if (input.includes("đồ uống") || input.includes("beverage")) {
      foundDishes = recipes.filter((dish) => dish.category === "Beverage")
    } else {
      // Tìm kiếm chung
      foundDishes = recipes.filter(
        (dish) =>
          dish.name.toLowerCase().includes(input) ||
          (dish.description && dish.description.toLowerCase().includes(input)) ||
          dish.category.toLowerCase().includes(input),
      )
    }

    return foundDishes
  }

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = inputText.trim()
      addUserMessage(userMessage)
      setInputText("")

      await processUserMessage(userMessage)
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderFoodCard = (dish) => (
    <TouchableOpacity
      key={dish.id}
      style={styles.foodCard}
      onPress={() => {
        setIsVisible(false)
        navigation.navigate("RecipeDetail", { recipe: dish })
      }}
    >
      <Image source={{ uri: dish.image }} style={styles.foodCardImage} />
      <View style={styles.foodCardContent}>
        <Text style={styles.foodCardName} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.foodCardDesc} numberOfLines={2}>
          {dish.description || "Món ăn ngon tại BTN Restaurant"}
        </Text>
        <View style={styles.foodCardFooter}>
          <Text style={styles.foodCardPrice}>{(dish.price || 50000)?.toLocaleString()}đ</Text>
          <View style={styles.foodCardButton}>
            <Text style={styles.foodCardButtonText}>Chi tiết</Text>
            <Ionicons name="arrow-forward" size={14} color="#FDEBD0" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderMessage = (message) => (
    <View
      key={message.id}
      style={[styles.messageContainer, message.isBot ? styles.botMessageContainer : styles.userMessageContainer]}
    >
      <View style={[styles.messageBubble, message.isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.messageText, message.isBot ? styles.botText : styles.userText]}>{message.text}</Text>

        {/* Render food cards if available */}
        {message.type === "text_with_cards" && message.dishes && message.dishes.length > 0 && (
          <View style={styles.foodCardsContainer}>{message.dishes.map(renderFoodCard)}</View>
        )}

        <Text style={[styles.timeText, message.isBot ? styles.botTimeText : styles.userTimeText]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  )

  const quickActions = [
    { text: "Món cay", query: "Tôi muốn ăn cay một chút" },
    { text: "Món nhẹ", query: "Có món gì nhẹ nhàng?" },
    { text: "Giá rẻ", query: "Món nào giá rẻ nhất?" },
    { text: "Đồ uống", query: "Có đồ uống gì?" },
    { text: "Tráng miệng", query: "Món tráng miệng nào ngon?" },
    { text: "Combo hôm nay", query: "Combo hôm nay có gì?" },
  ]

  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity style={styles.floatingButton} onPress={() => setIsVisible(true)}>
        <Ionicons name="chatbubbles" size={28} color="#FDEBD0" />
        <View style={styles.aiIndicator}>
          <Text style={styles.aiText}>AI</Text>
        </View>
      </TouchableOpacity>

      {/* Chat Modal */}
      <Modal visible={isVisible} transparent animationType="slide" onRequestClose={() => setIsVisible(false)}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={styles.chatContainer}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={20} color="#FDEBD0" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>AI Trợ lý Ẩm thực</Text>
                  <Text style={styles.headerSubtitle}>
                    {isTyping ? "Đang tìm món cho bạn..." : "Có thể gửi thông tin món ăn"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#4D5656" />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(renderMessage)}

              {isTyping && (
                <View style={[styles.messageContainer, styles.botMessageContainer]}>
                  <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
                    <ActivityIndicator size="small" color="#E67E22" />
                    <Text style={styles.typingText}>AI đang tìm món phù hợp...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickActionButton}
                    onPress={() => {
                      addUserMessage(action.query)
                      processUserMessage(action.query)
                    }}
                  >
                    <Text style={styles.quickActionText}>{action.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Hỏi AI về món ăn, combo, sở thích..."
                  placeholderTextColor="#4D5656"
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || isTyping}
                >
                  <Ionicons name="send" size={20} color={inputText.trim() ? "#FDEBD0" : "#4D5656"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E67E22",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  aiIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#27AE60",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aiText: {
    color: "#FDEBD0",
    fontSize: 10,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  chatContainer: {
    backgroundColor: "#FDEBD0",
    height: height * 0.85,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E67E22",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#FDEBD0",
    opacity: 0.8,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 15,
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: width * 0.85,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#E67E22",
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: "#2C3E50",
  },
  userText: {
    color: "#FDEBD0",
  },
  timeText: {
    fontSize: 11,
    marginTop: 5,
    alignSelf: "flex-end",
  },
  botTimeText: {
    color: "#4D5656",
    opacity: 0.6,
  },
  userTimeText: {
    color: "#FDEBD0",
    opacity: 0.8,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  typingText: {
    fontSize: 14,
    color: "#4D5656",
    marginLeft: 10,
    fontStyle: "italic",
  },
  foodCardsContainer: {
    marginTop: 15,
    gap: 12,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#FDEBD0",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E67E22",
  },
  foodCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  foodCardContent: {
    flex: 1,
  },
  foodCardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  foodCardDesc: {
    fontSize: 12,
    color: "#4D5656",
    marginBottom: 8,
  },
  foodCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodCardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E67E22",
  },
  foodCardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E67E22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  foodCardButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FDEBD0",
    marginRight: 4,
  },
  quickActions: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  quickActionButton: {
    backgroundColor: "#FDEBD0",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E67E22",
  },
  quickActionText: {
    fontSize: 12,
    color: "#E67E22",
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 45,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonActive: {
    backgroundColor: "#E67E22",
  },
  sendButtonInactive: {
    backgroundColor: "transparent",
  },
})

export default ChatbotPopup
