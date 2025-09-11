import { Colors } from "@/constants/enums";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

type TextInputComponentProps = {
  errorMessage?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
} & TextInputProps;

export default function TextInputComponent(props: TextInputComponentProps) {
  const colorScheme = useColorScheme();
  return (
    <View style={props.contentContainerStyle}>
      <TextInput
        {...props}
        style={[
          {
            backgroundColor: "white",
            width: 200,
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 40,
            borderColor: props.errorMessage
              ? Colors.ErrorRedBorder
              : colorScheme === "light"
              ? "grey"
              : "",
            borderWidth: colorScheme === "light" || props.errorMessage ? 2 : 0,
            textAlignVertical: "center",
            paddingVertical: 0,
            color: "#000",
          },
          props.style,
        ]}
      />
      {props.errorMessage && (
        <Text style={{ color: Colors.ErrorRedMessage, fontStyle: "italic" }}>
          {props.errorMessage}
        </Text>
      )}
    </View>
  );
}
