import { recipes } from "../../data"

const GEMINI_API_KEYS = [
  "AIzaSyDfBE_AOHP2djt966q3MCWAhaDmfX1cswk",
  "AIzaSyCLdLXsChr-UdyxKOE_7fb7D4pXV30sH2M",
  "AIzaSyB6HLEvnswWT7atzfIyCIN-OXUpNTWYB9Q",
  "AIzaSyBmqDcr6r9wRCEiDXTxdh5EskpgJARh6Pw",
  "AIzaSyDGEnd-oHyNAl9q7H0bZkOZoGHowxMGyoM",
  "AIzaSyDHj9VvAiH7DMYwNRFFlPcuWQnTGFxeDBs",
  "AIzaSyDq6LyLflpUdZbO-oA0aiy_PdozqoH66bY",
  "AIzaSyD56T_DXBRTUOJPJhAK_SkyqDbKKCUPhvo"
]

import { GoogleGenerativeAI } from "@google/generative-ai"

class GeminiAIService {
  constructor() {
    this.keys = GEMINI_API_KEYS
    this.currentKeyIndex = 0
    this.restaurantData = recipes
    this.modelName = "gemini-2.0-flash"
    this.systemPrompt = this.buildSystemPrompt()
  }

  getCurrentAPIKey() {
    return this.keys[this.currentKeyIndex]
  }

  rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length
  }

  buildSystemPrompt() {
    const menuData = this.restaurantData.map((dish) => ({
      id: dish.id,
      name: dish.name,
      category: dish.category,
      price: dish.price,
      description: dish.description,
      calories: dish.calories,
      cookingTime: dish.cookingTime,
      ingredients: dish.ingredients?.map((ing) => ing.name).join(", ") || "N/A",
    }))

    return `Bạn là AI trợ lý của BTN Restaurant - nhà hàng Ấn Độ. Bạn có kiến thức chuyên sâu về thực đơn và có thể:

1. Gợi ý món ăn dựa trên sở thích (cay, ngọt, nhẹ, đậm đà...)
2. Tìm kiếm món theo tên, nguyên liệu, giá cả
3. So sánh dinh dưỡng và calories
4. Tư vấn combo phù hợp
5. Thông tin nhà hàng

THỰC ĐƠN HIỆN TẠI:
${JSON.stringify(menuData, null, 2)}

HƯỚNG DẪN TRẢ LỜI:
- Luôn dựa trên dữ liệu thực đơn trên
- Khi người dùng hỏi về món cay: gợi ý Gà Tikka Masala, các món có gia vị
- Khi hỏi món nhẹ: gợi ý Dal Tadka, Mango Lassi
- Khi hỏi món chính: gợi ý Biryani, Palak Paneer
- Luôn bao gồm giá tiền và thông tin chi tiết
- Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
- Nếu không tìm thấy món phù hợp, gợi ý món tương tự

Hãy trả lời như một chuyên gia ẩm thực!`
  }

  async generateResponse(userMessage, retryCount = 0) {
    const currentKey = this.getCurrentAPIKey()
    const genAI = new GoogleGenerativeAI(currentKey)

    try {
      const model = genAI.getGenerativeModel({ model: this.modelName })

      const chat = await model.startChat({
        history: [],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      })

      const result = await chat.sendMessage(
        `${this.systemPrompt}\n\nCâu hỏi của khách hàng: ${userMessage}`
      )

      return result.response.text()

    } catch (error) {
      const errMsg = error?.message || ""

      const isQuotaError = errMsg.includes("429") || errMsg.includes("exceeded your current quota")
      const isOverload = errMsg.includes("model is overloaded") || errMsg.includes("503") || errMsg.includes("timeout")

      if ((isQuotaError || isOverload) && retryCount < this.keys.length - 1) {
        this.rotateKey()
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log(`🔄 Thử lại với key mới (#${this.currentKeyIndex + 1})...`)
        return this.generateResponse(userMessage, retryCount + 1)
      }


      return this.getFallbackResponse(userMessage)
    }
  }

  getFallbackResponse(userMessage) {
    const input = userMessage.toLowerCase()

    // Tìm kiếm cơ bản trong dữ liệu
    if (input.includes("cay") || input.includes("spicy")) {
      const spicyDishes = this.restaurantData.filter(
        (dish) =>
          dish.name.toLowerCase().includes("tikka") ||
          dish.name.toLowerCase().includes("masala") ||
          dish.description.toLowerCase().includes("cay"),
      )

      if (spicyDishes.length > 0) {
        let response = "Đây là những món cay tôi gợi ý:\n\n"
        spicyDishes.forEach((dish, index) => {
          response += `${index + 1}. ${dish.name}\n`
          response += `   Giá: ${dish.price?.toLocaleString()}đ\n`
          response += `   ${dish.description}\n\n`
        })
        return response
      }
    }

    if (input.includes("nhẹ") || input.includes("healthy")) {
      const lightDishes = this.restaurantData.filter(
        (dish) => dish.calories < 300 || dish.name.toLowerCase().includes("dal") || dish.category === "Beverage",
      )

      if (lightDishes.length > 0) {
        let response = "Những món nhẹ nhàng cho bạn:\n\n"
        lightDishes.forEach((dish, index) => {
          response += `${index + 1}. ${dish.name}\n`
          response += `   Calories: ${dish.calories} kcal\n`
          response += `   Giá: ${dish.price?.toLocaleString()}đ\n\n`
        })
        return response
      }
    }

    // Fallback mặc định
    return "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Bạn có thể thử hỏi:\n\n• 'Có món gì cay?'\n• 'Gợi ý món nhẹ'\n• 'Món chính nào ngon?'\n• 'Đồ uống có gì?'\n\nHoặc liên hệ nhân viên để được hỗ trợ tốt hơn!"
  }

  // Tìm kiếm món ăn theo từ khóa
  searchDishes(keyword) {
    const searchTerm = keyword.toLowerCase()
    return this.restaurantData.filter(
      (dish) =>
        dish.name.toLowerCase().includes(searchTerm) ||
        dish.description.toLowerCase().includes(searchTerm) ||
        dish.category.toLowerCase().includes(searchTerm) ||
        (dish.ingredients && dish.ingredients.some((ing) => ing.name.toLowerCase().includes(searchTerm))),
    )
  }

  // Gợi ý món theo sở thích
  getRecommendationsByPreference(preference) {
    const pref = preference.toLowerCase()

    if (pref.includes("cay") || pref.includes("spicy")) {
      return this.restaurantData.filter(
        (dish) =>
          dish.name.toLowerCase().includes("tikka") ||
          dish.name.toLowerCase().includes("masala") ||
          dish.description.toLowerCase().includes("cay"),
      )
    }

    if (pref.includes("ngọt") || pref.includes("sweet")) {
      return this.restaurantData.filter(
        (dish) =>
          dish.category === "Dessert" ||
          dish.name.toLowerCase().includes("lassi") ||
          dish.name.toLowerCase().includes("gulab"),
      )
    }

    if (pref.includes("nhẹ") || pref.includes("light")) {
      return this.restaurantData.filter(
        (dish) => dish.calories < 300 || dish.category === "Beverage" || dish.name.toLowerCase().includes("dal"),
      )
    }

    return []
  }

  // Format thông tin món ăn
  formatDishInfo(dishes) {
    if (dishes.length === 0) {
      return "Không tìm thấy món ăn phù hợp."
    }

    let response = `Tìm thấy ${dishes.length} món phù hợp:\n\n`
    dishes.slice(0, 5).forEach((dish, index) => {
      response += `${index + 1}. ${dish.name}\n`
      response += `   💰 Giá: ${dish.price?.toLocaleString()}đ\n`
      response += `   ⏱️ Thời gian: ${dish.cookingTime}\n`
      response += `   🔥 Calories: ${dish.calories} kcal\n`
      response += `   📝 ${dish.description}\n\n`
    })

    if (dishes.length > 5) {
      response += `Và ${dishes.length - 5} món khác...`
    }

    return response
  }
}

export default new GeminiAIService()
