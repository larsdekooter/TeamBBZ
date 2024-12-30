import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, StyleSheet, useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#ef8b22",
        animation: "shift",
        tabBarStyle: {
          backgroundColor: colorScheme == "dark" ? "#181c20" : "#FFF",
        },
        sceneStyle: {
          backgroundColor: colorScheme === "dark" ? "#181c20" : "#FFF",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiel",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="club"
        options={{
          title: "TeamBBZ",
          tabBarIcon: ({ color, focused }) => {
            return (
              <Image
                source={
                  colorScheme === "dark"
                    ? require("../../assets/images/teambbz.png")
                    : require("../../assets/images/teambbz-dark.png")
                }
                style={{
                  height: 28,
                  width: 28,
                  tintColor: !focused ? "grey" : undefined,
                }}
              />
            );
          },
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Instellingen",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
