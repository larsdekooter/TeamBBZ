import { useEffect, useState } from "react";
import { Dimensions, Text, View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;

export default function SkeletonLoader({
  loaderHeight,
  loaderWidth,
}: {
  loaderHeight?: number;
  loaderWidth?: number;
}) {
  const translateX = useSharedValue(-screenWidth);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(screenWidth, { duration: 2400 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{
        backgroundColor: "rgb(17, 17, 17)",
        overflow: "hidden",
        height: loaderHeight || height,
        width: loaderWidth || screenWidth * 0.95,
        borderRadius: 6,
        marginVertical: 10,
      }}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, animatedStyle, { borderRadius: 6 }]}
      >
        <LinearGradient
          colors={[
            "rgb(17, 17, 17)",
            "rgb(51, 51, 51)",
            "rgb(51, 51, 51)",
            "rgb(17, 17, 17)",
            "rgb(17, 17, 17)",
            "rgb(17, 17, 17)",
            "rgb(17, 17, 17)",
            "rgb(17, 17, 17)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 2, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={{ height: 0 }}
          onTextLayout={(e) => setHeight(e.nativeEvent.lines[0].height + 20)}
        >
          dummy text
        </Text>
      </Animated.View>
    </View>
  );
}
