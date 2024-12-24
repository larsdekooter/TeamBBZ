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
  TimeTableRegex,
  OnMouseOverRegex,
  CellRegex2,
  ProgramNumberCheckRegex,
  TableRegex,
  ClubRecordRegex,
  MeetIdRegex,
  ClubIdRegex,
  ResultTableRegex,
} from "./regex";
import {
  AthleteData,
  Clubrecord,
  MeetData,
  Pb,
  Post,
  Wedstrijd,
} from "./types";
import { getItem } from "@/utils/AsyncStorage";
import { SwimrakingEventId } from "./enums";

export function textColor(colorScheme: ColorSchemeName | boolean) {
  if (typeof colorScheme === "boolean") {
    return { color: colorScheme ? "#000" : "#FFF" };
  }
  return { color: colorScheme === "light" ? "#000" : "#FFF" };
}

function getAthleteInfo(athletePage: string, athleteId: string): AthleteData {
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
    id: athleteId,
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
  const ids = meetTable
    .match(RowRegex)!
    .toSpliced(0, 1)
    .filter((x) => !x.includes("separator"))
    .map((row) => [row.match(MeetIdRegex)![0], row.match(ClubIdRegex)![0]]);
  const meets = rows.map((row, index) => {
    return {
      date: row[0]
        .split("&nbsp;-&nbsp;")
        .map((date) => date.replace(/&nbsp;/g, " "))
        .map(formatDate)
        .map(convertToDate),
      location: row[1],
      poolSize: row[2],
      club: row[4],
      id: ids[index][0],
      clubId: ids[index][1],
    } as MeetData;
  });
  return meets;
}

