import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Appearance,
  Platform,
} from "react-native";
import Page from "../../components/Page";
import { filterDuplicates, textColor } from "@/constants/functions";
import { useState, useCallback, useEffect } from "react";
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "expo-router";
import { nativeApplicationVersion, nativeBuildVersion } from "expo-application";
import Socials from "@/components/Socials";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Switch from "@/components/Switch";
import { Colors, Profile, Time } from "@/constants/enums";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import AbsoluteDropdown from "@/components/AbsoluteDropdown";
import SegmentedControl from "@expo/ui/community/segmented-control";
import { Picker } from "@expo/ui/community/picker";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [swimmers, setSwimmers] = useState<string[]>([]);
  const [profile, setProfile] = useState<Profile | { username: ""; email: "" }>(
    { username: "", email: "" },
  );
  const [devModeChecked, setDevModeChecked] = useState(false);
  const [autoSaveTimesIndex, setAutoSaveTimesIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const getUsername = async () => {
        const profileDB = await TeamBBZSQLite.db.getFirstAsync<Profile>(
          "SELECT * FROM profile",
        );
        if (profileDB) {
          setProfile(profileDB);
          setDevModeChecked(profileDB.devMode === 1);
          setAutoSaveTimesIndex(
            profileDB.autoSaveTimes ? profileDB.autoSaveTimes : 0,
          );
        }
        const times = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
        const sws = times.map((time) => time.swimmer).filter(filterDuplicates);
        setSwimmers(sws.filter((s) => s !== profileDB?.username));
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
                setProfile({ username: "", email: "" });
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
              paddingBottom: 10,
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

          <View
            style={{
              flexDirection: "column",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              paddingTop: 10,
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <Text style={[textColor(colorScheme), { textAlign: "center" }]}>
              Voeg tijden toe vanuit de resultatenpagina
            </Text>
            {Platform.OS === "ios" && <View style={{ paddingVertical: 5 }} />}
            <SegmentedControl
              values={["Nooit", "Bijwerken", "Altijd"]}
              selectedIndex={autoSaveTimesIndex}
              onChange={async (event) => {
                await TeamBBZSQLite.sql`UPDATE profile SET autoSaveTimes = ${event.nativeEvent.selectedSegmentIndex} WHERE id = 1`;
                setAutoSaveTimesIndex(event.nativeEvent.selectedSegmentIndex);
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 15,
              borderTopColor: "grey",
              borderTopWidth: 1,
              alignItems: "center",
              paddingTop: 5,
            }}
          >
            <Text
              style={[textColor(colorScheme), { textAlign: "left", flex: 1 }]}
            >
              Dev Mode
            </Text>
            <Switch
              onCheckedChange={async () => {
                await TeamBBZSQLite.sql`UPDATE profile SET devMode = ${devModeChecked ? 0 : 1} WHERE id = 1`;
                setDevModeChecked((prev) => !prev);
              }}
              value={devModeChecked}
              colors={{
                checkedTrackColor:
                  colorScheme === "dark"
                    ? Colors.TransparantDarkOrange
                    : Colors.Orange,
                checkedThumbColor:
                  colorScheme === "dark" ? Colors.Orange : Colors.DarkOrange,
              }}
            />
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
