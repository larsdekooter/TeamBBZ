import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";

export default function Layout() {
  const colorScheme = useColorScheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: colorScheme === "dark" ? "#181c20" : "#FFF",
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
