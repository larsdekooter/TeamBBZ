import { Alert, ColorSchemeName, Text, View } from "react-native";
import {
  AthleteInfoDivRegex,
  AthleteNameRegex,
  AthleteNameDivRegex,
  ImageRegex,
  BirthYearRegex,
  NationClubRegex,
  TableRegex,
  RowRegex,
  DataRegex,
  PoolSizeRegex,
  EnglishEventName,
} from "./regex";
import { AthleteData, Pb } from "./types";

export function textColor(colorScheme: ColorSchemeName | boolean) {
  if (typeof colorScheme === "boolean") {
    return { color: colorScheme ? "#000" : "#FFF" };
  }
  return { color: colorScheme === "light" ? "#000" : "#FFF" };
}

export function getAthleteData(page: string): AthleteData {
  const athleteInfoDiv = page.match(AthleteInfoDivRegex)![0];
  const nameDiv = page.match(AthleteNameDivRegex)![0];

  const nationAndClub = page
    .match(NationClubRegex)![0]
    .replace('<div id="nationclub"><br>', "")
    .replace("</div>", "")
    .split("<br>");

  const name = nameDiv
    .match(AthleteNameRegex)![0]
    .split('<div id="name">')[1]
    .split(" <br>")[0];

  const birthYear = nameDiv.split(BirthYearRegex)[1];

  const pbTable = page
    .replace(/onmouseover="([\s\S]*?)"/gi, "")
    .match(TableRegex)![0];
  const rows = pbTable.match(RowRegex)!;
  rows.splice(0, 1);
  console.log("Mapping all data");
  const pb = rows.map((row) => {
    const data = row
      .match(DataRegex)
      ?.map((data) => data.replace(">", "").replace("<", ""))
      .filter((d) => d.length > 0)!;
    return {
      event: translateEvent(data[0]),
      poolSize: data[1],
      time: data[2],
      points: data[3],
      date: convertToDate(data[4].replace(/&nbsp;/g, " ")),
      location: data[5].replace(/&nbsp;/g, " "),
      meet: data[6],
    } as Pb;
  });
  console.log("Refreshed all data");
  return {
    name,
    birthYear,
    nation: nationAndClub[0],
    club: nationAndClub[1],
    pbs: pb,
  };
}

export function convertToDate(dateString: string) {
  const [day, month, year] = dateString.split(" ");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = monthNames.indexOf(month);

  if (monthIndex === -1) {
    // throw new Error("Invalid month format");
    Alert.alert(`Invalid date format, ${dateString}`);
  }

  return new Date(parseInt(year), monthIndex, parseInt(day));
}

export function translateEvent(event: string) {
  return event
    .replace("Freestyle", "vrije slag")
    .replace("Backstroke", "rugslag")
    .replace("Breaststroke", "schoolslag")
    .replace("Butterfly", "vlinderslag")
    .replace("Medley", "wisselslag")
    .replace("Lap", "split");
}
