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
}: {
  children?: React.ReactNode;
  onPress: (event: GestureResponderEvent) => void;
}) {
  const colorScheme = useColorScheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#ef8b22",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderColor: "#000",
        borderWidth: 1,
      }}
    >
      {children}
    </Pressable>
  );
}
