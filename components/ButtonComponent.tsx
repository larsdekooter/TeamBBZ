import { StyleProp, useColorScheme, ViewStyle } from "react-native";
// import { Pressable, PressableProps } from "react-native-gesture-handler";
import { Pressable, PressableProps } from "react-native";
import { Colors } from "@/constants/enums";

/**
 * TODO: May need to comment react-native and uncommment react-native-gesture-handler.
 * Used to do it with RNGH, but didnt work after upgrading to expo-sdk@54
 */

export default function ButtonComponent({
  children,
  onPress,
  style,
}: {
  children?: React.ReactNode;
  onPress: PressableProps["onPress"];
  style?: StyleProp<ViewStyle>;
}) {
  const colorScheme = useColorScheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor:
            colorScheme === "light" ? "#fff" : Colors.DarkBackground,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          borderColor: Colors.Orange,
          borderWidth: 1,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
