import { useEffect, useState } from "react";
import { Animated } from "react-native";
import { Dimensions, Modal, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ErrorModal({
  error,
  onEnd,
}: {
  error: string;
  onEnd: () => void;
}) {
  const colorscheme = useColorScheme();
  const widthAnim = useState(new Animated.Value(1))[0];
  const paddingHorizontalAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (error.length > 0) {
      widthAnim.setValue(1);
      Animated.parallel([
        Animated.timing(widthAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(paddingHorizontalAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onEnd();
        }
      });
    }
  }, [error]);

  const width = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const paddingHorizontal = paddingHorizontalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Modal visible={error.length > 0} transparent animationType="slide">
      <SafeAreaView style={{ alignItems: "center", flex: 1 }}>
        <View
          style={{
            backgroundColor: colorscheme === "dark" ? "#181c20" : "#fff",
            top: Dimensions.get("window").height - 150,
            borderColor: "#ef8b22",
            borderWidth: 2,
            width: "90%",
            height: 80,
            justifyContent: "space-between",
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              color: colorscheme === "light" ? "#000" : "#fff",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              textAlignVertical: "center",
              fontWeight: "bold",
              fontSize: 20,

              paddingHorizontal: 20,
              marginTop: 15,
            }}
          >
            {error}
          </Text>
          <Animated.View
            style={{
              backgroundColor: "#ef8b22",
              height: 20,
              width,
              paddingHorizontal,
              bottom: 0,
            }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
