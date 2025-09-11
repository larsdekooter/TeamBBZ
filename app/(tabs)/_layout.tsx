import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Image, StyleSheet, useColorScheme, View } from "react-native";
import { Colors } from "@/constants/enums";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const iconSize = 35;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.Orange,
        animation: "shift",
        tabBarShowLabel: false,
        tabBarLabelStyle: { height: 0 },
        tabBarStyle: {
          backgroundColor:
            colorScheme == "dark" ? Colors.DarkBackground : "#FFF",
          height: 60,
        },
        sceneStyle: {
          backgroundColor:
            colorScheme === "dark" ? Colors.DarkBackground : "#FFF",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={iconSize}
              name="home"
              color={color}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiel",
          tabBarIcon: ({ color }) => (
            <FontAwesome5
              size={iconSize}
              name="swimmer"
              color={color}
              style={[styles.icon, { transform: [{ rotateY: "180deg" }] }]}
            />
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
                style={[
                  {
                    height: iconSize,
                    width: iconSize,
                    tintColor: !focused ? "grey" : undefined,
                  },
                  styles.icon,
                ]}
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
            <FontAwesome
              size={iconSize}
              name="cog"
              color={color}
              style={styles.icon}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 40,
    marginTop: 20,
    marginBottom: 10,
    width: 40,
    // backgroundColor: "red",
  },
});
