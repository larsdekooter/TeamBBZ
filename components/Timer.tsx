import { Colors } from "@/constants/enums";
import { Text, useColorScheme } from "react-native";
import { View } from "react-native";
import {
  CircularWavyProgressIndicator,
  Host,
  Box,
} from "@expo/ui/jetpack-compose";
import {
  size,
  fillMaxSize,
  align,
  offset,
} from "@expo/ui/jetpack-compose/modifiers";
import { textColor } from "@/constants/functions";

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
        flexDirection: "row",
        elevation: 55,
        bottom: 16,
        right: 16,
      }}
    >
      <Text
        style={[
          textColor(colorScheme),
          {
            fontWeight: "bold",
          },
        ]}
      >
        {time}
      </Text>
      <Host matchContents>
        <CircularWavyProgressIndicator
          progress={progress}
          modifiers={[size(35, 35)]}
          color={Colors.Orange}
          trackColor={"black"}
        />
      </Host>
    </View>
  );
}
