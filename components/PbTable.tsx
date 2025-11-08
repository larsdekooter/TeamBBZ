import { getHistory, textColor } from "@/constants/functions";
import { AthleteData } from "@/constants/types";
import { Fragment, useState } from "react";
import {
  ActivityIndicator,
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
import { Colors, Strokes, SwimrakingEventId } from "@/constants/enums";
import { FontAwesome } from "@expo/vector-icons";
import SectionComponent from "./SectionComponent";
import SwipeModal from "./SwipeModal";
import { PressableProps } from "react-native";

export default function PbTable({
  data,
  athleteData,
  top,
  mainSwimmerSelected,
}: {
  data: {
    title: { distance: string; time: string; poolSize: "25m" | "50m" };
    key: string;
    id: number;
  }[];
  athleteData: AthleteData;
  top: number;
  mainSwimmerSelected: boolean;
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
        mainSwimmerSelected={mainSwimmerSelected}
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
        mainSwimmerSelected={mainSwimmerSelected}
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
            mainSwimmerSelected={mainSwimmerSelected}
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
  mainSwimmerSelected,
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
  mainSwimmerSelected: boolean;
}) {
  const colorScheme = useColorScheme();

  return (
    <SectionComponent
      title={stroke.charAt(0).toUpperCase() + stroke.slice(1)}
      bold
      containerStyle={{
        borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
      }}
    >
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
  mainSwimmerSelected,
}: {
  visible: boolean;
  onRequestClose: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  title: { distance: string; time: string; poolSize: "25m" | "50m" };
  athleteData: AthleteData;
  colorScheme: ColorSchemeName;
  onPressChoose: PressableProps["onPress"];
  loading: boolean;
  onPressClose: null | ((event?: GestureResponderEvent) => void) | undefined;
  mainSwimmerSelected: boolean;
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
      containerStyle={{
        borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
      }}
      buttonStyle={{
        borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
      }}
    >
      <View
        style={{
          width: "100%",
          flex: 1,
          padding: 10,
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
          style={{
            backgroundColor:
              colorScheme === "dark"
                ? Colors.ModalDarkBackground
                : Colors.ModalLightBackground,
            paddingVertical: 10,
            borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
          }}
        >
          <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
            Bekijk geschiedenis
          </Text>
          {loading && (
            <ActivityIndicator
              size="small"
              color={mainSwimmerSelected ? Colors.Orange : Colors.Blue}
            />
          )}
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
  mainSwimmerSelected,
}: {
  visible: boolean;
  onRequestClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  onPressClose: null | ((event: GestureResponderEvent) => void) | undefined;
  sData: { time: string; date: Date; points: string; location: string }[];
  colorScheme: ColorSchemeName;
  title: { distance: string; time: string; poolSize: "25m" | "50m" };
  mainSwimmerSelected: boolean;
}) {
  return (
    <SwipeModal
      visible={visible}
      onRequestClose={onRequestClose}
      onClose={onPressClose as () => void}
      height={Dimensions.get("window").height * 0.9}
      containerStyle={{
        borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
      }}
      buttonStyle={{
        borderColor: mainSwimmerSelected ? Colors.Orange : Colors.Blue,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
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
        <FlatList
          data={sData}
          style={{ marginBottom: 50 }}
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
    </SwipeModal>
  );
}
