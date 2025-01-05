import { Dimensions, Platform, Text, useColorScheme, View } from "react-native";
import Page from "../../components/Page";
import { textColor } from "@/constants/functions";
import { useState, useCallback } from "react";
import { getItem, removeItem } from "@/utils/AsyncStorage";
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "@react-navigation/native";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Socials from "@/components/Socials";

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
            // paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 5,
              paddingHorizontal: 15,
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
              paddingHorizontal: 15,
            }}
          >
            <Text style={textColor(colorScheme)}>Email</Text>
            <Text style={textColor(colorScheme)}>{email}</Text>
          </View>
          <View style={{ paddingHorizontal: 15 }}>
            <ButtonComponent
              onPress={async () => {
                await removeItem("username");
                await removeItem("email");
                setUsername("");
                setEmail("");
              }}
              style={{
                paddingHorizontal: 15,
                marginVertical: 10,
                paddingVertical: 10,
              }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Log uit
              </Text>
            </ButtonComponent>
          </View>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              paddingTop: 10,
            }}
          >
            <Text
              style={[textColor(colorScheme), { textAlign: "left", flex: 1 }]}
            >
              Versie
            </Text>
            <Text
              style={[textColor(colorScheme), { textAlign: "right", flex: 1 }]}
            >
              {nativeApplicationVersion} - {nativeBuildVersion}
            </Text>
          </View>
        </View>

        <Socials />
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
