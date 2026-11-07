import { Platform } from "react-native";
import AndroidTimer from "./Timer.android";
import IOSTimer from "./Timer.ios";

const Timer = Platform.select({
  ios: IOSTimer,
  android: AndroidTimer,
  default: AndroidTimer,
});

export default Timer;
