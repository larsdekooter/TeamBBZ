import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Page from "../../components/Page";
import {
  calculateAveragePoints,
  fetchSwimrankingSwimmer,
  getProgression,
  getSpecialityData,
  textColor,
} from "../../constants/functions";
import ButtonComponent from "@/components/ButtonComponent";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { getItem, setItem, clear } from "@/utils/AsyncStorage";
import { AthleteData } from "@/constants/types";
import PbTable from "@/components/PbTable";
import MeetsTable from "@/components/MeetTable";
import { SwimrakingEventId } from "@/constants/enums";
import RadarChart from "@/components/RadarChart";
import LineChart from "@/components/LineChart";
import Dropdown from "@/components/Dropdown";
import CheckBox from "@/components/Checkbox";
import TextInputComponent from "@/components/TextInputComponent";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
  const [athleteData, setAthleteData] = useState({} as AthleteData);
  const [modalShown, setModalShown] = useState(false);
  const [usernameSet, setUsernameSet] = useState("");
  const [activeTab, setActiveTab] = useState(Tabs.Pbs);
  const [emailSet, setEmailSet] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([] as number[]);
  const [labels, setLabels] = useState([] as string[]);
  const [shouldShow25, setShouldShow25] = useState(false);
  const [userSwitchLoading, setUserSwitchLoading] = useState(false);
  const [mainSwimmerSelected, setMainSwimmerSelected] = useState(true);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<{
    event: SwimrakingEventId;
    poolSize: "25m" | "50m";
  }>({
    event: SwimrakingEventId["100m vrije slag"],
    poolSize: "25m",
  });

  async function fetchUser() {
    const response = await getItem("username");
    if (response === null) {
      setUsername("");
      return false;
    } else if (response.username === username) {
      return true;
    } else {
      setUsername(response.username);
      const { aData, history25mFreestyle } = await fetchSwimrankingSwimmer(
        response.username
      );
      if (aData) {
        setAthleteData(aData);
        setData(
          history25mFreestyle.map(({ points }) => parseInt(points.points))
        );
        setLabels(history25mFreestyle.map(({ year }) => year));
        setSelectedEvent({
          event:
            SwimrakingEventId[
              athleteData.pbs[0].event as keyof typeof SwimrakingEventId
            ],
          poolSize: athleteData.pbs[0].poolSize,
        });
        return true;
      } else {
        Alert.alert(`'${response.username}' is niet gevonden in SwimRankings!`);
        setUsername("");
        return false;
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
    if (athleteData.name) {
      setAthleteData({} as AthleteData);
    }
    return (
      <Page>
        <Text style={textColor(colorScheme)}>
          Login om statistieken te zien
        </Text>
        <ButtonComponent
          onPress={() => {
            setModalShown(true);
            setEmailSet("");
            setUsernameSet("");
          }}
          style={{ width: "95%", paddingVertical: 10, marginVertical: 10 }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Login
          </Text>
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
          <GestureHandlerRootView style={styles.centeredView}>
            <View
              style={
                colorScheme === "light"
                  ? styles.modalLightView
                  : styles.modalDarkView
              }
            >
              <TextInputComponent
                contentContainerStyle={{ marginVertical: 20 }}
                placeholder="Naam"
                errorMessage={nameError.length > 0 ? nameError : undefined}
                id="username"
                onChangeText={(input) => {
                  if (nameError.length > 0) setNameError("");
                  setUsernameSet(input);
                }}
                autoComplete="name"
              />
              <TextInputComponent
                contentContainerStyle={{ marginVertical: 20 }}
                errorMessage={emailError.length > 0 ? emailError : undefined}
                placeholder="Email"
                id="email"
                onChangeText={(input) => {
                  if (nameError.length > 0) setNameError("");
                  setEmailSet(input);
                }}
                inputMode="email"
              />
              <ButtonComponent
                style={{
                  paddingVertical: 10,
                  width: 200,
                  backgroundColor:
                    colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                }}
                onPress={async () => {
                  if (!(usernameSet.length > 0)) {
                    return setNameError("Voer een naam in!");
                  } else if (!(emailSet.length > 0)) {
                    return setEmailError("Voer een email addres in!");
                  } else {
                    setLoading(true);
                    await setItem("username", { username: usernameSet });
                    setUsername(usernameSet);
                    await setItem("email", { email: emailSet });
                    setEmailSet(emailSet);
                    setModalShown(false);
                    const userFound = await fetchUser();
                    setLoading(false);
                    if (!userFound)
                      setNameError(`${usernameSet} werd niet gevonden!`);
                  }
                }}
              >
                <Text style={[textColor(colorScheme), { textAlign: "right" }]}>
                  Login
                </Text>
              </ButtonComponent>
            </View>
          </GestureHandlerRootView>
        </Modal>
      </Page>
    );
  } else {
    if (athleteData.name) {
      return (
        <Page>
          <View>
            <Pressable
              style={{
                position: "absolute",
                zIndex: 99,
                // top: 50,
                width: "100%",
                paddingVertical: 5,
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={async () => {
                setUserSwitchLoading(true);
                setMainSwimmerSelected(!mainSwimmerSelected);
                const swimmer = await getItem(
                  mainSwimmerSelected ? "swimmers" : "username"
                );
                if (swimmer) {
                  const { aData, history25mFreestyle } =
                    await fetchSwimrankingSwimmer(
                      swimmer.swimmer ?? swimmer.username
                    );
                  if (aData) {
                    setAthleteData(aData);
                    setData(
                      history25mFreestyle.map(({ points }) =>
                        parseInt(points.points)
                      )
                    );
                    setLabels(history25mFreestyle.map(({ year }) => year));
                    setUserSwitchLoading(false);
                  } else {
                    setUserSwitchLoading(false);
                  }
                } else setUserSwitchLoading(false);
              }}
            >
              {!userSwitchLoading && (
                <Text
                  style={{
                    ...textColor(colorScheme),
                    textAlign: "center",
                  }}
                >{`${athleteData.name} - ${athleteData.birthYear} \n${athleteData.nation} - ${athleteData.club}`}</Text>
              )}
              {userSwitchLoading && (
                <ActivityIndicator color="#ef8b22" size={25} />
              )}
            </Pressable>
            <View
              style={{
                marginTop: 50,
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
                style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                onPress={() => {
                  setActiveTab(Tabs.Pbs);
                }}
              >
                <Text
                  style={[
                    textColor(colorScheme),
                    {
                      fontWeight: "bold",
                    },
                  ]}
                >
                  PR's
                </Text>
              </ButtonComponent>
              <ButtonComponent
                onPress={() => setActiveTab(Tabs.Meets)}
                style={{ paddingHorizontal: 10, paddingVertical: 5 }}
              >
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  Wedstrijden
                </Text>
              </ButtonComponent>
              <ButtonComponent
                style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                onPress={async () => {
                  setActiveTab(Tabs.Speciality);
                  getSpecialityData(athleteData);
                }}
              >
                <Text
                  style={[
                    textColor(colorScheme),
                    {
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Specialiteit
                </Text>
              </ButtonComponent>
            </View>
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
              <Text style={[textColor(colorScheme), { fontStyle: "italic" }]}>
                Gemiddeld aantal punten:{" "}
                {calculateAveragePoints(athleteData, !shouldShow25)}
              </Text>
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
                <CheckBox
                  checked={shouldShow25}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShouldShow25(!setShouldShow25);
                  }}
                />
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
                  const event =
                    SwimrakingEventId[
                      item
                        .match(/[^LC|SC]/gm)!
                        .join("")
                        .trim() as keyof typeof SwimrakingEventId
                    ];
                  const poolSize = item.includes("LC") ? "50m" : "25m";
                  setSelectedEvent({ event, poolSize });
                  const progression = await getProgression(
                    event,
                    athleteData.id,
                    poolSize
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
              <View style={{ height: 50 }} />
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
