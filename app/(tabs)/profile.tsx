import {
  ActivityIndicator,
  Alert,
  ColorSchemeName,
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
import { Fragment, useCallback, useEffect, useState } from "react";
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
import {
  AntDesign,
  Entypo,
  SimpleLineIcons,
  Octicons,
} from "@expo/vector-icons";
import { Colors } from "@/constants/enums";

enum Tabs {
  Pbs = 1,
  Records = 2,
  Meets = 3,
  Biografy = 4,
  Speciality = 5,
}

function ProfileHeader({
  prepareData,
  athleteData,
  activeTab,
  setActiveTab,
}: {
  athleteData: AthleteData;
  activeTab: Tabs;
  setActiveTab: React.Dispatch<React.SetStateAction<Tabs>>;
  prepareData: (
    aData: AthleteData,
    history25mFreestyle: {
      year: string;
      points: {
        time: string;
        points: string;
        date: Date;
        location: string;
      };
    }[]
  ) => void;
}) {
  const [userSwitchLoading, setUserSwitchLoading] = useState(false);
  const colorScheme = useColorScheme();
  const [mainSwimmerSelected, setMainSwimmerSelected] = useState(true);

  return (
    <View
      style={{
        backgroundColor:
          colorScheme === "light" ? "#fff" : Colors.DarkBackground,
        zIndex: 2,
      }}
    >
      <Pressable
        style={{
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
              prepareData(aData, history25mFreestyle);
              setUserSwitchLoading(false);
            } else {
              setUserSwitchLoading(false);
            }
          } else setUserSwitchLoading(false);
        }}
      >
        {!userSwitchLoading && (
          <View
            style={{
              flexDirection: "column",
              flex: 1,
              width: "90%",
              marginVertical: 10,
              borderColor: Colors.Orange,
              borderWidth: 1,
              borderRadius: 6,
              paddingHorizontal: 20,
              paddingVertical: 5,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
                {athleteData.name}
              </Text>
              <Text style={[textColor(colorScheme)]}>
                {athleteData.birthYear}
              </Text>
            </View>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <Text style={[textColor(colorScheme), { textAlign: "left" }]}>
                {athleteData.nation}
              </Text>
              <Text style={[textColor(colorScheme)]}>{athleteData.club}</Text>
            </View>
          </View>
        )}
        {userSwitchLoading && (
          <ActivityIndicator color={Colors.Orange} size={25} />
        )}
      </Pressable>
      <View
        style={{
          // marginTop: 50,
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
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: activeTab === Tabs.Pbs ? 2 : 1,
          }}
          onPress={() => {
            setActiveTab(Tabs.Pbs);
          }}
        >
          <Octicons
            name="stopwatch"
            color={textColor(colorScheme).color}
            size={20}
          />
        </ButtonComponent>
        <ButtonComponent
          onPress={() => setActiveTab(Tabs.Meets)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: activeTab === Tabs.Meets ? 2 : 1,
          }}
        >
          <Entypo name="medal" color={textColor(colorScheme).color} size={20} />
        </ButtonComponent>
        <ButtonComponent
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderWidth: activeTab === Tabs.Speciality ? 2 : 1,
          }}
          onPress={async () => {
            setActiveTab(Tabs.Speciality);
            getSpecialityData(athleteData);
          }}
        >
          <Octicons
            name="star"
            color={textColor(colorScheme).color}
            size={20}
          />
        </ButtonComponent>
      </View>
    </View>
  );
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
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<{
    event: SwimrakingEventId;
    poolSize: "25m" | "50m";
  }>({
    event: SwimrakingEventId["100m vrije slag"],
    poolSize: "25m",
  });

  function prepareData(
    aData: AthleteData,
    history25mFreestyle: {
      year: string;
      points: {
        time: string;
        points: string;
        date: Date;
        location: string;
      };
    }[]
  ) {
    setAthleteData(aData);
    setData(history25mFreestyle.map(({ points }) => parseInt(points.points)));
    setLabels(history25mFreestyle.map(({ year }) => year));
  }

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
        prepareData(aData, history25mFreestyle);
        setSelectedEvent({
          event:
            SwimrakingEventId[
              aData.pbs[0].event as keyof typeof SwimrakingEventId
            ],
          poolSize: aData.pbs[0].poolSize,
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
        if (username.length! > 0) return;
        await fetchUser();
      };
      getI();
    }, [])
  );

  // useEffect(() => {
  //   const getI = async () => {
  //     await fetchUser();
  //   };
  //   getI();
  // });

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
                    colorScheme === "dark"
                      ? Colors.ModalDarkBackground
                      : Colors.ModalLightBackground,
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
        <Page style={{ justifyContent: "flex-start" }}>
          <ProfileHeader
            activeTab={activeTab}
            athleteData={athleteData}
            prepareData={prepareData}
            setActiveTab={setActiveTab}
          />
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
                fillColor={
                  colorScheme === "light"
                    ? Colors.TransparantLightOrange
                    : Colors.TransparantDarkOrange
                }
                strokeColor={Colors.Orange}
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
                lineColor={
                  colorScheme === "light"
                    ? "rgba(162,94,23,0.5)"
                    : "rgba(162, 94, 23, 0.8)"
                }
                pointColor={Colors.Orange}
              />
              <Dropdown
                data={athleteData.pbs
                  // .filter(({ points }) => points !== "-")
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
          <ActivityIndicator size="large" color={Colors.Orange} />
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
