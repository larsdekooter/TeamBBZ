import { Alert, ColorSchemeName, Text, View } from "react-native";
import {
  AthleteInfoDivRegex,
  AthleteNameRegex,
  AthleteNameDivRegex,
  ImageRegex,
  BirthYearRegex,
  NationClubRegex,
  AthleteTableRegex,
  RowRegex,
  DataRegex,
  MeetTableRegex,
  MonthRegex,
  Number4Regex,
  ContentRegex,
} from "./regex";
import { AthleteData, MeetData, Pb } from "./types";

export function textColor(colorScheme: ColorSchemeName | boolean) {
  if (typeof colorScheme === "boolean") {
    return { color: colorScheme ? "#000" : "#FFF" };
  }
  return { color: colorScheme === "light" ? "#000" : "#FFF" };
}

function getAthleteInfo(athletePage: string): AthleteData {
  const athleteInfoDiv = athletePage.match(AthleteInfoDivRegex)![0];
  const nameDiv = athletePage.match(AthleteNameDivRegex)![0];

  const nationAndClub = athletePage
    .match(NationClubRegex)![0]
    .replace('<div id="nationclub"><br>', "")
    .replace("</div>", "")
    .split("<br>");

  const name = nameDiv
    .match(AthleteNameRegex)![0]
    .split('<div id="name">')[1]
    .split(" <br>")[0];

  const birthYear = nameDiv.split(BirthYearRegex)[1];

  const pbTable = athletePage
    .replace(/onmouseover="([\s\S]*?)"/gi, "")
    .match(AthleteTableRegex)![0];
  const rows = pbTable.match(RowRegex)!;
  rows.splice(0, 1);
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
  return {
    name,
    birthYear,
    nation: nationAndClub[0],
    club: nationAndClub[1],
    pbs: pb,
    meets: [],
  };
}

function getMeetsInfo(meetsPage: string): MeetData[] {
  const meetTable = meetsPage.match(MeetTableRegex)![0];
  const rows = meetTable
    .match(RowRegex)!
    .map(
      (meet) =>
        meet
          .match(DataRegex)!
          .map((match) => match.replace("<", "").replace(">", ""))
          .filter((match) => match.length > 0)!
    )
    .filter((row) => row.length > 1);
  rows.splice(0, 1);
  const meets = rows.map((row) => {
    return {
      date: row[0]
        .split("&nbsp;-&nbsp;")
        .map((date) => date.replace(/&nbsp;/g, " "))
        .map(formatDate)
        .map(convertToDate),
      location: row[1],
      poolSize: row[2],
      club: row[4],
    } as MeetData;
  });
  return meets;
}

export function getAthleteData(
  athletePage: string,
  meetsPage: string
): AthleteData {
  const athleteInfo = getAthleteInfo(athletePage);
  const meetsInfo = getMeetsInfo(meetsPage);
  return { ...athleteInfo, meets: meetsInfo };
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

function formatDate(date: string, i: number, arr: string[]) {
  if (date.length === 2 || date.length === 1) {
    const dateCopy = arr[1];
    const month = dateCopy.match(MonthRegex)!;
    const year = dateCopy.match(Number4Regex)!;
    return `${date} ${month} ${year}`;
  } else if (date.match(Number4Regex) === null) {
    const year = arr[1].match(Number4Regex)![0];
    return `${date} ${year}`;
  } else return date;
}

export function getSchema(page: string) {
  const contentDiv = page.match(ContentRegex)![0];
  if (
    contentDiv.includes(
      "<p>Er staan (nog) geen schema&#8217;s in de database voor deze week.</p>"
    )
  ) {
    return "";
  }

  const schemaTableLook = ["ma", "ma", "di", "woe", "do", "zat"];
  console.log(contentDiv.match(RowRegex)[2]);
}

export function getWeekNumber(date: Date): number {
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const currentDay = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - currentDay);

  // Get first day of year
  const yearStart = new Date(date.getFullYear(), 0, 1);
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );

  return weekNo;
}
