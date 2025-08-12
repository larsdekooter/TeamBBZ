import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Appearance,
} from "react-native";
import Page from "../../components/Page";
import { textColor } from "@/constants/functions";
import { useState, useCallback } from "react";
import { getItem, removeItem, setItem } from "@/utils/AsyncStorage";
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "@react-navigation/native";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Socials from "@/components/Socials";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import SwipeModal from "@/components/SwipeModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [addSwimmerModalShown, setAddSwimmerModalShown] = useState(false);
  const [inputText, setInputText] = useState("");
  const [swimmer, setSwimmer] = useState("");
  const [infoModalShown, setInfoModalShown] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const getUsername = async () => {
        const us = await getItem("username");
        const em = await getItem("email");
        const sw = await getItem("swimmers");
        if (us && us.username !== username) {
          setUsername(us.username);
        }
        if (em && em.email !== email) {
          setEmail(em.email);
        }
        if (sw && sw.swimmer !== swimmer) {
          setSwimmer(sw.swimmer);
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
              paddingVertical: 10,
              paddingBottom: swimmer.length > 0 ? 10 : 0,
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
          {swimmer.length > 0 ? (
            <View
              style={{
                paddingHorizontal: 15,
                borderTopColor: "grey",
                borderTopWidth: 1,
                paddingVertical: 10,
                paddingBottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={[
                    textColor(colorScheme),
                    { textAlign: "left", flex: 1 },
                  ]}
                >
                  2e Zwemmer
                </Text>

                <Pressable
                  style={{
                    flex: 1,
                    alignItems: "center",
                    flexDirection: "row",
                  }}
                  onPress={() => setInfoModalShown(true)}
                >
                  <Text
                    style={[
                      textColor(colorScheme),
                      { textAlign: "right", flex: 1 },
                    ]}
                  >
                    {swimmer}
                  </Text>
                  <FontAwesome
                    name="info-circle"
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                    style={{ paddingHorizontal: 5, textAlign: "center" }}
                    size={15}
                  />
                </Pressable>
              </View>

              <ButtonComponent
                onPress={() => setAddSwimmerModalShown(true)}
                style={{ width: "90%", paddingVertical: 10, marginTop: 10 }}
              >
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  {swimmer.length > 1 ? "Wijzig 2e zwemmer" : "Zet 2e zwemmer"}
                </Text>
              </ButtonComponent>
            </View>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                borderTopColor: "grey",
                borderTopWidth: 1,
                marginTop: 10,
              }}
            >
              <ButtonComponent
                onPress={() => setAddSwimmerModalShown(true)}
                style={{ width: "90%", paddingVertical: 10, marginTop: 10 }}
              >
                <Text style={[textColor(colorScheme)]}>
                  {swimmer.length > 1 ? "Wijzig 2e zwemmer" : "Zet 2e zwemmer"}
                </Text>
              </ButtonComponent>
            </View>
          )}
          <Pressable
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              paddingTop: 10,
              marginTop: 10,
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onPress={async () => {
              await setItem("colorScheme", {
                colorScheme: colorScheme === "light" ? "dark" : "light",
              });
              Appearance.setColorScheme(
                colorScheme === "light" ? "dark" : "light"
              );
            }}
          >
            <Text style={[textColor(colorScheme)]}>Thema</Text>
            <FontAwesome
              name={colorScheme === "light" ? "sun-o" : "moon-o"}
              color={textColor(colorScheme).color}
              size={20}
            />
          </Pressable>
        </View>

        <Socials />

        <Modal
          animationType="slide"
          transparent
          visible={addSwimmerModalShown}
          onRequestClose={() => {
            setAddSwimmerModalShown(false);
          }}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
        >
          <GestureHandlerRootView style={styles.centeredView}>
            <View
              style={
                colorScheme === "light"
                  ? styles.modalLightView
                  : styles.modalDarkView
              }
            >
              <TextInput
                style={{
                  backgroundColor: "white",
                  width: 200,
                  marginVertical: 20,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  height: 40,
                  color: "#000",
                }}
                placeholder="Naam"
                id="username"
                onChangeText={(input) => {
                  setInputText(input ?? "");
                }}
                autoComplete="name"
              />
              <ButtonComponent
                style={{
                  paddingVertical: 10,
                  width: 200,
                  backgroundColor:
                    colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                  zIndex: 1000,
                }}
                onPress={async (e) => {
                  await setItem("swimmers", {
                    swimmer: inputText,
                  });
                  setAddSwimmerModalShown(false);
                  setSwimmer(inputText);
                }}
              >
                <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
                  Wijzig
                </Text>
              </ButtonComponent>
            </View>
          </GestureHandlerRootView>
        </Modal>
        <SwipeModal
          visible={infoModalShown}
          onClose={() => setInfoModalShown(false)}
          height={350}
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flex: 1,
          }}
        >
          <Text
            style={[
              textColor(colorScheme),
              { fontWeight: "bold", fontSize: 30 },
            ]}
          >
            2e zwemmer
          </Text>
          <Text style={[textColor(colorScheme)]}>
            Klik op je naam bij "profiel" om tussen jezelf en je 2e zwemmer te
            kiezen
          </Text>
          <ButtonComponent
            onPress={async () => {
              setSwimmer("");
              await removeItem("swimmers");
              setInfoModalShown(false);
            }}
            style={{
              width: "95%",
              paddingVertical: 10,
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
            }}
          >
            <Text
              style={{
                color: colorScheme === "dark" ? "#d76e72" : "#dd4345",
                fontWeight: "bold",
              }}
            >
              Verwijder 2e zwemmer
            </Text>
          </ButtonComponent>
          <ButtonComponent
            onPress={() => {
              setAddSwimmerModalShown(true);
              setInfoModalShown(false);
            }}
            style={{
              width: "95%",
              paddingVertical: 10,
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
            }}
          >
            <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
              Wijzig 2e zwemmer
            </Text>
          </ButtonComponent>
        </SwipeModal>
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

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalLightView: {
    margin: 20,
    backgroundColor: "#f3f5f6",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    borderColor: "#ef8b22",
    borderWidth: 1,
  },
  modalDarkView: {
    margin: 20,
    backgroundColor: "#2a3137",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    borderColor: "#ef8b22",
    borderWidth: 1,
  },
  button: {
    borderRadius: 20,
    padding: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});
