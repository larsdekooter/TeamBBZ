import { Dimensions, FlatList, Text, useColorScheme, View } from "react-native";
import Page from "../../components/Page";
import {
  getPosts,
  handleFileUpload,
  handleTimeUpload,
  textColor,
} from "../../constants/functions";
import { useEffect, useState } from "react";
import { Post } from "@/constants/types";
import PostComponent from "@/components/Post";
import SkeletonLoader from "@/components/SkeletonLoader";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import Chip from "@/components/Chip";
import { File } from "expo-file-system";
import { Time } from "@/constants/enums";

export default function Home() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState([] as Post[]);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const s = async () => {
      setPosts(await getPosts());
    };
    if (posts.length < 1) {
      s();
    }
  }, []);

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
      <Chip
        label="Compact"
        style={{ top: 40 }}
        state={compact}
        onPress={() => setCompact(!compact)}
      />

      <FlatList
        data={posts.length > 1 ? posts : new Array(10)}
        renderItem={({ item, index }) =>
          posts.length > 1 ? (
            <PostComponent post={item} key={index} compact={compact} />
          ) : (
            <SkeletonLoader loaderHeight={300 / 5} />
          )
        }
        style={{
          height: 100,
          width: Dimensions.get("window").width,
          top: 50,
          marginBottom: 50,
          zIndex: 10,
        }}
        contentContainerStyle={{
          alignItems: posts.length > 1 ? "stretch" : "center",
        }}
      />
    </Page>
  );
}
