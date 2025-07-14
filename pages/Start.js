import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const StartScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);

  useEffect(() => {
    // Start animations
    fadeAnim.value = withTiming(1, { duration: 1000 });
    scaleAnim.value = withSequence(
      withTiming(1.1, { duration: 800 }),
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const checkLoginStatus = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken) {
      navigation.replace("Main");
    } else {
      navigation.replace("Login");
    }
  };

  return (
    <LinearGradient
      colors={["#E67E22", "#D35400", "#A04000"]}
      style={styles.container}
      start={[0, 0]}
      end={[1, 1]}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <View style={styles.iconWrapper}>
            <Ionicons name="restaurant" size={80} color="#FDEBD0" />
          </View>
          <Text style={styles.title}>BTN RESTAURANT</Text>
          <Text style={styles.emoji}>🍽️</Text>
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.subtitle}>
            Find, Add & Enjoy{'\n'}Delicious Dishes!
          </Text>

        </View>



        <TouchableOpacity style={styles.button} onPress={checkLoginStatus}>
          <LinearGradient
            colors={["#FDEBD0", "#FEF5E7"]}
            style={styles.buttonGradient}
            start={[0, 0]}
            end={[1, 0]}
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#E67E22" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for food lovers
          </Text>
        </View>
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(253, 235, 208, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(253, 235, 208, 0.3)",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FDEBD0",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  emoji: {
    fontSize: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 22,
    color: "#FDEBD0",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 28,
  },
  description: {
    fontSize: 16,
    color: "#FDEBD0",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 50,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    color: "#FDEBD0",
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  button: {
    width: "100%",
    marginBottom: 30,
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  buttonText: {
    color: "#E67E22",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    color: "#FDEBD0",
    fontSize: 14,
    opacity: 0.8,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(253, 235, 208, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(253, 235, 208, 0.1)",
  },
  decorativeCircle3: {
    position: "absolute",
    top: height * 0.3,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(253, 235, 208, 0.1)",
  },
});

export default StartScreen;