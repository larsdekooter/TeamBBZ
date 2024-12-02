import { textColor } from "@/constants/functions";
import { AthleteData } from "@/constants/types";
import { getItem } from "@/utils/AsyncStorage";
import { useEffect, useState } from "react";
import {
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

export default function PbTable({
  data,
  athleteData,
  top,
}: {
  data: {
    title: { distance: string; time: string; poolSize: string };
    id: string;
  }[];
  athleteData: AthleteData;
  top: number;
}) {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState(
    {} as { distance: string; time: string; poolSize: string }
  );

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
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
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
                {
                  athleteData.pbs.find((pb) => pb.event === title.distance)
                    ?.event
                }{" "}
                {athleteData.pbs.find((pb) => pb.event === title.distance)
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

            <ButtonComponent onPress={() => setModalVisible(false)}>
              <Text>Sluit</Text>
            </ButtonComponent>
          </View>
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
              setModalVisible(true);
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
