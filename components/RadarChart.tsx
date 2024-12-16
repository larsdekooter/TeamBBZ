import React from "react";
import { View, useColorScheme } from "react-native";
import Svg, { Polygon, Line, Text } from "react-native-svg";

interface RadarChartProps {
  data: number[];
  size: number;
  axes: string[];
  rings?: number;
}

interface Coordinate {
  x: number;
  y: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size,
  axes,
  rings = 5,
}) => {
  const colorScheme = useColorScheme();
  const center: number = size / 2;
  const radius: number = size * 0.4;
  const labelOffset: number = 20; // Offset for positioning labels outside the graph

  const angleSlice: number = (Math.PI * 2) / axes.length;

  const getCoordinates = (value: number, index: number): Coordinate => {
    const angle: number = angleSlice * index - Math.PI / 2;
    const x: number = center + radius * Math.cos(angle) * value;
    const y: number = center + radius * Math.sin(angle) * value;
    return { x, y };
  };

  const getLabelCoordinates = (index: number): Coordinate => {
    const angle: number = angleSlice * index - Math.PI / 2;
    const x: number = center + (radius + labelOffset) * Math.cos(angle);
    const y: number = center + (radius + labelOffset) * Math.sin(angle);
    return { x, y };
  };

  const points: string = data
    .map((value, index) => {
      const { x, y } = getCoordinates(value, index);
      return `${x},${y}`;
    })
    .join(" ");

  const renderRings = () => {
    return Array.from({ length: rings }).map((_, i) => {
      const points = axes
        .map((_, index) => {
          const { x, y } = getCoordinates((i + 1) / rings, index);
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <Polygon
          key={`ring-${i}`}
          points={points}
          fill="none"
          stroke={colorScheme === "light" ? "lightgray" : "dimgray"}
          strokeWidth="1"
        />
      );
    });
  };

  return (
    <View>
      <Svg width={size} height={size}>
        {renderRings()}
        {axes.map((axis, index) => {
          const { x, y } = getCoordinates(1, index);
          const labelPos = getLabelCoordinates(index);
          return (
            <React.Fragment key={axis}>
              <Line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke={colorScheme === "light" ? "gray" : "lightgray"}
                strokeWidth="1"
              />
              <Text
                x={labelPos.x}
                y={labelPos.y}
                fill={colorScheme === "light" ? "black" : "white"}
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {axis}
              </Text>
            </React.Fragment>
          );
        })}
        <Polygon
          points={points}
          fill="rgba(0, 150, 200, 0.5)"
          stroke="rgb(0, 150, 200)"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

export default RadarChart;
