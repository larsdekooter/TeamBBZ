import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  Linking,
  StyleProp,
  ViewStyle,
  useColorScheme,
} from "react-native";
import { PressableStateCallbackType } from "react-native/Libraries/Components/Pressable/Pressable";

export default function SocialLink({
  icon,
  size,
  url,
  style,
  version,
}: {
  icon: string;
  size: number;
  url: string;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  version?: number;
}) {
  const colorScheme = useColorScheme();
  if (version === 6) {
    return (
      <Pressable
        onPress={async () => {
          Linking.openURL(url);
        }}
        style={style}
      >
        <FontAwesome6
          name={icon as any}
          size={size}
          color={colorScheme === "light" ? "#000" : "#fff"}
        />
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={async () => {
        Linking.openURL(url);
      }}
      style={style}
    >
      <FontAwesome
        name={icon as any}
        size={size}
        color={colorScheme === "light" ? "#000" : "#fff"}
      />
    </Pressable>
  );
}
