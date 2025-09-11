import { ReactNode, useState } from "react";
import {
  Dimensions,
  Modal,
  NativeSyntheticEvent,
  Pressable,
  StyleProp,
  Text,
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
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import ButtonComponent from "./ButtonComponent";
import { textColor } from "@/constants/functions";
import { Colors } from "@/constants/enums";

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
  const top = useSharedValue(height);
  const opened = useSharedValue(0);

  const closeHeight =
    closeValue ?? (customHeight ? customHeight / 2 : height / 4);
  const animationDuration = 200;

  const handleClose = () => {
    top.value = withTiming(height, { duration: animationDuration });
    opened.value === 1
      ? (opened.value = withTiming(0, { duration: animationDuration }))
      : null;
    setTimeout(() => {
      onClose();
    }, animationDuration);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const { translationY } = e;
      if (translationY < 0) {
        return;
      }
      if (top.value < closeHeight && translationY > closeHeight) {
        // When the modal is swiped down to closeHeight or lower
        opened.value = withTiming(0, { duration: animationDuration });
      } else if (top.value > closeHeight && translationY < closeHeight) {
        // When the modal is swiped back up
        opened.value = withTiming(1, { duration: animationDuration });
      }
      top.value = translationY;
    })
    .onEnd(() => {
      if (top.value > closeHeight) {
        handleClose();
      } else {
        top.value = 0;
      }
    })
    .runOnJS(true)
    .activeOffsetY([-20, 20]);

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      opened.value,
      [0, 1],
      ["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]
    ),
  }));

  const colorScheme = useColorScheme();

  const flex = customHeight ? customHeight / height : 1 / 2;

  return (
    <Modal
      onRequestClose={onRequestClose}
      visible={visible}
      transparent
      onShow={() => {
        top.value = height;
        top.value = withTiming(0, { duration: animationDuration });
        opened.value = withTiming(1, { duration: animationDuration });
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Animated.View style={[{ flex: 1 }, backgroundAnimatedStyle]}>
            <Pressable
              onPress={handleClose}
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
                      colorScheme === "dark"
                        ? Colors.ModalDarkBackground
                        : Colors.ModalLightBackground,
                    borderRadius: 20,
                    borderColor: Colors.Orange,
                    borderWidth: 1,
                    top: 0,
                  },
                  modalAnimatedStyle,
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 20,
                      flex: 1,
                    },
                  ]}
                >
                  {children}
                  <ButtonComponent
                    onPress={handleClose}
                    style={{
                      width: "95%",
                      paddingVertical: 10,
                      backgroundColor:
                        colorScheme === "light"
                          ? Colors.ModalLightBackground
                          : Colors.ModalDarkBackground,
                    }}
                  >
                    <Text
                      style={[textColor(colorScheme), { fontWeight: "bold" }]}
                    >
                      Sluit
                    </Text>
                  </ButtonComponent>
                </View>
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </Modal>
  );
}
