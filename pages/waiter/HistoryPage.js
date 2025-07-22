import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

const groupOrdersByDate = (orders) => {
  const grouped = {};

  orders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString("vi-VN");
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(order);
  });

  return Object.keys(grouped).map((date) => {
    const dailyOrders = grouped[date];
    const total = dailyOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce(
          (subtotal, item) => subtotal + item.price * item.quantity,
          0
        )
      );
    }, 0);
    return {
      title: date,
      orderCount: dailyOrders.length,
      totalAmount: total,
      data: dailyOrders,
    };
  }).sort((a, b) => new Date(b.title) - new Date(a.title));
};

export default function HistoryPage({ navigation }) {
  const [history, setHistory] = useState([]);
  const [allGrouped, setAllGrouped] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      const raw = await AsyncStorage.getItem("history");
      const parsed = raw ? JSON.parse(raw) : [];
      const grouped = groupOrdersByDate(parsed);
      setAllGrouped(grouped);
      setHistory(grouped);
      setLoading(false);
    };

    loadHistory();
  }, []);

  const filterByDate = (dateObj) => {
    const selected = dateObj.toLocaleDateString("vi-VN");
    const matched = allGrouped.find((group) => group.title === selected);
    if (matched) {
      setHistory([matched]);
    } else {
      setHistory([]);
    }
  };

  const handleDateChange = (event, date) => {
    setShowPicker(false);
    if (date) {
      setSelectedDate(date);
      filterByDate(date);
    }
  };

  const clearFilter = () => {
    setSelectedDate(null);
    setHistory(allGrouped);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "#28a745";
      case "Đã huỷ":
        return "#D35400";
      default:
        return "#4D5656";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Đã thanh toán":
        return "checkmark-circle";
      case "Đã huỷ":
        return "close-circle";
      default:
        return "time";
    }
  };

  const renderItem = ({ item }) => {
    const totalPrice = item.items.reduce(
      (sum, food) => sum + food.price * food.quantity,
      0
    );

    return (
      <View style={styles.orderItem}>
        <View style={styles.orderHeader}>
          <View style={styles.tableInfo}>
            <Ionicons name="restaurant" size={18} color="#E67E22" />
            <Text style={styles.orderTable}>{item.table}</Text>
          </View>
          <View style={styles.timeInfo}>
            <Ionicons name="time" size={14} color="#4D5656" />
            <Text style={styles.orderTime}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((food, i) => (
            <View key={i} style={styles.foodItemRow}>
              <Text style={styles.foodItem}>
                {food.name} x{food.quantity}
              </Text>
              <Text style={styles.foodPrice}>
                {food.price.toLocaleString()}đ
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>
              {totalPrice.toLocaleString()}đ
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons
              name={getStatusIcon(item.status)}
              size={14}
              color="#FDEBD0"
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.dateInfo}>
        <Ionicons name="calendar" size={20} color="#E67E22" />
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
      <View style={styles.sectionStats}>
        <Text style={styles.statsText}>
          {section.orderCount} orders • {section.totalAmount.toLocaleString()}đ
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E67E22" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>Track your past orders</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={styles.filterButton}
        >
          <Ionicons name="filter" size={24} color="#FDEBD0" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {selectedDate && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterText}>
              Showing orders for {selectedDate.toLocaleDateString("vi-VN")}
            </Text>
            <TouchableOpacity onPress={clearFilter} style={styles.clearFilter}>
              <Text style={styles.clearFilterText}>Show All</Text>
            </TouchableOpacity>
          </View>
        )}

        <SectionList
          sections={history}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={80} color="#4D5656" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptyText}>
                {selectedDate
                  ? "No orders found for the selected date"
                  : "Your order history will appear here"
                }
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDEBD0"
  },
  header: {
    backgroundColor: "#E67E22",
    paddingTop: 50,
    paddingBottom: 25,
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
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FDEBD0",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FDEBD0",
    opacity: 0.9,
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D35400",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  filterText: {
    fontSize: 14,
    color: "#2C3E50",
    fontWeight: "500",
  },
  clearFilter: {
    backgroundColor: "#E67E22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  clearFilterText: {
    color: "#FDEBD0",
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  sectionStats: {
    marginLeft: 28,
  },
  statsText: {
    fontSize: 14,
    color: "#4D5656",
    fontWeight: "500",
  },
  orderItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
    marginBottom: 12,
  },
  tableInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTable: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2C3E50",
    marginLeft: 6,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderTime: {
    color: "#4D5656",
    fontSize: 13,
    marginLeft: 4,
  },
  itemsList: {
    marginBottom: 12,
  },
  foodItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  foodItem: {
    fontSize: 14,
    color: "#2C3E50",
    flex: 1,
  },
  foodPrice: {
    fontSize: 14,
    color: "#E67E22",
    fontWeight: "600",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginRight: 8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D35400",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FDEBD0",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#4D5656",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDEBD0",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#2C3E50",
  },
});