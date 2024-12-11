import { textColor } from "@/constants/functions";
import { AthleteData, MeetData } from "@/constants/types";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import ButtonComponent from "./Button";

export default function MeetsTable({
  top,
  athleteData,
  data,
}: {
  top: number;
  athleteData: AthleteData;
  data: MeetData[];
}) {
  const colorScheme = useColorScheme();
  const [modalShown, setModalShown] = useState(false);
  const [currentItem, setCurrentItem] = useState({} as MeetData);
  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={modalShown}
        onRequestClose={() => setModalShown(false)}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
              height: 200,
              width: 400,
              padding: 20,
              borderRadius: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  textAlign: "left",
                  fontWeight: "bold",
                  ...textColor(colorScheme),
                }}
              >
                {currentItem.date ? mapDates(currentItem.date) : ""}
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {currentItem.location}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ textAlign: "right", ...textColor(colorScheme) }}>
                {currentItem.club}
              </Text>
              <Text style={textColor(colorScheme)}>{currentItem.poolSize}</Text>
            </View>

            <ButtonComponent onPress={() => setModalShown(false)}>
              <Text>Sluit</Text>
            </ButtonComponent>
          </View>
        </View>
      </Modal>
      <FlatList
        data={data}
        style={{
          height: 100,
          width: Dimensions.get("window").width,
          marginTop: top,
        }}
        renderItem={({ item, index }) => (
          <Pressable
            style={{
              padding: 10,
              backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
              borderBottomWidth: 1,
              borderBottomColor: "grey",
              borderTopWidth: 1,
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
            }}
            onPress={() => {
              setModalShown(true);
              setCurrentItem(item);
            }}
          >
            <Text
              style={{ textAlign: "left", ...textColor(colorScheme), flex: 1 }}
            >
              {mapDates(item.date)}
            </Text>
            <Text
              style={{
                textAlign: "center",
                ...textColor(colorScheme),
                flex: 1,
              }}
            >
              {item.location.replace(/&nbsp;/g, " ")}
            </Text>
            <Text
              style={{ textAlign: "right", ...textColor(colorScheme), flex: 1 }}
            >
              {item.poolSize}
            </Text>
          </Pressable>
        )}
      ></FlatList>
    </>
  );
}

function mapDates(dates: Date[]) {
  if (dates.length > 1) {
    let dateString = "";
    for (let i = 0; i < dates.length - 1; i++) {
      dateString += dates[i].getDate();
      if (dates[dates.length - 1].getMonth() === dates[i].getMonth()) {
      } else {
        dateString += "-";
        dateString += dates[i].getMonth() + 1;
      }
      dateString += ", ";
    }
    dateString += `${dates[dates.length - 1].getDate()}-${
      dates[dates.length - 1].getMonth() + 1
    }-${dates[dates.length - 1].getFullYear()}`;
    return dateString;
  } else {
    return `${dates[0].getDate()}-${
      dates[0].getMonth() + 1
    }-${dates[0].getFullYear()}`;
  }
}
