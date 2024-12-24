import { getMeetData, textColor } from "@/constants/functions";
import { AthleteData, MeetData } from "@/constants/types";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { FontAwesome } from "@expo/vector-icons";

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
  const [loading, setLoading] = useState(-1);

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
              height: 500,
              width: 400,
              padding: 20,
              borderRadius: 10,
              justifyContent: "space-between",
            }}
          >
            <View style={{}}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  {currentItem.date ? mapDates(currentItem.date) : ""}
                </Text>
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  {currentItem.location?.replace(/&nbsp;/g, " ")}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  {currentItem.club}
                </Text>
                <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
                  {currentItem.poolSize}
                </Text>
              </View>
              <View
                style={{
                  borderColor: "grey",
                  borderWidth: 1,
                  margin: 10,
                  padding: 10,
                  borderRadius: 6,
                }}
              >
                {currentItem.data?.events?.map((event, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#ef8b22",
                      borderRadius: 6,
                      margin: 5,
                      padding: 5,
                    }}
                  >
                    <Text
                      style={[
                        textColor(colorScheme),
                        { textAlign: "center", width: "30%" },
                      ]}
                    >
                      {event
                        .replace("Breaststroke", "schoolslag")
                        .replace("Freestyle", "vrije slag")
                        .replace("Medley", "wisselslag")
                        .replace("Backstroke", "rugslag")
                        .replace("Butterfly", "vlinderslag")}
                    </Text>
                    <Text
                      style={[
                        textColor(colorScheme),
                        {
                          fontWeight: "bold",
                          textAlign: "center",
                          width: "30%",
                        },
                      ]}
                    >
                      {currentItem.data.places[index]}
                    </Text>
                    <View style={{ width: "30%" }}>
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "center" },
                        ]}
                      >
                        {currentItem.data.times[index]}
                      </Text>
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "center" },
                        ]}
                      >
                        {currentItem.data.percentages[index]}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <ButtonComponent
              onPress={() => setModalShown(false)}
              marginVertical={10}
              paddingVertical={10}
            >
              <Text style={{ fontWeight: "bold" }}>Sluit</Text>
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
            onPress={async () => {
              setLoading(index);
              const data = await getMeetData(item, athleteData);
              item.data = data;
              setLoading(-1);
              setModalShown(true);
              setCurrentItem(item);
            }}
          >
            <Text
              style={{ textAlign: "left", ...textColor(colorScheme), flex: 1 }}
            >
              {mapDates(item.date)}
            </Text>
            {loading === index && <ActivityIndicator color="#ef8b22" />}
            <Text
              style={{
                textAlign: "center",
                ...textColor(colorScheme),
                flex: 1,
              }}
            >
              {item.location?.replace(/&nbsp;/g, " ")}
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
