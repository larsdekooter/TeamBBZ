import React from "react";
import { View, useColorScheme } from "react-native";
import Svg, { Line, Path, Text, Circle } from "react-native-svg";

interface LineChartProps {
  data: number[];
  labels: string[];
  size: { width: number; height: number };
  yAxisTicks?: number;
  pointColor?: string;
  lineColor?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  labels,
  size,
  yAxisTicks = 5,
  pointColor = "rgb(0, 150, 200)",
  lineColor = "rgb(0, 150, 200)",
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
    const tension = 0.5; // Adjust this value to control the smoothness (0.0 to 1.0)

    const catmullRomSpline = (
      p0: any,
      p1: any,
      p2: any,
      p3: any,
      t: number
    ) => {
      const t2 = t * t;
      const t3 = t2 * t;
      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    };

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      for (let t = 0; t <= 1; t += 0.1) {
        const pt = catmullRomSpline(p0, p1, p2, p3, t);
        path += ` L ${pt.x} ${pt.y}`;
      }
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
          stroke={lineColor}
          strokeWidth="2"
        />
        {data.map((value, index) => (
          <React.Fragment key={`point-${index}`}>
            <Circle cx={getX(index)} cy={getY(value)} r="4" fill={pointColor} />
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
