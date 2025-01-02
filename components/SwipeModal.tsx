import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import {
  //   Animated,
  Dimensions,
  DimensionValue,
  GestureResponderEvent,
  Modal,
  ModalProps,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  AnimatedStyle,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type SwipeModalProps = {
  children?: ReactNode;
  onRequestClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  visible: boolean;
  onClose: () => void | undefined | null;
  height?: number;
  closeValue?: number;
};

const { height, width } = Dimensions.get("window");

export default function SwipeModal({
  children,
  onRequestClose,
  visible,
  onClose,
  height: customHeight,
  closeValue,
}: SwipeModalProps) {
  const top = useSharedValue(0);
  const closeTime = 200;
  const gesture = Gesture.Pan()
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
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }],
  }));

  const colorScheme = useColorScheme();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onRequestClose}
      visible={visible}
      transparent
      onShow={() => (top.value = 0)}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.3)" />
      <GestureHandlerRootView style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
        <Pressable
          onPress={onClose}
          style={{
            width,
            height: customHeight ? height - customHeight : height / 2,
          }}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            collapsable={false}
            style={[
              {
                width,
                height: customHeight ?? height / 2,
                backgroundColor: colorScheme === "dark" ? "#2a3137" : "#f3f5f6",
                borderRadius: 20,
                borderColor: "#ef8b22",
                borderWidth: 1,
              },
              animatedStyle,
            ]}
          >
            <View
              style={{
                height: height / 200,
                backgroundColor: "grey",
                width: width / 5,
                borderRadius: 10,
                marginTop: 10,
                left: "50%",
                transform: [{ translateX: "-50%" }],
              }}
            />
            {children}
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
