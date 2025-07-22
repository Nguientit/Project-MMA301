import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import MainTabNavigator from "./navigation/MainTabNavigator";
import CreateRecipeScreen from "./pages/services/CreateRecipe";
import Login from "./pages/guest/Login";
import RecipeByCategory from "./pages/guest/RecipeByCategory";
import RecipeDetail from "./pages/guest/RecipeDetail";
import Signup from "./pages/guest/Signup";
import Start from "./pages/guest/Start";
import TableSelectionPage from "./pages/guest/TableSelectionPage";
import OrderReceiverDashboard from "./pages/receiver/OrderReceiverDashboard";
import WaiterDashboard from "./pages/waiter/WaiterDashboard"; 
import HistoryPage from "./pages/waiter/HistoryPage"; 
import LunchRecommendationsPage from "./pages/guest/LunchRecommendationsPage";
import TodayComboPage from "./pages/guest/TodayComboPage";
import NotificationsPage from "./pages/guest/NotificationsPage";
import WaiterMessagingPage from "./pages/waiter/WaiterMessagingPage";
import DishStatisticsPage from "./pages/guest/DishStatisticsPage"

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="RecipeByCategory" component={RecipeByCategory} />
        <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
        <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
        <Stack.Screen name="TableSelection" component={TableSelectionPage} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="LunchRecommendationsPage" component={LunchRecommendationsPage} />
        <Stack.Screen
          name="OrderReceiverDashboard"
          component={OrderReceiverDashboard}
        />
        <Stack.Screen name="HistoryPage" component={HistoryPage} />
        <Stack.Screen name="TodayComboPage" component={TodayComboPage} />
        <Stack.Screen name="NotificationsPage" component={NotificationsPage} />
        <Stack.Screen name="DishStatisticsPage" component={DishStatisticsPage} />

        <Stack.Screen name="WaiterDashboard" component={WaiterDashboard} />
        <Stack.Screen name="WaiterMessagingPage" component={WaiterMessagingPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
