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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type SwipeModalProps = {
  children?: ReactNode;
  onRequestClose?: ((event: NativeSyntheticEvent<any>) => void) | undefined;
  visible: boolean;
  onClose?: () => void;
  height?: number;
};

const { height, width } = Dimensions.get("window");

export default function SwipeModal({
  children,
  onRequestClose,
  visible,
  onClose,
  height: customHeight,
}: SwipeModalProps) {
  const top = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const { translationY } = e;
      if (translationY < 0) {
        return;
      }
      top.value = translationY;
    })
    .onEnd(() => {
      if (top.value > height / 2 / 2) {
        if (onClose) {
          onClose();
        }
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
      <GestureHandlerRootView>
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
