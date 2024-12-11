import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";
import Page from "../../components/Page";
import { getPosts, textColor } from "../../constants/functions";
import { useEffect, useState } from "react";
import { Post } from "@/constants/types";
import { openBrowserAsync } from "expo-web-browser";

export default function Home() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState([] as Post[]);
  const scalingFactor = 1 / 2;

  useEffect(() => {
    const s = async () => {
      setPosts(await getPosts());
    };
    s();
  }, []);

  if (posts.length > 1) {
    return (
      <Page>
        <Text
          style={{
            ...textColor(colorScheme),
            top: 80,
            fontWeight: "bold",
            fontSize: 50,
          }}
        >
          Berichten
        </Text>
        <FlatList
          data={posts}
          renderItem={({ item, index }) => (
            <Pressable
              key={index}
              style={{
                flex: 1,
                alignItems: "center",
              }}
              onPress={async () => {
                await openBrowserAsync(item.link);
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderColor: "grey",
                  borderWidth: 1,
                  width: "80%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 10,
                  paddingVertical: 5,
                  marginVertical: 5,
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  width={453 * scalingFactor}
                  height={300 * scalingFactor}
                  borderRadius={10}
                />
                <Text
                  style={{
                    ...textColor(colorScheme),
                    textAlign: "center",
                    width: "90%",
                  }}
                >
                  {item.title}
                </Text>
              </View>
            </Pressable>
          )}
          style={{
            height: 100,
            width: Dimensions.get("window").width,
            top: 100,
            marginBottom: 100,
            zIndex: 10,
          }}
        />
      </Page>
    );
  } else {
    return (
      <Page>
        <ActivityIndicator color="#ef8b22" size="large" />
      </Page>
    );
  }
}
