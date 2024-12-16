import Page from "@/components/Page";
import RadarChart from "@/components/RadarChart";
import { View } from "react-native";

export default function Test() {
  const data = [0.7, 0.8, 0.9, 0.67, 0.8];
  const axes = [
    "Vlinderslag",
    "Rugslag",
    "Schoolslag",
    "Vrije Slag",
    "Wisselslag",
  ];

  return (
    <Page>
      <RadarChart data={data} size={500} axes={axes} />
    </Page>
  );
}
