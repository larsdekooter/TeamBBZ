import { getHistory, textColor } from "@/constants/functions";
import { AthleteData } from "@/constants/types";
import { getItem } from "@/utils/AsyncStorage";
import { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ColorSchemeName,
  Dimensions,
  FlatList,
  GestureResponderEvent,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import ButtonComponent from "./ButtonComponent";
import { Strokes, SwimrakingEventId } from "@/constants/enums";
import { FontAwesome } from "@expo/vector-icons";
import SectionComponent from "./SectionComponent";
import SwipeModal from "./SwipeModal";

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
  const strokes = {
    vlinderslag: data.filter(({ title }) =>
      title.distance.includes("vlinderslag")
    ),
    rugslag: data.filter(({ title }) => title.distance.includes("rugslag")),
    schoolslag: data.filter(({ title }) =>
      title.distance.includes("schoolslag")
    ),
    "vrije slag": data.filter(({ title }) =>
      title.distance.includes("vrije slag")
    ),
    wisselslag: data.filter(({ title }) =>
      title.distance.includes("wisselslag")
    ),
  };
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

  return (
    <Fragment>
      <QuickViewModal
        athleteData={athleteData}
        colorScheme={colorScheme}
        loading={loading}
        onPressChoose={async () => {
          setLoading(true);
          const id =
            SwimrakingEventId[title.distance as keyof typeof SwimrakingEventId];
          const data = await getHistory(id, athleteData.id, title.poolSize);
          setHistoryModalShown(id);
          setSData(data);
          setQuickViewModalShown(false);
          setLoading(false);
        }}
        onPressClose={() => setQuickViewModalShown(false)}
        onRequestClose={() => setQuickViewModalShown(false)}
        title={title}
        visible={quickViewModalShown}
      />
      <HistoryModal
        colorScheme={colorScheme}
        onPressClose={() => setHistoryModalShown(SwimrakingEventId.None)}
        sData={sData}
        title={title}
        visible={historyModalShown !== SwimrakingEventId.None}
        onRequestClose={() => {
          setHistoryModalShown(SwimrakingEventId.None);
          setQuickViewModalShown(true);
        }}
      />
      <View
        style={{
          minHeight: "83%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {Object.keys(strokes).map((stroke) => (
          <StrokeComponent
            stroke={stroke as keyof typeof Strokes}
            strokeData={strokes[stroke as keyof typeof Strokes]}
            key={stroke}
            onItemPress={(item) => {
              setTitle(item.title);
              setQuickViewModalShown(true);
            }}
          />
        ))}
      </View>
    </Fragment>
  );
}

function StrokeComponent({
  stroke,
  strokeData,
  onItemPress,
}: {
  onItemPress?:
    | null
    | ((
        item: {
          title: {
            distance: string;
            time: string;
            poolSize: "25m" | "50m";
          };
          key: string;
          id: number;
        },
        event: GestureResponderEvent
      ) => void)
    | undefined;
  stroke:
    | "vlinderslag"
    | "rugslag"
    | "schoolslag"
    | "vrije slag"
    | "wisselslag";
  strokeData: {
    title: {
      distance: string;
      time: string;
      poolSize: "25m" | "50m";
    };
    key: string;
    id: number;
  }[];
}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const colorScheme = useColorScheme();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const toggleExpand = () => {
    setExpanded(!isExpanded);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: isExpanded ? 200 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };
  return (
    <SectionComponent title={stroke.charAt(0).toUpperCase() + stroke.slice(1)}>
      <FlatList
        data={strokeData}
        style={{ height: 350 }}
        renderItem={({ item, index }) => (
          <Pressable
            key={index}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderColor: "grey",
              borderWidth: 1,
              borderRadius: 6,
              marginVertical: 5,
              flexDirection: "row",
            }}
            onPress={(e) => (onItemPress ? onItemPress(item, e) : null)}
          >
            <Text
              style={{
                ...textColor(colorScheme),
                flex: 1,
                textAlign: "left",
              }}
            >
              {item.title.distance}
            </Text>
            <Text
              style={{
                ...textColor(colorScheme),
                flex: 1,
                textAlign: "center",
              }}
            >
              {item.title.time}
            </Text>
            <Text
              style={{
                ...textColor(colorScheme),
                flex: 1,
                textAlign: "right",
              }}
            >
              {item.title.poolSize}
            </Text>
          </Pressable>
        )}
      />
    </SectionComponent>
  );
}

function QuickViewModal({
  visible,
  title,
  onRequestClose,
  athleteData,
  colorScheme,
  loading,
  onPressChoose,
  onPressClose,
}: {
  visible: boolean;
  onRequestClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  title: { distance: string; time: string; poolSize: "25m" | "50m" };
  athleteData: AthleteData;
  colorScheme: ColorSchemeName;
  onPressChoose: null | ((event: GestureResponderEvent) => void) | undefined;
  loading: boolean;
  onPressClose: null | ((event?: GestureResponderEvent) => void) | undefined;
}) {
  const findPb = (event: string, poolSize: string, time: string) => {
    return athleteData.pbs.find(
      (pb) => pb.event === event && pb.poolSize === poolSize && pb.time === time
    );
  };
  return (
    <SwipeModal
      visible={visible}
      onRequestClose={onRequestClose}
      height={300}
      onClose={() => onPressClose?.()}
    >
      {/* <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      > */}
      <View
        style={{
          flex: 1,
          padding: 20,
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
            {findPb(title.distance, title.poolSize, title.time)?.poolSize ===
            "25m"
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
            {findPb(title.distance, title.poolSize, title.time)?.points} Fina
            punten
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
          onPress={(e) => (onPressChoose ? onPressChoose(e) : null)}
          paddingVertical={10}
          style={{ backgroundColor: "#2a3137" }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Bekijk geschiedenis
          </Text>
          {loading && <ActivityIndicator size="small" color="black" />}
        </ButtonComponent>
        <View style={{ height: 20 }} />
        <ButtonComponent
          onPress={(e) => (onPressClose ? onPressClose(e) : null)}
          paddingVertical={10}
          style={{ backgroundColor: "#2a3137" }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Sluit
          </Text>
        </ButtonComponent>
      </View>
    </SwipeModal>
  );
}

function HistoryModal({
  visible,
  sData,
  onRequestClose,
  onPressClose,
  colorScheme,
  title,
}: {
  visible: boolean;
  onRequestClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  onPressClose: null | ((event: GestureResponderEvent) => void) | undefined;
  sData: { time: string; date: Date; points: string; location: string }[];
  colorScheme: ColorSchemeName;
  title: { distance: string; time: string; poolSize: "25m" | "50m" };
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
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
          onPress={onPressClose}
        >
          <FontAwesome
            name="arrow-left"
            color="#ef8b22"
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
          contentContainerStyle={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          renderItem={({ item, index }) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: "grey",
                paddingVertical: 15,
                flexDirection: "row",
                alignContent: "space-between",
                paddingHorizontal: 10,
                borderRadius: 6,
                marginVertical: 10,
                width: "95%",
              }}
            >
              <Text style={{ ...textColor(colorScheme), flex: 1 }}>
                {item.time}
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {item.points} punten
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {item.date.toLocaleDateString()}
              </Text>
              <Text
                style={{
                  ...textColor(colorScheme),
                  flex: 1,
                  textAlign: "right",
                }}
              >
                {item.location}
              </Text>
            </View>
          )}
        />
      </View>
    </Modal>
  );
}
