import {
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
import { textColor } from "../../constants/functions";
import ButtonComponent from "@/components/Button";
import { useEffect, useState } from "react";
import { getItem, setItem, clear } from "@/utils/AsyncStorage";

export default function Profile() {
  const colorScheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [modalShown, setModalShown] = useState(false);
  const [usernameSet, setUsernameSet] = useState("");

  useEffect(() => {
    const getI = async () => {
      const response = await getItem("username");
      if (response === null) {
        setUsername("");
      } else {
        setUsername(response.username);
      }
    };
    getI();
  }, []);
  console.log("UPDATE", username);
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
    return (
      <Page>
        <Text style={textColor(colorScheme)}>{username}</Text>
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