export function getAthleteData(
  athletePage: string,
  meetsPage: string,
  athleteId: string
): AthleteData {
  const athleteInfo = getAthleteInfo(athletePage, athleteId);
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
      .map((p, i) => ({
        name: p,
        no: !p.match(ProgramNumberCheckRegex)
          ? Number.parseInt(p.match(TripleNumberRegex)?.[0] ?? "-1")
          : i,
      }));

    wedstrijd.livetimeLink = page
      .match(LivetimingRegex)![0]
      .match(HrefRefex)![1];

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
    if (tdMatch.includes("GEEN TRAINEN")) {
      return "Geen trainen vandaag!";
    }
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
    return ["A", ...schema].join("");
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

export async function getHistory(
  event: SwimrakingEventId,
  athleteId: string,
  poolSize: "25m" | "50m"
) {
  const page = (
    await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}&styleId=${event}`
      )
    ).text()
  ).replace(OnMouseOverRegex, "");
  const tables = page.match(TimeTableRegex)!;
  const table = poolSize === "50m" ? tables[0] : tables[1];
  const rows = table
    .match(RowRegex)!
    .toSpliced(0, 1)
    .map((row) =>
      row
        .match(/>([\s\S]*?)</gi)!
        .filter((m) => m.length > 2)
        .map((m) => m.replace(/>|</g, ""))
    )
    .map((row) => ({
      time: row[0],
      points: row[1],
      date: convertToDate(row[2].replace(/&nbsp;/g, " ")),
      location: row[3].replace(/&nbsp;/g, " "),
    }));
  return rows;
}

export function getSpecialityData(
  athleteData: AthleteData,
  shouldShow25?: boolean
) {
  const points = athleteData.pbs
    .map(({ points, event, poolSize }) => ({
      event: event,
      points: parseInt(points),
      poolSize,
    }))
    .sort((a, b) => b.points - a.points)
    .filter(({ points }) => !Number.isNaN(points));

  const pointsPerStroke = {
    butterfly: { count: 0, amount: 0 },
    backstroke: { count: 0, amount: 0 },
    breaststroke: { count: 0, amount: 0 },
    freestyle: { count: 0, amount: 0 },
    im: { count: 0, amount: 0 },
  };

  points.forEach(({ points, event }) => {
    if (event.includes("split") || (!shouldShow25 && event.includes("25m"))) {
    } else if (event.includes("vlinderslag")) {
      pointsPerStroke.butterfly.count += points;
      pointsPerStroke.butterfly.amount++;
    } else if (event.includes("rugslag")) {
      pointsPerStroke.backstroke.count += points;
      pointsPerStroke.backstroke.amount++;
    } else if (event.includes("schoolslag")) {
      pointsPerStroke.breaststroke.count += points;
      pointsPerStroke.breaststroke.amount++;
    } else if (event.includes("vrije slag")) {
      pointsPerStroke.freestyle.count += points;
      pointsPerStroke.freestyle.amount++;
    } else if (event.includes("wisselslag")) {
      pointsPerStroke.im.count += points;
      pointsPerStroke.im.amount++;
    }
  });
  Object.entries(pointsPerStroke).forEach((p) => {
    pointsPerStroke[p[0] as keyof typeof pointsPerStroke].count =
      p[1].count / p[1].amount / points[0].points;
  });
  return Object.values(pointsPerStroke).map(({ count }) => count);
}

export function calculateProgression(
  previousYear: number,
  currentYear: number
) {
  return ((previousYear - currentYear) / previousYear) * 100;
}

export async function getProgression(
  event: SwimrakingEventId,
  athleteId: string,
  poolSize: "25m" | "50m"
) {
  const history = await getHistory(event, athleteId, poolSize);

  const groupedPoints = history.reduce((acc, item) => {
    const year = item.date.getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(item);
    return acc;
  }, {} as Record<number, typeof history>);

  const result = Object.keys(groupedPoints).map((year) => {
    const points = groupedPoints[parseInt(year) as keyof typeof groupedPoints];
    points.sort((a, b) => parseInt(b.points) - parseInt(a.points));
    return { year, points: points[0] };
  });
  return result;
}

function wait(duration: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

export function mapClubrecords(page: string) {
  const table = page.match(TableRegex)![0];
  const rs = table.match(ClubRecordRegex.TableRowRegex)!;
  rs.splice(0, 2);
  const rows = rs
    .map((row) =>
      row
        .match(CellRegex2)!
        .map((cell) =>
          cell
            .replace(ClubRecordRegex.CellReplacementRegex, "")
            .replace(/>/g, "./.")
            .replace(/&#013;(?=.\/.)/gm, "")
        )
        .filter((cell) => cell.length > 0)
    )
    .map((row) => {
      const data = {
        distance: row[0],
        event: row[1],
        swimmers: [],
        dates: [],
        locations: [],
        meets: [],
        times: [],
      } as Clubrecord;
      for (let i = 2; i < row.length; i++) {
        const index = i - 2;
        if (row[i].includes("0000")) {
          data.swimmers[index] = null;
          data.dates[index] = null;
          data.locations[index] = null;
          data.meets[index] = null;
          data.times[index] = null;
        } else {
          data.swimmers[index] = row[i].match(ClubRecordRegex.SwimmerRegex)![0];
          data.dates[index] = row[i].match(ClubRecordRegex.DateRegex)![0];
          data.locations[index] = !row[i].includes("()")
            ? row[i].match(ClubRecordRegex.LocationRegex)![1]
            : null;
          data.meets[index] = !row[i].includes("()")
            ? row[i].match(ClubRecordRegex.MeetRegex)![0]
            : null;
          data.times[index] = row[i]
            .match(ClubRecordRegex.TimeRegex)![0]
            .replace(/(\.\/\.)|<strong|<i|<\/i|<\/strong/g, "");

          if (data.locations[index] === undefined) {
            data.locations[index] = data.meets[index];
            data.meets[index] = null;
          }
        }
      }
      return data;
    });
  return rows;
}

export async function getClubRecords() {
  const femalePage = await (
    await fetch(
      "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Dames&estafette=1"
    )
  ).text();
  const malePage = await (
    await fetch(
      "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Heren&estafette=1"
    )
  ).text();

  const female = mapClubrecords(femalePage);
  const male = mapClubrecords(malePage);

  return { male, female };
}

export async function getMeetData(meet: MeetData, athleteData: AthleteData) {
  const page = (
    await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=meetDetail&meetId=${meet.id}&clubId=${meet.clubId}`
      )
    ).text()
  ).replace(OnMouseOverRegex, "");
  const resultsTable = page.match(ResultTableRegex)![0];
  const rows = resultsTable.match(RowRegex)!.toSpliced(0, 1);
  const idRows = rows.filter((row) => row.includes("athleteId"));
  const idRowIndexes = idRows.map((id) => rows.findIndex((x) => x === id));

  if (idRowIndexes.length === 1) {
    rows.splice(0, 1);
    const cells = rows.map((row) =>
      row.match(CellRegex2)!.filter((cell) => cell !== "<td></td>")
    );
    return mapMeet(cells);
  } else {
    const startIndex = rows.findIndex(
      (y) => y === idRows.find((x) => x.includes(athleteData.id))
    );
    rows.splice(0, startIndex);
    const endIndex = rows.findIndex(
      (y, i) => i != 0 && y.includes("athleteId")
    );
    const data = rows.slice(0, endIndex);
    data.splice(0, 1);
    const cells = data.map((d) =>
      d.match(CellRegex2)!.filter((cell) => cell !== "<td></td>")
    );
    console.log(mapMeet(cells));
  }
}

function mapMeet(cells: string[][]) {
  const obj = {
    events: [] as string[],
    places: [] as string[],
    types: [] as string[],
    times: [] as string[],
    points: [] as string[],
    courses: [] as string[],
    pbs: [] as string[],
    percentages: [] as string[],
  };
  for (let i = 0; i < cells.length; i++) {
    const cel = cells[i];
    const data = cel
      .map(
        (x) =>
          x
            .match(DataRegex)!
            .map((y) => y.replace(/<|>/g, ""))
            .filter((z) => z.length > 0)[0]
      )
      .filter((x) => x.length > 0);
    if (data.length > 0) {
      obj.events[i] = data[0];
      obj.types[i] = data[1];
      obj.places[i] = data[2];
      obj.times[i] = data[3];
      obj.points[i] = data[4];
      obj.courses[i] = data[5];
      obj.pbs[i] = data[6];
      obj.percentages[i] = data[7];
    }
  }
  return obj;
}
