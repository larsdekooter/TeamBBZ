import { Colors } from "@/constants/enums";
import { textColor } from "@/constants/functions";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface AbsoluteDropdownProps {
  data: Array<string>;
  renderItem: ({
    item,
    index,
    array,
  }: {
    item: string;
    index: number;
    array: string[];
  }) => ReactNode;
  shouldLoad?: boolean;
  onPress?:
    | null
    | ((item: string, event: GestureResponderEvent) => void)
    | undefined;
  style?: StyleProp<ViewStyle>;
  closeWhenSelected?: boolean;
  textStyle?: StyleProp<TextStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  maxHeight?: number;
  emptySelected?: boolean;
}

export default function AbsoluteDropdown({
  data,
  renderItem,
  shouldLoad,
  onPress,
  style,
  closeWhenSelected = false,
  textStyle,
  dropdownStyle,
  maxHeight = 1000,
  emptySelected,
}: AbsoluteDropdownProps) {
  const [isOpened, setOpened] = useState(false);
  const rotateAnim = useSharedValue("0deg");
  const heightAnim = useSharedValue(0);
  const [selected, setSelected] = useState<string | undefined>(data[0]);

  useEffect(() => {
    if (data && data.length > 0) {
      setSelected(data[0]);
    }
  }, [data]);

  const toggleExpand = () => {
    setOpened(!isOpened);

    rotateAnim.value = withTiming(isOpened ? "0deg" : "180deg", {
      duration: 200,
    });
    heightAnim.value = withTiming(isOpened ? 0 : 1, {
      duration: isOpened ? 200 : 500,
    });
  };

  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotateAnim.value }],
  }));

  const heightAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(heightAnim.value, [0, 1], [0, maxHeight]),
    marginTop: interpolate(heightAnim.value, [0, 1], [0, 10]),
  }));

  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={toggleExpand}
      style={[
        {
          width: "95%",
          borderColor: "grey",
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          maxHeight: 300,
          zIndex: 9999,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={[
            {
              width: "92%",
              ...textColor(colorScheme),
            },
            textStyle,
          ]}
        >
          {emptySelected ? "" : selected}
        </Text>
        {shouldLoad && (
          <ActivityIndicator color={Colors.Orange} size={"small"} />
        )}
        <Animated.View
          style={[
            {
              marginLeft: 10,
              width: 15,
              height: 15,
              alignItems: "center",
              justifyContent: "center",
            },
            rotateAnimatedStyle,
          ]}
        >
          <FontAwesome
            name="chevron-down"
            size={15}
            color={textColor(colorScheme).color}
          />
        </Animated.View>
      </View>

      <Animated.ScrollView
        style={[
          {
            opacity: heightAnim,
            position: "absolute",
            top: "150%",
            left: 0,
            right: 0,
            backgroundColor:
              colorScheme === "dark"
                ? Colors.ModalDarkBackground
                : Colors.ModalLightBackground,
            zIndex: 9999,
            elevation: 5,
            borderRadius: 10,
            borderColor: "grey",
            borderWidth: 1,
            paddingHorizontal: 5,
          },
          dropdownStyle,
          heightAnimatedStyle,
        ]}
        nestedScrollEnabled
      >
        {data.map((item, index, array) => (
          <Pressable
            key={index}
            onPress={(event) => {
              setSelected(item);
              onPress ? onPress(item, event) : null;
              closeWhenSelected ? toggleExpand() : null;
            }}
          >
            {renderItem({ item, index, array })}
          </Pressable>
        ))}
      </Animated.ScrollView>
    </Pressable>
  );
}
