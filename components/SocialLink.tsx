import { textColor } from "@/constants/functions";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import FontAwesomeBrands from "@react-native-vector-icons/fontawesome-free-brands";
import {
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
  brand,
}: {
  icon: string;
  size: number;
  url: string;
  style?:
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
  version?: number;
  brand?: boolean;
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
        {brand ? (
          <FontAwesomeBrands
            name={icon as any}
            size={size}
            color={textColor(colorScheme).color}
          />
        ) : (
          <FontAwesome6
            name={icon as any}
            size={size}
            color={textColor(colorScheme).color}
            iconStyle="solid"
          />
        )}
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
      {brand ? (
        <FontAwesomeBrands
          name={icon as any}
          size={size}
          color={textColor(colorScheme).color}
        />
      ) : (
        <FontAwesome
          name={icon as any}
          size={size}
          color={textColor(colorScheme).color}
        />
      )}
    </Pressable>
  );
}
