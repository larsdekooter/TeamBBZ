import { Colors } from "@/constants/enums";
import { Text } from "react-native";
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

export default function Timer({
  time,
  progress,
}: {
  time: string;
  progress?: number;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.TransparantDarkOrange,
        width: 112,
        height: 56,
        elevation: 30,
        borderRadius: 16,
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        bottom: 16,
        right: 16,
        paddingVertical: 16,
        paddingHorizontal: 10,
        flexDirection: "row",
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
        }}
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
