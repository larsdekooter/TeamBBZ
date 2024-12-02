import { Text, useColorScheme } from "react-native";
import Page from "../../components/Page";
import { textColor } from "@/constants/functions";
import { useEffect, useState, useCallback } from "react";
import { getItem, removeItem } from "@/utils/AsyncStorage";
import ButtonComponent from "@/components/Button";
import { useFocusEffect } from "@react-navigation/native";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState("");

  useFocusEffect(
    useCallback(() => {
      const getUsername = async () => {
        const us = await getItem("username");
        if (us) {
          setUsername(us.username);
        }
      };
      getUsername();
    }, [])
  );

  if (username.length > 0) {
    return (
      <Page>
        <Text style={textColor(colorScheme)}>Logged in as {username}</Text>
        <ButtonComponent
          onPress={async () => {
            await removeItem("username");
            setUsername("");
          }}
        >
          <Text style={textColor(colorScheme === "dark")}>Log uit</Text>
        </ButtonComponent>
      </Page>
    );
  } else {
    return (
      <Page>
        <Text style={textColor(colorScheme)}>
          Ga naar "Profiel" om in te loggen
        </Text>
      </Page>
    );
  }
}
