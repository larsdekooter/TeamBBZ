import { Platform } from "react-native";
import AndroidSwitch from "./Switch.android";
import IOSSwitch from "./Switch.ios";

const Switch = Platform.select({
  ios: IOSSwitch,
  android: AndroidSwitch,
  default: AndroidSwitch,
});

export default Switch;
