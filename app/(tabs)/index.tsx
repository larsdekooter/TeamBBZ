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
import PostComponent from "@/components/Post";
import CheckBox from "@/components/Checkbox";

export default function Home() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState([] as Post[]);
  const [compact, setCompact] = useState(true);
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
            top: 30,
            fontWeight: "bold",
            fontSize: 50,
          }}
        >
          Berichten
        </Text>
        <View
          style={{
            flexDirection: "row",
            top: 40,
            justifyContent: "space-between",
            display: "flex",
            width: Dimensions.get("window").width,
            paddingHorizontal: 100,
          }}
        >
          <Text style={[textColor(colorScheme)]}>Compact</Text>
          <CheckBox checked={compact} onPress={() => setCompact(!compact)} />
        </View>

        <FlatList
          data={posts}
          renderItem={({ item, index }) => (
            <PostComponent post={item} key={index} compact={compact} />
          )}
          style={{
            height: 100,
            width: Dimensions.get("window").width,
            top: 50,
            marginBottom: 50,
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
