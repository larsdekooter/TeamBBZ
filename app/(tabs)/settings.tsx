import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Appearance,
} from "react-native";
import Page from "../../components/Page";
import { filterDuplicates, textColor } from "@/constants/functions";
import { useState, useCallback } from "react";
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "@react-navigation/native";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Socials from "@/components/Socials";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { Colors, Profile, Time } from "@/constants/enums";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import AbsoluteDropdown from "@/components/AbsoluteDropdown";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [swimmers, setSwimmers] = useState<string[]>([]);
  const [profile, setProfile] = useState<
    Profile | { username: ""; email: ""; secondSwimmer: "" }
  >({ username: "", email: "", secondSwimmer: "" });

  useFocusEffect(
    useCallback(() => {
      const getUsername = async () => {
        const profileR = await TeamBBZSQLite.db.getFirstAsync<Profile>(
          "SELECT * FROM profile",
        );
        if (profileR) setProfile(profileR);
        const times = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
        const sws = times.map((time) => time.swimmer).filter(filterDuplicates);
        setSwimmers(sws.filter((s) => s !== profileR?.username));
      };
      getUsername();
    }, []),
  );

  if (profile.username.length > 0) {
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
            <Text style={textColor(colorScheme)}>{profile.username}</Text>
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
            <Text style={textColor(colorScheme)}>{profile.email}</Text>
          </View>
          <View style={{ paddingHorizontal: 15 }}>
            <ButtonComponent
              onPress={async () => {
                await TeamBBZSQLite.sql`DELETE FROM profile WHERE id = 1`;
                setProfile({ username: "", email: "", secondSwimmer: "" });
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
              paddingBottom: 10,
              alignItems: "center",
            }}
          >
            <Text
              style={[textColor(colorScheme), { textAlign: "left", flex: 1 }]}
            >
              2e zwemmer
            </Text>
            <AbsoluteDropdown
              data={[
                profile.secondSwimmer ? profile.secondSwimmer : undefined,
                ...swimmers,
              ]
                .filter(filterDuplicates)
                .filter((v) => v !== undefined)}
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 6,
                    marginVertical: 5,
                    padding: 5,
                  }}
                >
                  <Text style={[textColor(colorScheme)]}>{item}</Text>
                </View>
              )}
              style={{ width: "60%" }}
              dropdownStyle={{
                backgroundColor:
                  colorScheme === "light"
                    ? Colors.LightBackground
                    : Colors.DarkBackground,
              }}
              textStyle={{ width: "80%" }}
              closeWhenSelected
              onPress={async (item) => {
                if (item.length === 0) return;
                await TeamBBZSQLite.sql`UPDATE profile SET secondSwimmer = ${item} WHERE id = 1`;
                setProfile({ ...profile, secondSwimmer: item } as Profile);
              }}
              emptySelected={!profile.secondSwimmer}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              paddingVertical: 10,
              paddingBottom: 10,
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
          <Pressable
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              paddingTop: 10,
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
              onPress={async () => {
                await TeamBBZSQLite.sql`DELETE FROM times WHERE id > 0`;
              }}
              style={{ width: "90%", paddingVertical: 10, marginTop: 10 }}
            >
              <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                Verwijder alle tijden
              </Text>
            </ButtonComponent>
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
