import { Colors } from "@/constants/enums";
import { textColor } from "@/constants/functions";
import { FontAwesome } from "@expo/vector-icons";
import { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  useColorScheme,
  View,
  ViewStyle,
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
  style?: StyleProp<ViewStyle>;
  closeWhenSelected?: boolean;
  dropdownStyle?: StyleProp<ViewStyle>;
  maxHeight?: number;
  textStyle?: StyleProp<TextStyle>;
}

export default function Dropdown<T extends ReactNode>({
  data,
  renderItem,
  shouldLoad,
  onPress,
  style,
  closeWhenSelected = false,
  dropdownStyle,
  maxHeight = 1000,
  textStyle,
}: DropdownProps<T>) {
  const [isOpened, setOpened] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const [selected, setSelected] = useState(data[0]);

  // useEffect(() => {
  //   if (data && data.length > 0) {
  //     setSelected(data[0]);
  //   }
  // }, [data]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
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
        duration: isOpened ? 200 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

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
        <Text style={[textColor(colorScheme), { width: "92%" }, textStyle]}>
          {selected}
        </Text>
        {shouldLoad && (
          <ActivityIndicator color={Colors.Orange} size={"small"} />
        )}
        <Animated.View
          style={{
            transform: [{ rotate }],
            marginLeft: 10,
            width: 15,
            height: 15,
            alignItems: "center",
            justifyContent: "center",
          }}
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
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight],
            }),
            opacity: heightAnim,
            marginTop: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
          },
          dropdownStyle,
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
