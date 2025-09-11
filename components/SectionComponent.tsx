import {
  Animated,
  Pressable,
  Dimensions,
  View,
  Text,
  useColorScheme,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useState } from "react";
import { textColor } from "@/constants/functions";
import { FontAwesome } from "@expo/vector-icons";
import SkeletonLoader from "./SkeletonLoader";
import { Colors } from "@/constants/enums";

export default function SectionComponent({
  children,
  title,
  style,
  onPress,
  loading,
  bold,
}: {
  children: React.ReactNode;
  title: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  loading?: boolean;
  bold?: boolean;
}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];
  const colorScheme = useColorScheme();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
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
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <Pressable
      style={{
        width: Dimensions.get("window").width * 0.95,
        borderColor: Colors.Orange,
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        overflow: "hidden",
        marginVertical: 10,
      }}
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
          ]}
        >
          {title}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <FontAwesome
            name="chevron-down"
            size={15}
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </Animated.View>
      </View>
      <Animated.View
        style={[
          {
            maxHeight: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000],
            }),
            opacity: heightAnim,
            marginTop: heightAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
          },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
