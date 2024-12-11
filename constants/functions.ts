import { Alert, ColorSchemeName, Platform, Text, View } from "react-native";
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
  CarrotRegex,
  DateRegex,
  DivRegex,
  CellRegex,
  LivetimingRegex,
  HrefRefex,
  TripleNumberRegex,
  PostRegex,
  PostImageRegex,
  PostImageSourceRegex,
  PostTitleRegexFromImage,
  PostTitleRegexFromLink,
} from "./regex";
import { AthleteData, MeetData, Pb, Post, Wedstrijd } from "./types";
import { getItem } from "@/utils/AsyncStorage";

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

export function getWeekNumber(date: Date): number {
  const mutatedDate = new Date(date.getTime());

  // Find Thursday of this week starting on Monday
  mutatedDate.setDate(mutatedDate.getDate() + 4 - (mutatedDate.getDay() || 7));
  const thursday = mutatedDate.getTime();

  // Find January 1st
  mutatedDate.setMonth(0); // January
  mutatedDate.setDate(1); // 1st
  const jan1st = mutatedDate.getTime();

  // Round the amount of days to compensate for daylight saving time
  const days = Math.round((thursday - jan1st) / 86400000); // 1 day = 86400000 ms
  return Math.floor(days / 7) + 1;
}

export async function getWedstrijdData(wedstrijd: Wedstrijd) {
  const page = await (
    await fetch(`https://www.b-b-z.nl/kalender/?id=${wedstrijd.id}`)
  ).text();
  const inschrijfDatumMatch = page
    .split("\n")
    .find((l) => l.includes("Inschrijfdatum:"))
    ?.match(DivRegex)!;
  const inschrijfDatum = inschrijfDatumMatch[
    inschrijfDatumMatch.length - 1
  ]!.match(CarrotRegex)![0]
    .replace(/>|</g, "")
    .match(DateRegex)![0];
  const [day, month, year] = inschrijfDatum.split("-");
  const entryDate = new Date(+year, +month - 1, +day);
  if (new Date().getTime() > entryDate.getTime()) {
    wedstrijd.enterable = false;
  } else {
    wedstrijd.enterable = true;
  }
  try {
    const program = page
      .match(/<pre>([\s\S]*?)<\/pre>/gm)![0]
      .replace(/<pre>/g, "")
      .split("\r");

    if (Number.isNaN(parseInt(program[0][0]))) {
      program.splice(0, 1);
    }
    program.splice(program.length - 1, 1);

    wedstrijd.program = program
      .filter((p) => p.length > 1)
      .map((p) => ({
        name: p,
        no: Number.parseInt(p.match(TripleNumberRegex)?.[0] ?? "-1"),
      }));

    wedstrijd.livetimeLink = `https://b-b-z.nl/livetiming/${wedstrijd.startDate.getFullYear()}-${
      wedstrijd.startDate.getMonth() + 1 < 10
        ? `0${wedstrijd.startDate.getMonth() + 1}`
        : wedstrijd.startDate.getMonth() + 1
    }-${
      wedstrijd.startDate.getDate() < 10
        ? `0${wedstrijd.startDate.getDate()}`
        : wedstrijd.startDate.getDate()
    }=${wedstrijd.name.replace(/\s/g, "_")}`;

    return wedstrijd;
  } catch {
    return wedstrijd;
  }
}

export async function getSchemaData() {
  const date = new Date();
  const weekNo = getWeekNumber(new Date(date.getTime()));
  const res = await (
    await fetch(
      `https://www.b-b-z.nl/training/schema/?jaar=2024&week=${weekNo}`
    )
  ).text();
  const contentDiv = res.match(ContentRegex)![0];
  const trs = contentDiv.match(RowRegex)!;
  const tdMatch = trs.find((tr) =>
    tr.includes(
      `${date.getDate()}-${
        `${date.getMonth() + 1}`.length == 1
          ? `0${date.getMonth() + 1}`
          : `${date.getMonth() + 1}`
      }-${date.getFullYear()}`
    )
  );
  if (tdMatch) {
    const id = tdMatch.match(CellRegex)![2].match(Number4Regex)![0];
    const schemaPage = await (
      await fetch(`https://www.b-b-z.nl/training/schema/?actie=bekijk&id=${id}`)
    ).text();
    const contentDiv = schemaPage
      .match(ContentRegex)![0]
      .replace(/&#8243;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8221;/g, "'")
      .replace(/&#8242/g, '"');
    const schema = contentDiv.split("<br />");
    schema.splice(0, 1);
    schema.splice(schema.length - 1, 1);
    return ["A\n", ...schema].join("");
    // .replace(/\n/g, "\n");
  } else {
    return "Geen schema vandaag!";
  }
}

export async function enterMeet(wedstrijd: Wedstrijd, program: number[]) {
  const soort = wedstrijd.name;
  let datum = `${wedstrijd.startDate.getFullYear()}`;
  datum +=
    `${wedstrijd.startDate.getMonth() + 1}`.length > 1
      ? `-${wedstrijd.startDate.getMonth() + 1}`
      : `-0${wedstrijd.startDate.getMonth() + 1}`;
  datum +=
    `${wedstrijd.startDate.getDate()}`.length > 1
      ? `-${wedstrijd.startDate.getDate()}`
      : `-0${wedstrijd.startDate.getDate()}`;
  const plaats = wedstrijd.location;
  const baanlengte = "25";
  const naam = await getItem("username");
  if (!naam) {
    return Alert.alert("Login voordat je jezelf inschrijft!");
  }
  const email = await getItem("email");
  if (!email) {
    return Alert.alert("Login voordat je jezelf inschrijft!");
  }

  let params = new URLSearchParams({
    soort,
    datum,
    plaats,
    baanlengte,
    naam: naam.username,
    email: email.email,
  }).toString();

  if (program.length == 0) {
    return Alert.alert("Kies programmanummers waar je je op wilt inschrijven!");
  }
  for (const p of program) {
    params +=
      "&" +
      new URLSearchParams({
        "nummers[]": p.toString(),
      }).toString();
  }

  await fetch(`https://www.b-b-z.nl/kalender/inschrijven/?id=${wedstrijd.id}`, {
    method: "POST",
    body: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function getPosts() {
  const page = await (await fetch("https://www.b-b-z.nl/")).text();
  const posts = page.match(PostRegex)!.map((post) => ({
    image: post
      .match(PostImageRegex)![0]
      .match(PostImageSourceRegex)![0]
      .replace('src="', ""),
    link: post.match(HrefRefex)![0].replace('href="', "").replace('"', ""),
    title:
      post
        .match(PostTitleRegexFromLink)![0]
        .replace('aria-label="', "")
        .replace('"', "") ||
      post
        .match(PostTitleRegexFromImage)![0]
        .replace('alt="', "")
        .replace('"', ""),
  }));
  return posts as Post[];
}
