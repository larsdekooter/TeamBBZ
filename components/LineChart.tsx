import React from "react";
import { View, useColorScheme } from "react-native";
import Svg, { Line, Path, Text, Circle } from "react-native-svg";

interface LineChartProps {
  data: number[];
  labels: string[];
  size: { width: number; height: number };
  yAxisTicks?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  size,
  yAxisTicks = 5,
}) => {
  const colorScheme = useColorScheme();
  const { width, height } = size;
  const padding = { top: 40, right: 40, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const valueRange = maxValue - minValue;

  const getX = (index: number) =>
    padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (value: number) =>
    height - padding.bottom - ((value - minValue) / valueRange) * chartHeight;

  const createSmoothPath = () => {
    const points = data.map((value, index) => ({
      x: getX(index),
      y: getY(value),
    }));
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x;
      const y1 = points[i].y;
      const x2 = points[i + 1].x;
      const y2 = points[i + 1].y;

      const controlX1 = x1 + (x2 - x1) / 3;
      const controlX2 = x2 - (x2 - x1) / 3;

      path += ` C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`;
    }

    return path;
  };

  const renderYAxisTicks = () => {
    return Array.from({ length: yAxisTicks }).map((_, i) => {
      const y = height - padding.bottom - (i / (yAxisTicks - 1)) * chartHeight;
      const value = minValue + (i / (yAxisTicks - 1)) * valueRange;
      return (
        <React.Fragment key={`y-axis-${i}`}>
          <Line
            x1={padding.left}
            y1={y}
            x2={width - padding.right}
            y2={y}
            stroke={colorScheme === "light" ? "lightgray" : "dimgray"}
            strokeWidth="1"
          />
          <Text
            x={padding.left - 5}
            y={y}
            fill={colorScheme === "light" ? "black" : "white"}
            fontSize="10"
            textAnchor="end"
            alignmentBaseline="middle"
          >
            {value.toFixed(1)}
          </Text>
        </React.Fragment>
      );
    });
  };

  return (
    <View>
      <Svg width={width} height={height}>
        {renderYAxisTicks()}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke={colorScheme === "light" ? "black" : "white"}
          strokeWidth="2"
        />
        <Path
          d={createSmoothPath()}
          fill="none"
          stroke="rgb(0, 150, 200)"
          strokeWidth="2"
        />
        {data.map((value, index) => (
          <React.Fragment key={`point-${index}`}>
            <Circle
              cx={getX(index)}
              cy={getY(value)}
              r="4"
              fill="rgb(0, 150, 200)"
            />
            <Text
              x={getX(index)}
              y={height - padding.bottom + 20}
              fill={colorScheme === "light" ? "black" : "white"}
              fontSize="10"
              textAnchor="middle"
            >
              {labels[index]}
            </Text>
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
};

export default LineChart;
