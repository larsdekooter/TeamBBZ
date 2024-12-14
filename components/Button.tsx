import { textColor } from "@/constants/functions";
import { Href, Link } from "expo-router";
import {
  Alert,
  Button,
  GestureResponderEvent,
  Pressable,
  useColorScheme,
  View,
} from "react-native";

export default function ButtonComponent({
  children,
  onPress,
  paddingVertical,
  marginVertical,
}: {
  children?: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
  paddingVertical?: number;
  marginVertical?: number;
}) {
  const colorScheme = useColorScheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#ef8b22",
        paddingHorizontal: 10,
        paddingVertical: paddingVertical ?? 5,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#000",
        borderWidth: 1,
        flexDirection: "row",
        marginVertical: marginVertical,
      }}
    >
      {children}
    </Pressable>
  );
}
