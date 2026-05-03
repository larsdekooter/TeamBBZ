import { Colors } from "@/constants/enums";
import { textColor } from "@/constants/functions";
import { Feather } from "@expo/vector-icons";
import { Fragment } from "react";
import {
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  Text,
  useColorScheme,
  ViewStyle,
} from "react-native";
import Animated, {
  AnimatedStyle,
  CurvedTransition,
  StretchInX,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface ChipProps {
  label: string;
  onPress: () => void;
  state: boolean;
  style?: StyleProp<
    AnimatedStyle<
      | StyleProp<ViewStyle>
      | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
    >
  >;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIcon = Animated.createAnimatedComponent(Feather);
const AnimatedText = Animated.createAnimatedComponent(Text);

export default function Chip({ label, onPress, state, style }: ChipProps) {
  const totalBorderWidth = 2;
  const horizontalPadding = 16;
  const iconWidth = 18;
  const iconPadding = 5;
  const iconSize = iconPadding + iconWidth;

  const width = useSharedValue(0);
  const colorScheme = useColorScheme();

  const handlePress = () => {
    width.value = withSpring(
      state ? width.value - iconSize : width.value + iconSize,
      {
        duration: 100,
      },
    );
    onPress();
  };
  return (
    <Fragment>
      <Text
        style={{ position: "absolute", opacity: 0 }}
        onLayout={(event) => {
          width.value =
            event.nativeEvent.layout.width +
            totalBorderWidth +
            horizontalPadding * 2 +
            (state ? iconSize : 0);
        }}
      >
        {label}
      </Text>
      <AnimatedPressable
        onPress={handlePress}
        style={[
          {
            borderColor: state ? Colors.Orange : "grey",
            borderWidth: totalBorderWidth / 2,
            borderRadius: 8,
            flexDirection: "row",
            width,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            height: 32,
            backgroundColor: state
              ? colorScheme === "dark"
                ? Colors.TransparantDarkOrange
                : Colors.TransparantLightOrange
              : undefined,
          },
          style,
        ]}
      >
        <AnimatedText
          style={[textColor(colorScheme)]}
          layout={CurvedTransition.duration(100)}
        >
          {label}
        </AnimatedText>
        {state && (
          <AnimatedIcon
            name="check"
            size={iconWidth}
            entering={StretchInX.duration(100)}
            style={{ paddingLeft: iconPadding }}
            color={textColor(colorScheme).color}
          />
        )}
      </AnimatedPressable>
    </Fragment>
  );
}
