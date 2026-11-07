import {
  Pressable,
  Dimensions,
  View,
  Text,
  useColorScheme,
  StyleProp,
  ViewStyle,
  DimensionValue,
  TextStyle,
} from "react-native";
import { ReactNode, useState } from "react";
import { textColor } from "@/constants/functions";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import SkeletonLoader from "./SkeletonLoader";
import { Colors } from "@/constants/enums";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { rotate } from "@expo/ui/jetpack-compose/modifiers";

export default function SectionComponent({
  children,
  title,
  style,
  onPress,
  loading,
  bold,
  width = Dimensions.get("window").width * 0.95,
  containerStyle,
  titleStyle,
  numberOfTitleLines,
  height = 350,
  disabled,
}: {
  children: React.ReactNode;
  title: string | ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  loading?: boolean;
  bold?: boolean;
  width?: DimensionValue;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  numberOfTitleLines?: number;
  height?: number;
  disabled?: boolean;
}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useSharedValue("0deg");
  const heightAnim = useSharedValue(0);
  const colorScheme = useColorScheme();

  const toggleExpand = () => {
    if (disabled) return;
    setExpanded(!isExpanded);

    rotateAnim.value = withTiming(isExpanded ? "0deg" : "180deg", {
      duration: 100,
    });
    heightAnim.value = withTiming(isExpanded ? 0 : 1, { duration: 250 });
  };

  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotateAnim.value }],
  }));
  const heightAnimatedStyle = useAnimatedStyle(() => ({
    maxHeight: interpolate(heightAnim.value, [0, 1], [0, height]),
    marginTop: interpolate(heightAnim.value, [0, 1], [0, 10]),
  }));

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <Pressable
      style={[
        {
          width,
          borderColor: Colors.Orange,
          borderWidth: 1,
          borderRadius: 6,
          paddingVertical: 10,
          paddingHorizontal: 20,
          overflow: "hidden",
          marginVertical: 10,
        },
        containerStyle,
      ]}
      onPress={(e) => {
        toggleExpand();
        onPress?.();
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={[
            textColor(colorScheme),
            { fontWeight: bold ? "500" : "normal" },
            titleStyle,
          ]}
          numberOfLines={numberOfTitleLines}
        >
          {title}
        </Text>
        {!disabled && (
          <Animated.View style={[rotateAnimatedStyle]}>
            <FontAwesome
              name="chevron-down"
              size={15}
              color={textColor(colorScheme).color}
            />
          </Animated.View>
        )}
      </View>
      <Animated.View
        style={[
          {
            opacity: heightAnim,
          },
          style,
          heightAnimatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
