import { useEffect, useState } from "react";
import { Dimensions, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const duration = 1200;

export default function SkeletonLoader() {
  const alpha = useSharedValue(0.3);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    alpha.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration }),
        withTiming(0.3, { duration })
      ),
      -1,
      true
    );
  });

  const backgroundAnimationStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(200,200,200,${alpha.value})`,
  }));

  return (
    <Animated.View
      style={[
        {
          height,
          width: width * 0.95,
          borderRadius: 6,
          marginVertical: 10,
        },
        backgroundAnimationStyle,
      ]}
    >
      <Text
        style={{ height: 0 }}
        onTextLayout={(e) => setHeight(e.nativeEvent.lines[0].height + 20)}
      >
        dummy text
      </Text>
    </Animated.View>
  );
}
