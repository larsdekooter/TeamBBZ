import { Colors } from "@/constants/enums";
import { FontAwesome } from "@expo/vector-icons";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  useColorScheme,
  ViewStyle,
} from "react-native";

interface CheckBoxProps {
  onPress?: null | ((event: GestureResponderEvent) => void) | undefined;
  checked?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function CheckBox({
  onPress,
  checked = false,
  style,
}: CheckBoxProps) {
  const colorScheme = useColorScheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          backgroundColor: !checked
            ? colorScheme === "dark"
              ? Colors.ModalDarkBackground
              : "#fff"
            : Colors.Orange,
          width: 30,
          height: 30,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: !checked ? "grey" : Colors.LightOrange,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
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
