import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import {
  Dimensions,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

type SwipeModalProps = {
  children?: ReactNode;
  onRequestClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  visible: boolean;
  onClose: () => void | undefined | null;
  height?: number;
  closeValue?: number;
  style?: StyleProp<ViewStyle>;
};

const { height, width } = Dimensions.get("window");

export default function SwipeModal({
  children,
  onRequestClose,
  visible,
  onClose,
  height: customHeight,
  closeValue,
  style,
}: SwipeModalProps) {
  const top = useSharedValue(0);
  const closeTime = 200;
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const { translationY } = e;
      if (translationY < 0) {
        return;
      }
      top.value = translationY;
    })
    .onEnd(() => {
      const h = closeValue ?? (customHeight ? customHeight / 2 : height / 4);
      if (top.value > h) {
        top.value = withTiming(height, { duration: closeTime });
        setTimeout(() => {
          onClose();
        }, closeTime);
      } else {
        top.value = 0;
      }
    })
    .runOnJS(true)
    .activeOffsetY([-20, 20]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }],
  }));

  const colorScheme = useColorScheme();

  const flex = customHeight ? customHeight / height : 1 / 2;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onRequestClose}
      visible={visible}
      transparent
      onShow={() => (top.value = 0)}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="rgba(0,0,0,0.3)" />
        <GestureHandlerRootView
          style={{ backgroundColor: "rgba(0,0,0,0.3)", flex: 1 }}
        >
          <Pressable
            onPress={onClose}
            style={{
              width,
              flex: 1 - flex,
            }}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View
              collapsable={false}
              style={[
                {
                  width,
                  flex,
                  backgroundColor:
                    colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                  borderRadius: 20,
                  borderColor: "#ef8b22",
                  borderWidth: 1,
                  top: 0,
                },
                animatedStyle,
              ]}
            >
              <View
                style={{
                  height: 4,
                  backgroundColor: "grey",
                  width: width / 5,
                  borderRadius: 10,
                  marginTop: 10,
                  left: "50%",
                  transform: [{ translateX: "-50%" }],
                }}
              />
              <View
                style={[
                  style,
                  {
                    height: (customHeight ?? height / 2) - 4,
                    flex: 1,
                  },
                ]}
              >
                {children}
              </View>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
}
