import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
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
  const [chartData, setChartData] = useState(
    [] as Array<{
      value: number;
      color: string;
      label: string;
    }>
  );

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
          <View style={{ marginTop: 100, flexDirection: "row" }}>
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
              top={25}
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
              top={25}
              athleteData={athleteData}
              data={athleteData.meets}
            />
          )}
          {activeTab === Tabs.Speciality && (
            <Fragment>
              <RadarChart
                data={getSpecialityData(athleteData)}
                size={300}
                axes={["Vlinder", "Rug", "School", "Vrij", "Wissel"]}
                rings={4}
                fillColor="rgba(162, 94, 23, 0.5)"
                strokeColor="#ef8b22"
              />
              {/* <LineChart
                data={[
                  calculateProgression(3 * 60 + 10.3, 2 * 60 + 45.03),
                  calculateProgression(2 * 60 + 45.03, 2 * 60 + 36.65),
                  calculateProgression(2 * 60 + 36.65, 2 * 60 + 32.65),
                ]}
                labels={["2020", "2021", "2022"]}
                size={{ width: Dimensions.get("window").width, height: 300 }}
              /> */}
              {/* <SectionList data={[{title: 'peter', data: ['']}]}/> */}
            </Fragment>
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

function randomNumber() {
  return Math.floor(Math.random() * 26) + 125;
}
function generateRandomColor(): string {
  // Generating a random number between 0 and 0xFFFFFF
  const randomColor = Math.floor(Math.random() * 0xffffff);
  // Converting the number to a hexadecimal string and padding with zeros
  return `#${randomColor.toString(16).padStart(6, "0")}`;
}
const DATA = (numberPoints = 5) =>
  Array.from({ length: numberPoints }, (_, index) => ({
    value: randomNumber(),
    color: generateRandomColor(),
    label: `Label ${index + 1}`,
  }));

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
