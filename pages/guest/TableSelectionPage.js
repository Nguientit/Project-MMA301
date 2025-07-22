"use client"

import { useEffect, useState } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { LinearGradient } from "expo-linear-gradient"
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"

const tableList = Array.from({ length: 12 }, (_, i) => ({
  id: `table_${i + 1}`,
  name: `Table ${i + 1}`,
}))

const windowWidth = Dimensions.get("window").width

export default function TableSelectionPage() {
  const navigation = useNavigation()
  const [disabledTableIds, setDisabledTableIds] = useState([])
  const [selectedTables, setSelectedTables] = useState([])

  useEffect(() => {
    const checkDisabledTables = async () => {
      const storedOrders = await AsyncStorage.getItem("paidOrders")
      const paidOrders = storedOrders ? JSON.parse(storedOrders) : []
      const busyTables = paidOrders.map((order) => order.tableId)
      setDisabledTableIds(busyTables)
    }

    checkDisabledTables()
  }, [])

  const handleSelectTable = (table) => {
    if (disabledTableIds.includes(table.id)) {
      Alert.alert("Bàn đã có khách", "Vui lòng chọn bàn khác.")
      return
    }

    setSelectedTables((prev) => {
      const isSelected = prev.some((t) => t.id === table.id)
      if (isSelected) {
        // Bỏ chọn bàn
        return prev.filter((t) => t.id !== table.id)
      } else {
        // Thêm bàn vào danh sách chọn
        return [...prev, table]
      }
    })
  }

  const handleConfirmSelection = async () => {
    if (selectedTables.length === 0) {
      Alert.alert("Chưa chọn bàn", "Vui lòng chọn ít nhất một bàn.")
      return
    }

    try {
      // Lưu thông tin các bàn đã chọn
      const tableIds = selectedTables.map((table) => table.id)
      const tableNames = selectedTables.map((table) => table.name)

      await AsyncStorage.setItem("selectedTables", JSON.stringify(tableIds))
      await AsyncStorage.setItem("selectedTableNames", JSON.stringify(tableNames))
      await AsyncStorage.setItem("isGuest", "true")

      // Để tương thích với code cũ, lưu bàn đầu tiên làm selectedTable
      await AsyncStorage.setItem("selectedTable", selectedTables[0].id)
      await AsyncStorage.setItem("selectedTableName", selectedTables[0].name)

      navigation.replace("Main")
    } catch (error) {
      console.error("Error selecting tables:", error)
      Alert.alert("Lỗi", "Không thể chọn bàn. Vui lòng thử lại.")
    }
  }

  const renderItem = ({ item }) => {
    const isDisabled = disabledTableIds.includes(item.id)
    const isSelected = selectedTables.some((table) => table.id === item.id)

    return <TableButton item={item} onPress={handleSelectTable} disabled={isDisabled} selected={isSelected} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.replace("Login")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="restaurant" size={32} color="#FDEBD0" />
          <Text style={styles.title}>Chọn bàn của bạn</Text>
          <Text style={styles.subtitle}>
            {selectedTables.length > 0 ? `Đã chọn ${selectedTables.length} bàn` : "Chọn một hoặc nhiều bàn trống"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E67E22" }]} />
            <Text style={styles.legendText}>Có thể chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#27AE60" }]} />
            <Text style={styles.legendText}>Đã chọn</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#4D5656" }]} />
            <Text style={styles.legendText}>Đã có khách</Text>
          </View>
        </View>

        <FlatList
          data={tableList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* Selected Tables Info */}
        {selectedTables.length > 0 && (
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedTitle}>Bàn đã chọn:</Text>
            <Text style={styles.selectedList}>{selectedTables.map((table) => table.name).join(", ")}</Text>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, selectedTables.length === 0 && styles.confirmButtonDisabled]}
          onPress={handleConfirmSelection}
          disabled={selectedTables.length === 0}
        >
          <LinearGradient
            colors={selectedTables.length > 0 ? ["#E67E22", "#D35400"] : ["#4D5656", "#2C3E50"]}
            style={styles.confirmGradient}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FDEBD0" />
            <Text style={styles.confirmText}>Xác nhận ({selectedTables.length} bàn)</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const TableButton = ({ item, onPress, disabled, selected }) => {
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    if (!disabled) scale.value = withSpring(1)
  }

  const getGradientColors = () => {
    if (disabled) return ["#4D5656", "#2C3E50"]
    if (selected) return ["#27AE60", "#229954"]
    return ["#E67E22", "#D35400"]
  }

  const getIcon = () => {
    if (disabled) return "lock-closed"
    if (selected) return "checkmark-circle"
    return "restaurant"
  }

  return (
    <Animated.View style={[styles.tableButton, animatedStyle]}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <LinearGradient colors={getGradientColors()} style={styles.gradient} start={[0, 0]} end={[1, 1]}>
          <View style={styles.tableContent}>
            <Ionicons name={getIcon()} size={28} color="#FDEBD0" />
            <Text style={styles.tableText}>{item.name}</Text>
            {disabled && <Text style={styles.statusText}>Đã có khách</Text>}
            {selected && !disabled && <Text style={styles.statusText}>Đã chọn</Text>}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0",
  },
  header: {
    backgroundColor: "#E67E22",
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#FDEBD0",
    opacity: 0.9,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 25,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#2C3E50",
    fontWeight: "500",
  },
  list: {
    alignItems: "center",
    paddingBottom: 20,
  },
  tableButton: {
    width: windowWidth / 3 - 24,
    height: 120,
    margin: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  tableContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  tableText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginTop: 8,
    textAlign: "center",
  },
  statusText: {
    fontSize: 12,
    color: "#FDEBD0",
    opacity: 0.8,
    marginTop: 4,
    textAlign: "center",
  },
  selectedInfo: {
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
  selectedTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 5,
  },
  selectedList: {
    fontSize: 14,
    color: "#4D5656",
  },
  confirmButton: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginLeft: 10,
  },
})
