import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Page from "../../components/Page";
import {
  calculateProgression,
  getAthleteData,
  getProgression,
  getSpecialityData,
  textColor,
} from "../../constants/functions";
import ButtonComponent from "@/components/Button";
import { useFocusEffect } from "@react-navigation/native";
import { Fragment, useCallback, useState } from "react";
import { getItem, setItem, clear } from "@/utils/AsyncStorage";
import { AthleteIdRegex } from "@/constants/regex";
import { AthleteData } from "@/constants/types";
import PbTable from "@/components/PbTable";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MeetsTable from "@/components/MeetTable";
import { SwimrakingEventId } from "@/constants/enums";
import RadarChart from "@/components/RadarChart";
import LineChart from "@/components/LineChart";
import Dropdown from "@/components/Dropdown";
import CheckBox from "@/components/Checkbox";

enum Tabs {
  Pbs = 1,
  Records = 2,
  Meets = 3,
  Biografy = 4,
  Speciality = 5,
}

export default function Profile() {
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [athleteData, setAthleteData] = useState<AthleteData>(
    {} as AthleteData
  );
  const [modalShown, setModalShown] = useState(false);
  const [usernameSet, setUsernameSet] = useState("");
  const [activeTab, setActiveTab] = useState(Tabs.Pbs);
  const [emailSet, setEmailSet] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as number[]);
  const [labels, setLabels] = useState([] as string[]);
  const [shouldShow25, setShouldShow25] = useState(false);

  async function fetchUser() {
    const response = await getItem("username");
    if (response === null) {
      setUsername("");
    } else {
      setUsername(response.username);
      const athleteWithUsername = await (
        await fetch(
          `https://www.swimrankings.net/index.php?&internalRequest=athleteFind&athlete_clubId=-1&athlete_gender=-1&athlete_lastname=${response.username.replace(
            " ",
            "%20"
          )}&athlete_firstname=`
        )
      ).text();
      const table = athleteWithUsername.split("<tr");
      table.splice(0, 2);
      const athleteId = table
        .find((t) => !t.includes("*"))
        ?.match(AthleteIdRegex)![0];
      if (athleteId) {
        const athletePage = await (
          await fetch(
            `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}`
          )
        ).text();
        const meetsPage = await (
          await fetch(
            `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}&athletePage=MEET`
          )
        ).text();
        const aData = getAthleteData(athletePage, meetsPage, athleteId);
        setAthleteData(aData);
        const history25mFreestyle = await getProgression(
          SwimrakingEventId["25m vrije slag"],
          athleteId,
          "25m"
        );
        setData(
          history25mFreestyle.map(({ points }) => parseInt(points.points))
        );
        setLabels(history25mFreestyle.map(({ year }) => year));
      } else {
        Alert.alert(`'${username}' is niet gevonden in SwimRankings!`);
      }
    }
  }

  useFocusEffect(
    useCallback(() => {
      const getI = async () => {
        await fetchUser();
      };
      getI();
    }, [])
  );

  if (!(username.length > 0)) {
    return (
      <Page>
        <Text style={textColor(colorScheme)}>
          Login om statistieken te zien
        </Text>
        <ButtonComponent onPress={() => setModalShown(true)}>
          <Text style={textColor(colorScheme === "dark")}>Login</Text>
        </ButtonComponent>

        <Modal
          animationType="slide"
          transparent
          visible={modalShown}
          onRequestClose={() => {
            setModalShown(false);
          }}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            width: Dimensions.get("window").width,
            height: Dimensions.get("window").height,
          }}
        >
          <View style={styles.centeredView}>
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
                }}
                placeholder="Naam"
                id="username"
                onChangeText={(input) => {
                  setUsernameSet(input);
                }}
              />
              <TextInput
                style={{
                  backgroundColor: "white",
                  width: 200,
                  marginVertical: 40,
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  height: 40,
                }}
                placeholder="Email"
                id="email"
                onChangeText={(input) => setEmailSet(input)}
                autoComplete="email"
              />
              <ButtonComponent
                onPress={async () => {
                  if (!(usernameSet.length > 0)) {
                    return Alert.alert("Voer een gebruikersnaam in!");
                  } else if (!(emailSet.length > 0)) {
                    return Alert.alert("Voor een email address in!");
                  } else {
                    await setItem("username", { username: usernameSet });
                    setUsername(usernameSet);
                    await setItem("email", { email: emailSet });
                    setEmailSet(emailSet);
                    setModalShown(false);
                    await fetchUser();
                  }
                }}
              >
                <Text>Login</Text>
              </ButtonComponent>
            </View>
          </View>
        </Modal>
      </Page>
    );
  } else {
    if (athleteData.name) {
      return (
        <Page>
          <Text
            style={{
              ...textColor(colorScheme),
              position: "absolute",
              zIndex: 99,
              top: 50,
              textAlign: "center",
            }}
            onPress={fetchUser}
          >{`${athleteData.name} - ${athleteData.birthYear} \n${athleteData.nation} - ${athleteData.club}`}</Text>
          <View
            style={{
              marginTop: 100,
              flexDirection: "row",
              borderBottomWidth: 1,
              borderColor: "grey",
              width: Dimensions.get("window").width,
              display: "flex",
              justifyContent: "space-around",
              paddingBottom: 5,
            }}
          >
            <ButtonComponent
              onPress={() => {
                setActiveTab(Tabs.Pbs);
              }}
            >
              <Text
                style={{
                  ...textColor(colorScheme === "dark"),
                  fontWeight: "bold",
                }}
              >
                PR's
              </Text>
            </ButtonComponent>
            <ButtonComponent onPress={() => setActiveTab(Tabs.Meets)}>
              <Text
                style={{
                  ...textColor(colorScheme === "dark"),
                  fontWeight: "bold",
                }}
              >
                Wedstrijden
              </Text>
            </ButtonComponent>
            <ButtonComponent
              onPress={async () => {
                setActiveTab(Tabs.Speciality);
                getSpecialityData(athleteData);
              }}
            >
              <Text
                style={{
                  ...textColor(colorScheme === "dark"),
                  fontWeight: "bold",
                }}
              >
                Specialiteit
              </Text>
            </ButtonComponent>
          </View>
          {activeTab === Tabs.Pbs && (
            <PbTable
              top={0}
              data={athleteData.pbs.map((pb) => {
                return {
                  key: `${pb.event} - ${pb.poolSize} - ${pb.date}`,
                  title: {
                    distance: pb.event,
                    poolSize: pb.poolSize,
                    time: pb.time,
                  },
                  id: SwimrakingEventId[
                    pb.event as keyof typeof SwimrakingEventId
                  ],
                };
              })}
              athleteData={athleteData}
            />
          )}
          {activeTab === Tabs.Meets && (
            <MeetsTable
              top={0}
              athleteData={athleteData}
              data={athleteData.meets}
            />
          )}
          {activeTab === Tabs.Speciality && (
            <ScrollView
              contentContainerStyle={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              nestedScrollEnabled
            >
              <RadarChart
                data={getSpecialityData(athleteData, shouldShow25)}
                size={300}
                axes={["Vlinder", "Rug", "School", "Vrij", "Wissel"]}
                rings={4}
                fillColor="rgba(162, 94, 23, 0.5)"
                strokeColor="#ef8b22"
              />
              <Pressable
                style={{
                  flexDirection: "row",
                  width: Dimensions.get("window").width,
                  paddingHorizontal: 20,
                  display: "flex",
                  alignItems: "center",
                }}
                onPress={() => setShouldShow25(!shouldShow25)}
              >
                <CheckBox checked={shouldShow25} /*onPress={() => setShouldShow25(!setShouldShow25)}*//>
                <View style={{ width: 10 }} />
                <Text style={textColor(colorScheme)}>Inclusief 25m tijden</Text>
              </Pressable>

              <LineChart
                data={data}
                labels={labels}
                size={{ width: Dimensions.get("window").width, height: 300 }}
                lineColor="rgba(162, 94, 23, 0.8)"
                pointColor="#ef8b22"
              />
              <Dropdown
                data={athleteData.pbs
                  .filter(({ points }) => points !== "-")
                  .map(
                    (pb) =>
                      pb.event + " " + (pb.poolSize === "25m" ? "SC" : "LC")
                  )
                  .filter((e) => !e.includes("split"))}
                onPress={async (item) => {
                  setLoading(true);
                  const progression = await getProgression(
                    SwimrakingEventId[
                      item
                        .match(/[^LC|SC]/gm)!
                        .join("")
                        .trim() as keyof typeof SwimrakingEventId
                    ],
                    athleteData.id,
                    item.includes("LC") ? "50m" : "25m"
                  );
                  setData(
                    progression.map(({ points }) => parseInt(points.points))
                  );
                  setLabels(progression.map(({ year }) => year));
                  setLoading(false);
                }}
                renderItem={({ item, index }) => {
                  return (
                    <View
                      key={index}
                      style={{
                        borderWidth: 1,
                        borderColor: "grey",
                        paddingVertical: 5,
                        paddingHorizontal: 10,
                        margin: 5,
                        borderRadius: 6,
                      }}
                    >
                      <Text style={textColor(colorScheme)}>{item}</Text>
                    </View>
                  );
                }}
                shouldLoad={loading}
              />
            </ScrollView>
          )}
        </Page>
      );
    } else {
      return (
        <Page>
          <ActivityIndicator size="large" color="#ef8b22" />
        </Page>
      );
    }
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
    backgroundColor: "#ef8b22",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalDarkView: {
    margin: 20,
    backgroundColor: "#ef8b22",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
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
