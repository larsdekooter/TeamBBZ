import { textColor } from "@/constants/functions";
import { FontAwesome } from "@expo/vector-icons";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

interface DropdownProps<T extends ReactNode> {
  data: Array<T>;
  renderItem: ({
    item,
    index,
    array,
  }: {
    item: T;
    index: number;
    array: T[];
  }) => ReactNode;
  shouldLoad?: boolean;
  onPress?:
    | null
    | ((item: T, event: GestureResponderEvent) => void)
    | undefined;
}

export default function Dropdown<T extends ReactNode>({
  data,
  renderItem,
  shouldLoad,
  onPress,
}: DropdownProps<T>) {
  const [isOpened, setOpened] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const [selected, setSelected] = useState(data[0]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  const toggleExpand = () => {
    setOpened(!isOpened);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isOpened ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isOpened ? 0 : 1,
        duration: isOpened ? 100 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={toggleExpand}
      style={{
        width: "95%",
        borderColor: "grey",
        borderWidth: 1,
        padding: 10,
        borderRadius: 8,
        maxHeight: 300,
        marginBottom: 50,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ width: 150, ...textColor(colorScheme) }}>
          {selected}
        </Text>
        {shouldLoad && <ActivityIndicator color="#ef8b22" size={"small"} />}
        <Animated.View style={{ transform: [{ rotate }], marginLeft: 10 }}>
          <FontAwesome
            name="arrow-right"
            size={15}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000],
          }),
          opacity: heightAnim,
          marginTop: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        }}
        nestedScrollEnabled
      >
        {data.map((item, index, array) => (
          <Pressable
            key={index}
            onPress={(event) => {
              setSelected(item);
              onPress ? onPress(item, event) : null;
            }}
          >
            {renderItem({ item, index, array })}
          </Pressable>
        ))}
      </Animated.ScrollView>
    </Pressable>
  );
}
