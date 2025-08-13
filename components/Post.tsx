import { textColor } from "@/constants/functions";
import { PostRegexes } from "@/constants/regex";
import { Post } from "@/constants/types";
import { openBrowserAsync } from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, Text, useColorScheme, View } from "react-native";
import { Pressable } from "react-native";

export default function PostComponent({
  post,
  compact = true,
}: {
  post: Post;
  compact?: boolean;
}) {
  const colorScheme = useColorScheme();
  const scalingHeightAnim = useRef(new Animated.Value(0)).current;
  const scalingWidthtAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scalingHeightAnim, {
        toValue: compact ? 0 : 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scalingWidthtAnim, {
        toValue: compact ? 0 : 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [compact]);

  const scaleHeight = scalingHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300 / 5, 300 / 2],
  });
  const scaleWidth = scalingHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [453 / 5, 453 / 2],
  });

  return (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
      }}
      onPress={async () => {
        await openBrowserAsync(post.link);
      }}
    >
      <View
        style={{
          flex: 1,
          borderColor: "#ef8b22",
          borderWidth: 1,
          width: compact ? "auto" : "80%",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
          paddingVertical: 5,
          marginVertical: 5,
          flexDirection: compact ? "row" : "column",
          padding: compact ? 10 : 0,
        }}
      >
        <Animated.Image
          source={{ uri: post.image }}
          style={{
            width: scaleWidth,
            height: scaleHeight,
          }}
          borderRadius={10}
        />
        <Text
          style={{
            ...textColor(colorScheme),
            textAlign: "center",
            width: "70%",
          }}
        >
          {post.title}
          <Text style={{ color: "grey", fontStyle: "italic" }}>{`\n${
            post.link.match(PostRegexes.PostDateRegex)![0]
          }`}</Text>
        </Text>
      </View>
    </Pressable>
  );
}
