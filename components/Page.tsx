import { StatusBar } from "expo-status-bar";
import { StyleProp, StyleSheet, useColorScheme, ViewStyle } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/enums";

export default function Page({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <GestureHandlerRootView
          style={[
            colorScheme === "light"
              ? stylesLight.container
              : stylesDark.container,
            style,
          ]}
        >
          {children}
        </GestureHandlerRootView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const stylesLight = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  text: {
    color: "#000",
  },
});

const stylesDark = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.DarkBackground,
  },
  text: {
    color: "#FFF",
  },
});
