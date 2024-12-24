import { Animated, Pressable, Dimensions, View, Text, useColorScheme,  } from 'react-native";
import { useState } from 'react';
import { textColor } from "@/constants/functions";

export default function SectionComponent({children, title}: {children: React.ReactNode, title: string}) {
  const [isExpanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const heightAnim = useState(new Animated.Value(0))[0];

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const toggleExpand = () => {
    setExpanded(!isExpanded);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 0 : 1,
        duration: isExpanded ? 200 : 500,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Pressable
      style={{
        width: Dimensions.get('window').width,
        borderColor: '#ef8b22',
        borderWidth: 1,
        borderRadius: 6,
        paddingVertical: 10,
        paddingHorizontal: 20,
        overflow: 'hidden',
        marginVertical: 10,
      }}
      onPress={toggleExpand}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{ color: 'white', textTransform: 'capitalize' }}>
          {title}
        </Text>
        <Animated.Text style={{ transform: [{ rotate }], color: 'white' }}>
          >
        </Animated.Text>
      </View>
      <Animated.View
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000],
          }),
          opacity: heightAnim,
          marginTop: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 10],
          }),
        }}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
