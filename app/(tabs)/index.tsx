import { Dimensions, FlatList, Text, useColorScheme, View } from "react-native";
import Page from "../../components/Page";
import { getPosts, textColor } from "../../constants/functions";
import { useEffect, useState } from "react";
import { Post } from "@/constants/types";
import PostComponent from "@/components/Post";
import CheckBox from "@/components/Checkbox";
import SkeletonLoader from "@/components/SkeletonLoader";
import TeamBBZSQLite from "@/constants/TeamBBZSQLite";
import Chip from "@/components/Chip";

export default function Home() {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState([] as Post[]);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    const s = async () => {
      await TeamBBZSQLite.prepare();
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY NOT NULL, username TEXT NOT NULL, email TEXT NOT NULL, birthdate TEXT NOT NULL, club TEXT NOT NULL, country TEXT NOT NULL, secondSwimmer TEXT NULL) `;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS swimmers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NULL)`;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, darkMode INTEGER NOT NULL)`;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS times (id INTEGER PRIMARY KEY NOT NULL, event TEXT NOT NULL, time TEXT NOT NULL, poolSize TEXT NOT NULL, points NUMBER NOT NULL, swimmer NOT NULL, date TEXT NULL, meet TEXT NULL, location TEXT NULL)`;
      if (!(await TeamBBZSQLite.db.getFirstAsync("SELECT * FROM settings")))
        await TeamBBZSQLite.sql`INSERT INTO settings (darkMode) VALUES (${colorScheme === "dark" ? 1 : 0})`;

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
      {/* <View
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
      </View> */}
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
