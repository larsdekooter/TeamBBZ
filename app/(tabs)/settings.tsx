import { Dimensions, Text, useColorScheme, View } from "react-native";
import Page from "../../components/Page";
import { textColor } from "@/constants/functions";
import { useEffect, useState, useCallback } from "react";
import { getItem, removeItem } from "@/utils/AsyncStorage";
import ButtonComponent from "@/components/Button";
import { useFocusEffect } from "@react-navigation/native";

import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useFocusEffect(
    useCallback(() => {
      const getUsername = async () => {
        const us = await getItem("username");
        const em = await getItem("email");
        if (us) {
          setUsername(us.username);
        }
        if (em) {
          setEmail(em.email);
        }
      };
      getUsername();
    }, [])
  );

  if (username.length > 0) {
    return (
      <Page>
        <View
          style={{
            borderColor: "grey",
            borderWidth: 1,
            borderRadius: 6,
            width: Dimensions.get("window").width * 0.95,
            // display: "flex",
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 5,
            }}
          >
            <Text style={textColor(colorScheme)}>Naam</Text>
            <Text style={textColor(colorScheme)}>{username}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 5,
            }}
          >
            <Text style={textColor(colorScheme)}>Email</Text>
            <Text style={textColor(colorScheme)}>{email}</Text>
          </View>
          <ButtonComponent
            onPress={async () => {
              await removeItem("username");
              await removeItem("email");
              setUsername("");
              setEmail("");
            }}
            marginVertical={10}
            paddingVertical={10}
          >
            <Text style={{ fontWeight: "bold" }}>Log uit</Text>
          </ButtonComponent>
        </View>
        <Text
          style={{
            color: "grey",
            textAlign: "left",
            width: "95%",
            fontStyle: "italic",
          }}
        >
          Build: {nativeApplicationVersion} - {nativeBuildVersion}
        </Text>
      </Page>
    );
  } else {
    return (
      <Page>
        <Text style={textColor(colorScheme)}>
          Ga naar "Profiel" om in te loggen
        </Text>
        <Text
          style={{
            color: "grey",
            textAlign: "left",
            width: "55%",
            fontStyle: "italic",
          }}
        >
          Build: {nativeApplicationVersion} - {nativeBuildVersion}
        </Text>
      </Page>
    );
  }
}
