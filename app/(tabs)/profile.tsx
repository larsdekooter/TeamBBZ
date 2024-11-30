import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Page from "../../components/Page";
import { getAthleteData, textColor } from "../../constants/functions";
import ButtonComponent from "@/components/Button";
import { useEffect, useState } from "react";
import { getItem, setItem, clear } from "@/utils/AsyncStorage";
import { AthleteIdRegex } from "@/constants/regex";
import { AthleteData } from "@/constants/types";
import Table from "@/components/Table";

export default function Profile() {
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [athleteData, setAthleteData] = useState(
    ({} as AthleteData) || { name: undefined }
  );
  const [modalShown, setModalShown] = useState(false);
  const [usernameSet, setUsernameSet] = useState("");

  useEffect(() => {
    const getI = async () => {
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
          const aData = getAthleteData(athletePage);
          setAthleteData(aData);
        }
      }
    };
    getI();
  }, []);

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
                }}
                placeholder="Naam"
                id="username"
                onChangeText={(input) => {
                  setUsernameSet(input);
                }}
              />
              <ButtonComponent
                onPress={async () => {
                  if (!(usernameSet.length > 0)) {
                    return Alert.alert("Voer een gebruikersnaam in!");
                  } else {
                    await setItem("username", { username: usernameSet });
                    setUsername(usernameSet);
                    setModalShown(false);
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
          >{`${athleteData.name} - ${athleteData.birthYear} \n${athleteData.nation} - ${athleteData.club}`}</Text>
          <Table
            data={athleteData.pbs.map((pb) => {
              return {
                id: `${pb.event} - ${pb.poolSize} - ${pb.date}`,
                title: {
                  distance: pb.event,
                  poolSize: pb.poolSize,
                  time: pb.time,
                },
              };
            })}
            athleteData={athleteData}
          />
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
