import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/enums";
import { useEffect } from "react";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import { handleFileUpload, handleTimeUpload } from "@/constants/functions";
import * as Linking from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { TeamBBZSQLiteProvider } from "@/constants/context/TeamBBZSQLiteContext";
import * as Updates from "expo-updates";

export default function Layout() {
  if (process.env.APP_VARIANT !== "development") {
    const { isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
      if (isUpdatePending) Updates.reloadAsync();
    }, [isUpdatePending]);
  }

  useEffect(() => {
    async function handleUrl(url: string) {
      try {
        const text = await handleFileUpload(url);
        if (text) {
          await handleTimeUpload(text);
        }
      } catch (e) {
        console.error(e);
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url?.startsWith("content://")) {
        handleUrl(url);
      }
    });

    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.startsWith("content://")) {
        handleUrl(url);
      }
    });

    return () => sub.remove();
  }, []);
  const colorScheme = useColorScheme();
  return (
    <TeamBBZSQLiteProvider>
      <Stack
        screenOptions={{
          contentStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.DarkBackground
                : Colors.LightBackground,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TeamBBZSQLiteProvider>
  );
}
