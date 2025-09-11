import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/enums";

export default function Layout() {
  const colorScheme = useColorScheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor:
            colorScheme === "dark" ? Colors.DarkBackground : "#FFF",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
