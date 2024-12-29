import { useColorScheme, View } from "react-native";
import SocialLink from "./SocialLink";

export default function Socials() {
  const colorScheme = useColorScheme();
  return (
    <View style={{ flexDirection: "row" }}>
      <SocialLink
        icon="link"
        size={28}
        url="https://www.b-b-z.nl/"
        style={{
          backgroundColor: colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
          padding: 10,
          borderRadius: 100,
          margin: 10,
          transform: [{ rotate: "90deg" }],
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      <SocialLink
        icon="instagram"
        size={28}
        url="https://www.instagram.com/biesboschzwemmers/"
        style={{
          backgroundColor: colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
          padding: 10,
          borderRadius: 100,
          margin: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      <SocialLink
        icon="x-twitter"
        size={28}
        url="https://x.com/BiesBoschzw"
        style={{
          backgroundColor: colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
          padding: 10,
          borderRadius: 100,
          margin: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        version={6}
      />
      <SocialLink
        icon="facebook"
        size={28}
        url="https://www.facebook.com/Biesboschzwemmers"
        style={{
          backgroundColor: colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
          padding: 10,
          borderRadius: 100,
          margin: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        version={6}
      />
      <SocialLink
        icon="flickr"
        size={28}
        url="https://www.flickr.com/photos/biesboschzwemmers"
        style={{
          backgroundColor: colorScheme === "dark" ? "#2a3137" : "#d6d6d6",
          padding: 10,
          borderRadius: 100,
          margin: 10,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        version={6}
      />
    </View>
  );
}
