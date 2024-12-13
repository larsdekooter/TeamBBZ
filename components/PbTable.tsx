import { getHistory, textColor } from "@/constants/functions";
import { AthleteData } from "@/constants/types";
import { getItem } from "@/utils/AsyncStorage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ColorSchemeName,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import ButtonComponent from "./Button";
import { SwimrakingEventId } from "@/constants/enums";
import { FontAwesome } from "@expo/vector-icons";

export default function PbTable({
  data,
  athleteData,
  top,
}: {
  data: {
    title: { distance: string; time: string; poolSize: "25m" | "50m" };
    key: string;
    id: number;
  }[];
  athleteData: AthleteData;
  top: number;
}) {
  const colorScheme = useColorScheme();
  const [quickViewModalShown, setQuickViewModalShown] = useState(false);
  const [historyModalShown, setHistoryModalShown] = useState(
    SwimrakingEventId.None
  );
  const [title, setTitle] = useState(
    {} as { distance: string; time: string; poolSize: "25m" | "50m" }
  );
  const [sData, setSData] = useState(
    [] as { time: string; date: Date; points: string; location: string }[]
  );
  const [loading, setLoading] = useState(false);

  const findPb = (event: string, poolSize: string, time: string) => {
    return athleteData.pbs.find(
      (pb) => pb.event === event && pb.poolSize === poolSize && pb.time === time
    );
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent
        visible={quickViewModalShown}
        onRequestClose={() => {
          setQuickViewModalShown(false);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
              height: 300,
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
                {findPb(title.distance, title.poolSize, title.time)?.event}{" "}
                {findPb(title.distance, title.poolSize, title.time)
                  ?.poolSize === "25m"
                  ? "SC"
                  : "LC"}
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                {findPb(title.distance, title.poolSize, title.time)?.time}
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
                {findPb(
                  title.distance,
                  title.poolSize,
                  title.time
                )?.date.toLocaleDateString()}
              </Text>
              <Text style={textColor(colorScheme)}>
                {findPb(title.distance, title.poolSize, title.time)?.points}{" "}
                Fina punten
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
                {findPb(title.distance, title.poolSize, title.time)?.meet}
              </Text>
              <Text style={{ textAlign: "left", ...textColor(colorScheme) }}>
                {findPb(title.distance, title.poolSize, title.time)?.location}
              </Text>
            </View>
            <ButtonComponent
              onPress={async () => {
                setLoading(true);
                const id =
                  SwimrakingEventId[
                    title.distance as keyof typeof SwimrakingEventId
                  ];
                const data = await getHistory(
                  id,
                  athleteData.id,
                  title.poolSize
                );
                setHistoryModalShown(id);
                setSData(data);
                setQuickViewModalShown(false);
                setLoading(false);
              }}
              paddingVertical={10}
            >
              <Text style={{ fontWeight: "bold" }}>Bekijk geschiedenis</Text>
              {loading && <ActivityIndicator size="small" color="black" />}
            </ButtonComponent>
            <View style={{ height: 20 }} />
            <ButtonComponent
              onPress={() => setQuickViewModalShown(false)}
              paddingVertical={10}
            >
              <Text style={{ fontWeight: "bold" }}>Sluit</Text>
            </ButtonComponent>
          </View>
        </View>
      </Modal>

      <Modal
        visible={historyModalShown !== SwimrakingEventId.None}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setHistoryModalShown(SwimrakingEventId.None);
          setQuickViewModalShown(true);
        }}
      >
        <View
          style={{
            backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
            height: Dimensions.get("window").height,
            width: Dimensions.get("window").width,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Pressable
            style={{
              flexDirection: "row",
              top: 25,
              width: Dimensions.get("window").width,
            }}
            onPress={() => {
              setHistoryModalShown(SwimrakingEventId.None);
              // setQuickViewModalShown(true);
            }}
          >
            <FontAwesome
              name="arrow-left"
              color="white"
              size={30}
              style={{ left: 10, position: "absolute" }}
            />
            <Text
              style={{
                ...textColor(colorScheme),
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 20,
                zIndex: 1,
                width: Dimensions.get("window").width,
              }}
            >
              {title.distance} - {title.time} -{" "}
              {title.poolSize === "25m" ? "SC" : "LC"}
            </Text>
          </Pressable>
          <FlatList
            data={sData}
            style={{ top: 50, marginBottom: 50 }}
            renderItem={({ item, index }) => (
              <View
                key={index}
                style={{
                  borderWidth: 1,
                  borderColor: "grey",
                  paddingVertical: 15,
                  // marginVertical: 5,
                  flex: 1,
                  flexDirection: "row",
                  // justifyContent: "space-between",
                  alignContent: "space-between",
                  paddingHorizontal: 10,
                }}
              >
                <Text style={{ ...textColor(colorScheme), flex: 1 }}>
                  {item.time}
                </Text>
                <Text style={{ ...textColor(colorScheme), flex: 1 }}>
                  {item.points}
                </Text>
                <Text style={{ ...textColor(colorScheme), flex: 1 }}>
                  {item.date.toLocaleDateString()}
                </Text>
                <Text style={{ ...textColor(colorScheme), flex: 1 }}>
                  {item.location}
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>

      <FlatList
        data={data}
        renderItem={({ item }) => (
          <Pressable
            style={{
              padding: 10,
              backgroundColor: colorScheme === "light" ? "#FFF" : "#181c20",
              borderBottomWidth: 1,
              borderColor: "grey",
              borderTopWidth: 1,
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
            }}
            onPress={() => {
              setTitle(item.title);
              setQuickViewModalShown(true);
            }}
          >
            <Text
              style={{ textAlign: "left", ...textColor(colorScheme), flex: 1 }}
            >
              {item.title.distance}
            </Text>
            <Text
              style={{
                textAlign: "center",
                ...textColor(colorScheme),
                flex: 1,
              }}
            >
              {item.title.time}
            </Text>
            <Text
              style={{ textAlign: "right", ...textColor(colorScheme), flex: 1 }}
            >
              {item.title.poolSize}
            </Text>
          </Pressable>
        )}
        style={{
          backgroundColor: "white",
          height: 100,
          width: Dimensions.get("window").width,
          marginTop: top,
        }}
      />
    </>
  );
}
