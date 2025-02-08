import { StatusBar } from "expo-status-bar";
import { StyleSheet, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Page({ children }: { children?: React.ReactNode }) {
  const colorScheme = useColorScheme();
  return (
    // <SafeAreaProvider>
    <SafeAreaView
      style={{
        backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
        flex: 1,
      }}
    >
      <StatusBar
        backgroundColor={colorScheme === "light" ? "#FFF" : "#181c20"}
      />
      <GestureHandlerRootView
        style={
          colorScheme === "light" ? stylesLight.container : stylesDark.container
        }
      >
        {children}
      </GestureHandlerRootView>
    </SafeAreaView>
    // </SafeAreaProvider>
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
    backgroundColor: "#181c20",
  },
  text: {
    color: "#FFF",
  },
});
