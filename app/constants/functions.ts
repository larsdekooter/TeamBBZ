import { ColorSchemeName } from "react-native";

export function textColor(colorScheme: ColorSchemeName) {
  return { color: colorScheme === "light" ? "#000" : "#FFF" };
}
