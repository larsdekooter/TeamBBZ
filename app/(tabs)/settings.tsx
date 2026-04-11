import {
  Dimensions,
  Modal,
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
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "@react-navigation/native";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Socials from "@/components/Socials";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import SwipeModal from "@/components/SwipeModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Colors, Profile } from "@/constants/enums";
import * as SQLite from "expo-sqlite";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";

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
        const profile = await TeamBBZSQLite.db.getFirstAsync<Profile>(
          "SELECT * FROM profile",
        );
        const secondSwimmer = await TeamBBZSQLite.db.getFirstAsync<{
          id: Number;
          name: string;
        }>("SELECT * FROM swimmers");
        if (profile?.username && profile.username !== username) {
          setUsername(profile.username);
        }
        if (profile?.email && profile.email !== email) {
          setEmail(profile.email);
        }
        if (secondSwimmer?.name && secondSwimmer.name !== swimmer) {
          setSwimmer(secondSwimmer.name);
        }
      };
      getUsername();
    }, []),
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
            <Text style={textColor(colorScheme)}>E-mail</Text>
            <Text style={textColor(colorScheme)}>{email}</Text>
          </View>
          <View style={{ paddingHorizontal: 15 }}>
            <ButtonComponent
              onPress={async () => {
                await TeamBBZSQLite.sql`DELETE FROM profile WHERE id = 0`;
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
              await TeamBBZSQLite.sql`UPDATE settings SET darkMode = ${colorScheme === "dark" ? 0 : 1} WHERE darkMode = ${colorScheme === "dark" ? 1 : 0}`;
              Appearance.setColorScheme(
                colorScheme === "light" ? "dark" : "light",
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
                    colorScheme === "dark"
                      ? Colors.ModalDarkBackground
                      : Colors.ModalLightBackground,
                  zIndex: 1000,
                }}
                onPress={async (e) => {
                  await TeamBBZSQLite.sql`UPDATE swimmers SET name = ${inputText} WHERE name = ${swimmer}`;
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
              await TeamBBZSQLite.sql`DELETE FROM swimmers WHERE name = ${swimmer}`;
              setInfoModalShown(false);
            }}
            style={{
              width: "95%",
              paddingVertical: 10,
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.ModalDarkBackground
                  : Colors.ModalLightBackground,
            }}
          >
            <Text
              style={{
                color:
                  colorScheme === "dark"
                    ? Colors.DarkmodeRed
                    : Colors.LightmodeRed,
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
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.ModalDarkBackground
                  : Colors.ModalLightBackground,
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
    backgroundColor: Colors.ModalLightBackground,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    borderColor: Colors.Orange,
    borderWidth: 1,
  },
  modalDarkView: {
    margin: 20,
    backgroundColor: Colors.ModalDarkBackground,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    borderColor: Colors.Orange,
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
