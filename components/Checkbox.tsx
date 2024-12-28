import { FontAwesome } from "@expo/vector-icons";
import { GestureResponderEvent, Pressable } from "react-native";

interface CheckBoxProps {
  onPress?: null | ((event: GestureResponderEvent) => void) | undefined;
  checked?: boolean;
}

export default function CheckBox({ onPress, checked = false }: CheckBoxProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: !checked ? "#2a3137" : "#ef8b22",
        width: 30,
        height: 30,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: !checked ? "grey" : "#ff9f40",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {checked && (
        <FontAwesome
          name="check"
          size={15}
          color="#00"
          style={{ textAlign: "center" }}
        />
      )}
    </Pressable>
  );
}
