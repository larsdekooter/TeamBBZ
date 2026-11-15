import { StyleProp, useColorScheme, ViewStyle } from "react-native";
import { Pressable, PressableProps } from "react-native";
import { Colors } from "@/constants/enums";

/**
 * TODO: May need to comment react-native and uncommment react-native-gesture-handler.
 * Used to do it with RNGH, but didnt work after upgrading to expo-sdk@54
 */

type ButtonComponentProps = PressableProps & { style: StyleProp<ViewStyle> };

export default function ButtonComponent(props: ButtonComponentProps) {
  const colorScheme = useColorScheme();
  return (
    <Pressable
      {...props}
      style={[
        {
          backgroundColor:
            colorScheme === "light"
              ? Colors.LightBackground
              : Colors.DarkBackground,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          borderColor: Colors.Orange,
          borderWidth: 1,
        },
        props.style,
      ]}
    />
  );
}
