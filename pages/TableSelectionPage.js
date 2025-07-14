import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const tableList = Array.from({ length: 12 }, (_, i) => ({
  id: `table_${i + 1}`,
  name: `Table ${i + 1}`,
}));

const windowWidth = Dimensions.get("window").width;

export default function TableSelectionPage() {
  const navigation = useNavigation();
  const [disabledTableIds, setDisabledTableIds] = useState([]);

  useEffect(() => {
    const checkDisabledTables = async () => {
      const storedOrders = await AsyncStorage.getItem("paidOrders");
      const paidOrders = storedOrders ? JSON.parse(storedOrders) : [];
      const busyTables = paidOrders.map((order) => order.tableId);
      setDisabledTableIds(busyTables);
    };

    checkDisabledTables();
  }, []);

  const handleSelectTable = async (table) => {
    try {
      await AsyncStorage.setItem("selectedTable", table.id);
      await AsyncStorage.setItem("selectedTableName", table.name);
      await AsyncStorage.setItem("isGuest", "true");
      navigation.replace("Main");
    } catch (error) {
      console.error("Error selecting table:", error);
      Alert.alert("Error", "Unable to select table. Please try again.");
    }
  };

  const renderItem = ({ item }) => {
    const isDisabled = disabledTableIds.includes(item.id);
    return (
      <TableButton
        item={item}
        onPress={handleSelectTable}
        disabled={isDisabled}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.replace("Login")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FDEBD0" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Ionicons name="restaurant" size={32} color="#FDEBD0" />
          <Text style={styles.title}>Select Your Table</Text>
          <Text style={styles.subtitle}>Choose an available table to start dining</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#E67E22" }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#4D5656" }]} />
            <Text style={styles.legendText}>Occupied</Text>
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
      </View>
    </SafeAreaView>
  );
}

const TableButton = ({ item, onPress, disabled }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    if (!disabled) scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.tableButton, animatedStyle]}>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <LinearGradient
          colors={disabled
            ? ["#4D5656", "#2C3E50"]
            : ["#E67E22", "#D35400"]
          }
          style={styles.gradient}
          start={[0, 0]}
          end={[1, 1]}
        >
          <View style={styles.tableContent}>
            <Ionicons
              name={disabled ? "lock-closed" : "restaurant"}
              size={28}
              color="#FDEBD0"
            />
            <Text style={styles.tableText}>{item.name}</Text>
            {disabled && (
              <Text style={styles.statusText}>Occupied</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    marginHorizontal: 15,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
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
});