import { Text, useColorScheme, View } from "react-native";
import Page from "../components/Page";
import { textColor } from "../constants/functions";

export default function Profile() {
  const colorScheme = useColorScheme();
  return (
    <Page>
      <Text style={textColor(colorScheme)}>Kooter</Text>
    </Page>
  );
}
