import { getMeetData, textColor } from "@/constants/functions";
import { AthleteData, MeetData } from "@/constants/types";
import { Fragment, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import SwipeModal from "./SwipeModal";
import { Colors } from "@/constants/enums";

//TODO: add points to visualization

export default function MeetsTable({
  top,
  athleteData,
  data,
  mainSwimmerSelected,
}: {
  top: number;
  athleteData: AthleteData;
  data: MeetData[];
  mainSwimmerSelected: boolean;
}) {
  const colorScheme = useColorScheme();
  const [modalShown, setModalShown] = useState(false);
  const [currentItem, setCurrentItem] = useState({} as MeetData);
  const [loading, setLoading] = useState(-1);

  return (
    <Fragment>
      <SwipeModal
        visible={modalShown}
        onRequestClose={() => setModalShown(false)}
        onClose={() => setModalShown(false)}
        height={550}
        containerStyle={{
          borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
        }}
        buttonStyle={{
          borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
        }}
      >
        <View
          style={{
            justifyContent: "space-between",
            width: "100%",
            flex: 1,
          }}
        >
          <View style={{}}>
            <Text
              style={[
                textColor(colorScheme),
                {
                  textAlign: "center",
                  fontWeight: "bold",
                  borderColor: "grey",
                  borderWidth: 1,
                  padding: 2,
                  borderRadius: 6,
                },
              ]}
            >
              {currentItem.data?.name}
            </Text>
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
              <FlatList
                data={currentItem.data?.events}
                style={{ maxHeight: 300 }}
                renderItem={({ index, item: event }) => (
                  <View
                    key={index}
                    style={{
                      borderWidth: 1,
                      borderColor: mainSwimmerSelected
                        ? Colors.Orange
                        : Colors.Blue,

                      borderRadius: 6,
                      margin: 5,
                      padding: 5,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "gray",
                      }}
                    >
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "left", width: "33%" },
                        ]}
                      >
                        {event
                          .replace("Breaststroke", "schoolslag")
                          .replace("Freestyle", "vrije slag")
                          .replace("Medley", "wisselslag")
                          .replace("Backstroke", "rugslag")
                          .replace("Butterfly", "vlinderslag")}
                      </Text>
                      <View
                        style={{
                          width: "33%",
                          flex: 1,
                          justifyContent: "center",

                          alignItems: "center",
                        }}
                      >
                        {(() => {
                          const place = currentItem.data.places[index].trim();
                          const name = "medal";
                          const size = 17;
                          switch (place) {
                            case "1.":
                              return (
                                <FontAwesome6
                                  name={name}
                                  color={Colors.Gold}
                                  size={size}
                                />
                              );
                            case "2.":
                              return (
                                <FontAwesome5
                                  name={name}
                                  color={Colors.Silver}
                                  size={size}
                                />
                              );
                            case "3.":
                              return (
                                <FontAwesome6
                                  name={name}
                                  color={Colors.Bronze}
                                  size={size}
                                />
                              );
                            default:
                              return (
                                <Text
                                  style={[
                                    textColor(colorScheme),
                                    {
                                      fontWeight: !place.includes("Split")
                                        ? "bold"
                                        : "normal",
                                    },
                                  ]}
                                >
                                  {place}
                                </Text>
                              );
                          }
                        })()}
                      </View>
                      <View style={{ width: "33%" }}>
                        <Text
                          style={[
                            {
                              textAlign: "right",
                              color:
                                parseFloat(
                                  currentItem.data.percentages[index]
                                ) >= 100
                                  ? colorScheme === "light"
                                    ? Colors.LightModeGreen
                                    : Colors.DarkmodeGreen
                                  : currentItem.data.percentages[index]
                                  ? colorScheme === "light"
                                    ? Colors.LightmodeRed
                                    : Colors.DarkmodeRed
                                  : textColor(colorScheme).color,
                            },
                          ]}
                        >
                          {currentItem.data.times[index]}
                        </Text>
                        <Text
                          style={[
                            textColor(colorScheme),
                            { textAlign: "right" },
                          ]}
                        >
                          {currentItem.data.percentages[index]}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "left", width: "33%" },
                        ]}
                      >
                        {currentItem.data.types[index]
                          .replace("-", "")
                          .replace("Final", "Finale")
                          .replace("Prelim", "Voorronde")
                          .replace("Timed Finale", "Series")}
                      </Text>
                      <Text
                        style={[
                          textColor(colorScheme),
                          { textAlign: "center", width: "33%" },
                        ]}
                      >
                        {currentItem.data.points[index]} pts.
                      </Text>
                      <Text
                        style={[
                          textColor(colorScheme),
                          {
                            textAlign: "right",
                            width: "33%",
                          },
                        ]}
                      >
                        {currentItem.data.pbs[index]}
                      </Text>
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        </View>
      </SwipeModal>
      <FlatList
        data={data}
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
        style={{
          height: 100,
          width: Dimensions.get("window").width,
          marginTop: top,
        }}
        renderItem={({ item, index }) => (
          <Pressable
            style={{
              backgroundColor:
                colorScheme === "light" ? "#FFF" : Colors.DarkBackground,
              borderWidth: 1,
              borderColor: "grey",
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              paddingVertical: 10,
              paddingHorizontal: 10,
              width: "95%",
              margin: 5,
              borderRadius: 6,
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
            {loading === index && <ActivityIndicator color={Colors.Orange} />}
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
    </Fragment>
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
