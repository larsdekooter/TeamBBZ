import { Text, useColorScheme } from "react-native";
import Page from "../../components/Page";
import { textColor } from "../../constants/functions";

export default function Home() {
  const colorScheme = useColorScheme();
  return (
    <Page>
      <Text style={textColor(colorScheme)}>Home pagina</Text>
    </Page>
  );
}
