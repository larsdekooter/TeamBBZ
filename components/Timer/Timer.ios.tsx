import { Colors } from "@/constants/enums";
import { textColor } from "@/constants/functions";
import { Host, ProgressView } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";
import { Text, View, useColorScheme } from "react-native";

export default function Timer({
  time,
  progress,
}: {
  time: string;
  progress?: number;
}) {
  const colorScheme = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          colorScheme === "dark"
            ? Colors.TransparantDarkOrange
            : Colors.TransparantLightOrange,
        width: 112,
        height: 56,
        borderRadius: 16,
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        paddingVertical: 16,
        paddingHorizontal: 10,
        elevation: 55,
        bottom: 16,
        right: 16,
      }}
    >
      <Text style={[textColor(colorScheme), { fontWeight: "bold" }]}>
        {time}
      </Text>
      <Host matchContents>
        <ProgressView value={progress ?? 0} modifiers={[tint(Colors.Orange)]} />
      </Host>
    </View>
  );
}
