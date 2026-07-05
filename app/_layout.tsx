import { Stack } from "expo-router/stack";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/enums";
import { useEffect } from "react";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import { handleFileUpload, handleTimeUpload } from "@/constants/functions";
import * as Linking from "expo-linking";

export default function Layout() {
  useEffect(() => {
    const initDatabase = async () => {
      await TeamBBZSQLite.prepare();
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY NOT NULL, username TEXT NOT NULL, email TEXT NOT NULL, birthdate TEXT NOT NULL, club TEXT NOT NULL, country TEXT NOT NULL, secondSwimmer TEXT NULL) `;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS swimmers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NULL)`;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, darkMode INTEGER NOT NULL)`;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS times (id INTEGER PRIMARY KEY NOT NULL, event TEXT NOT NULL, time TEXT NOT NULL, poolSize TEXT NOT NULL, points NUMBER NOT NULL, swimmer NOT NULL, date TEXT NULL, meet TEXT NULL, location TEXT NULL)`;
      if (!(await TeamBBZSQLite.db.getFirstAsync("SELECT * FROM settings")))
        await TeamBBZSQLite.sql`INSERT INTO settings (darkMode) VALUES (${colorScheme === "dark" ? 1 : 0})`;
    };

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

    initDatabase();
    return () => sub.remove();
  }, []);
  const colorScheme = useColorScheme();
  return (
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
  );
}
