import { Alert, ColorSchemeName } from "react-native";
import {
  GeneralRegexes,
  SwimrankingsRegexes,
  ClubRecordRegex,
  CompetietieRegex,
  DateRegexes,
  MeetRegexes,
  PostRegexes,
  SchemaRegexes,
} from "./regex";
import {
  AthleteData,
  Clubrecord,
  CompetitieStand,
  MeetData,
  MeetResultData,
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
  const nameDiv = athletePage.match(
    SwimrankingsRegexes.Athlete.AthleteNameDivRegex
  )![0];

  const nationAndClub = athletePage
    .match(SwimrankingsRegexes.Athlete.NationClubRegex)![0]
    .replace('<div id="nationclub"><br>', "")
    .replace("</div>", "")
    .split("<br>");

  const name = nameDiv
    .match(SwimrankingsRegexes.Athlete.AthleteNameRegex)![0]
    .split('<div id="name">')[1]
    .split(" <br>")[0];

  const birthYear = nameDiv.split(
    SwimrankingsRegexes.Athlete.BirthYearRegex
  )[1];

  const pbTable = athletePage
    .replace(/onmouseover="([\s\S]*?)"/gi, "")
    .match(SwimrankingsRegexes.Athlete.AthleteTableRegex)![0];
  const rows = pbTable.match(GeneralRegexes.RowRegex)!;
  rows.splice(0, 1);
  const pb = rows.map((row) => {
    const data = row
      .match(GeneralRegexes.DataRegex)
      ?.map((data) => data.replace(/<|>|M(?!\w)/g, ""))
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
  const meetTable = meetsPage.match(
    SwimrankingsRegexes.Meet.MeetTableRegex
  )![0];
  const rows = meetTable
    .match(GeneralRegexes.RowRegex)!
    .map(
      (meet) =>
        meet
          .match(GeneralRegexes.DataRegex)!
          .map((match) => match.replace("<", "").replace(">", ""))
          .filter((match) => match.length > 0)!
    )
    .filter((row) => row.length > 1);
  rows.splice(0, 1);
  const ids = meetTable
    .match(GeneralRegexes.RowRegex)!
    .toSpliced(0, 1)
    .filter((x) => !x.includes("separator"))
    .map((row) => [
      row.match(SwimrankingsRegexes.Meet.MeetIdRegex)![0],
      row.match(SwimrankingsRegexes.Meet.ClubIdRegex)![0],
    ]);
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

export async function getMeetCalendar() {
  const wedstrijdenPage = await (
    await fetch("https://www.b-b-z.nl/kalender/?actie=volledig")
  ).text();
  const table = wedstrijdenPage.match(GeneralRegexes.TableRegex)![0];
  const rows = table
    .match(GeneralRegexes.RowRegex)!
    .map((row) => {
      return row
        .match(GeneralRegexes.CellRegex2)
        ?.filter((m) => m != null)
        .map((m) => m.replace(/<td>/g, "").replace(/<\/td>/g, ""))
        .filter((m) => m.length > 0)
        .map((m) => {
          if (m.includes("<a")) {
            let r = m
              .match(GeneralRegexes.CarrotRegex)![0]
              .replace(/>/g, "")
              .replace(/</g, "");
            if (m.includes("?id=")) {
              r += "SPLITHERE";
              r += m.match(GeneralRegexes.IdRegex)![0].replace("?id=", "");
            }
            return r;
          }
          return m;
        });
    })
    .filter((s) => s != null)
    .map((w) =>
      w.length > 6
        ? ({
            startDate: new Date(
              new Date(w[0]).setHours(parseInt(w[5][0] + w[5][1]))
            ),
            endDate: new Date(w[1]),
            name: w[2].split("SPLITHERE")[0],
            location: w[3],
            country: w[4],
            category: w[6],
            id: w[2].split("SPLITHERE")[1],
          } as Wedstrijd)
        : ({
            startDate: new Date(
              new Date(w[0]).setHours(parseInt(w[4][0] + w[4][1]))
            ),
            name: w[1].split("SPLITHERE")[0],
            location: w[2],
            country: w[3],
            category: w[5],
            id: w[1].split("SPLITHERE")[1],
          } as Wedstrijd)
    );
  return rows;
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
    console.error(`Invalid date format, ${dateString}`);
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
    const month = dateCopy.match(DateRegexes.MonthRegex)!;
    const year = dateCopy.match(DateRegexes.Number4Regex)!;
    return `${date} ${month} ${year}`;
  } else if (date.match(DateRegexes.Number4Regex) === null) {
    const year = arr[1].match(DateRegexes.Number4Regex)![0];
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

export async function fetchSwimrankingSwimmer(username: string) {
  const athleteWithUsername = await (
    await fetch(
      `https://www.swimrankings.net/index.php?&internalRequest=athleteFind&athlete_clubId=-1&athlete_gender=-1&athlete_lastname=${username.replace(
        " ",
        "%20"
      )}&athlete_firstname=`
    )
  ).text();
  const table = athleteWithUsername.split("<tr");
  table.splice(0, 2);
  const athleteId = table
    .find((t) => !t.includes("*"))
    ?.match(SwimrankingsRegexes.Athlete.AthleteIdRegex)![0];
  if (athleteId) {
    const athletePage = await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}`
      )
    ).text();
    const meetsPage = await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}&athletePage=MEET`
      )
    ).text();
    const aData = getAthleteData(athletePage, meetsPage, athleteId);
    //TODO: rework this to historyFirstStroke
    const history25mFreestyle = await getProgression(
      SwimrakingEventId[aData.pbs[0].event as keyof typeof SwimrakingEventId],
      athleteId,
      aData.pbs[0].poolSize
    );
    if (history25mFreestyle) return { aData, history25mFreestyle };
  }
  return {};
}

export async function getWedstrijdData(wedstrijd: Wedstrijd) {
  const page = await (
    await fetch(`https://www.b-b-z.nl/kalender/?id=${wedstrijd.id}`)
  ).text();
  const inschrijfDatumMatch = page
    .split("\n")
    .find((l) => l.includes("Inschrijfdatum:"))
    ?.match(GeneralRegexes.DivRegex)!;
  const inschrijfDatum = inschrijfDatumMatch[
    inschrijfDatumMatch.length - 1
  ]!.match(GeneralRegexes.CarrotRegex)![0]
    .replace(/>|</g, "")
    .match(DateRegexes.DateRegex)![0];
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
        no: !p.match(MeetRegexes.ProgramNumberCheckRegex)
          ? Number.parseInt(p.match(MeetRegexes.TripleNumberRegex)?.[0] ?? "-1")
          : i,
      }));

    wedstrijd.livetimeLink = page
      .match(MeetRegexes.LivetimingRegex)![0]
      .match(GeneralRegexes.HrefRegex)![1];

    return wedstrijd;
  } catch {
    return wedstrijd;
  }
}

export async function getSchemaData(group?: string) {
  const date = new Date();
  const weekNo = getWeekNumber(new Date(date.setDate(12)));

  const res = await (
    await fetch(
      `https://www.b-b-z.nl/training/schema/?jaar=${date.getFullYear()}&week=${weekNo}`
    )
  ).text();
  const contentDiv = res.match(GeneralRegexes.TableRegex)![0];
  const trs = contentDiv.match(GeneralRegexes.RowRegex)!;
  const tdMatch = trs.filter((tr) =>
    tr.includes(
      `${date.getDate()}-${
        `${date.getMonth() + 1}`.length == 1
          ? `0${date.getMonth() + 1}`
          : `${date.getMonth() + 1}`
      }-${date.getFullYear()}`
    )
  );
  if (tdMatch.length > 0) {
    const index = group
      ? tdMatch.findIndex((match) => match.includes(group))
      : 0;
    const id = tdMatch[index].match(SchemaRegexes.SchemaIdRegex)?.[0];
    if (tdMatch[index].includes("GEEN TRAINEN")) {
      return { schema: "Geen trainen vandaag!", groups: [] };
    }
    if (!id) {
      return { schema: "Schema bekijken niet toegestaan", groups: [] };
    }
    const schemaPage = await (
      await fetch(`https://www.b-b-z.nl/training/schema/?actie=bekijk&id=${id}`)
    ).text();
    const contentDiv = schemaPage
      .match(GeneralRegexes.ContentRegex)![0]
      .replace(/&#8243;/g, '"')
      .replace(/&#8217;/g, "'")
      .replace(/&#8221;/g, '"')
      .replace(/&#8242/g, '"')
      .replace(/\uFFFD/g, '"');
    const schema = contentDiv.split("<br />");
    schema.splice(0, 1);
    schema.splice(schema.length - 1, 1);
    return {
      schema: ["A\n", ...schema.map((line) => `${line.trim()}\n`)].join(""),
      groups: tdMatch.map(
        (match) => match.match(SchemaRegexes.SchemaGroupRegex)![1]
      ),
    };
  } else {
    return { schema: "Geen schema vandaag!", groups: [] };
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
  const posts = page.match(PostRegexes.PostRegex)!.map((post) => ({
    image: post
      .match(PostRegexes.PostImageRegex)![0]
      .match(PostRegexes.PostImageSourceRegex)![0]
      .replace('src="', ""),
    link: post
      .match(GeneralRegexes.HrefRegex)![0]
      .replace('href="', "")
      .replace('"', ""),
    title:
      post
        .match(PostRegexes.PostTitleRegexFromLink)![0]
        .replace('aria-label="', "")
        .replace('"', "") ||
      post
        .match(PostRegexes.PostTitleRegexFromImage)![0]
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
  ).replace(GeneralRegexes.OnMouseOverRegex, "");
  const tables = page.match(SwimrankingsRegexes.Meet.TimeTableRegex)!;
  const table = poolSize === "50m" ? tables[0] : tables[1];
  const rows = table
    .match(GeneralRegexes.RowRegex)!
    .toSpliced(0, 1)
    .map((row) =>
      row
        .match(/>([\s\S]*?)</gi)!
        .map((m) => m.replace(/<|>|M(?!\w)/g, ""))
        .filter((m) => m.length > 0)
    )
    .map((row) => ({
      time: row[0],
      points: row[1],
      date: convertToDate(row[2].replace(/&nbsp;/g, " ")),
      location: row[3].replace(/&nbsp;/g, " "),
    }));
  return rows;
}

function log<T>(val: T, index: number, array: T[]) {
  console.log({ val, index });
  return val;
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
      p[1].count / (p[1].amount || 1) / (points[0].points || 1);
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

export function wait(duration: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

export function mapClubrecords(page: string) {
  const table = page.match(GeneralRegexes.TableRegex)![0];
  const rs = table.match(ClubRecordRegex.TableRowRegex)!;
  rs.splice(0, 2);
  const rows = rs
    .map((row) =>
      row
        .match(GeneralRegexes.CellRegex2)!
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
        if (row[i].includes("0000") && row[i].length === 43) {
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
  ).replace(GeneralRegexes.OnMouseOverRegex, "");
  const meetTitle = page.match(
    /(?<=<td\sclass="titleLeft">).*?(?=<\/td>)/gm
  )![0];
  const resultsTable = page.match(
    SwimrankingsRegexes.Meet.ResultTableRegex
  )![0];
  const rows = resultsTable.match(GeneralRegexes.RowRegex)!.toSpliced(0, 1);
  const idRows = rows.filter((row) => row.includes("athleteId"));
  const idRowIndexes = idRows.map((id) => rows.findIndex((x) => x === id));

  if (idRowIndexes.length === 1) {
    rows.splice(0, 1);
    const cells = rows.map((row) =>
      row
        .match(GeneralRegexes.CellRegex2)!
        .filter((cell) => cell !== "<td></td>")
    );
    return mapMeet(cells, meetTitle) as MeetResultData;
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
    const cells = data
      .filter((d) => !d.includes("height=15") && !d.includes("meetResultHead"))
      .map((d) =>
        d
          .match(GeneralRegexes.CellRegex2)!
          .filter((cell) => cell !== "<td></td>")
      );
    return mapMeet(cells, meetTitle);
  }
}

function mapMeet(cells: string[][], name: string): MeetResultData {
  const obj = {
    events: [] as string[],
    places: [] as string[],
    types: [] as string[],
    times: [] as string[],
    points: [] as string[],
    courses: [] as string[],
    pbs: [] as string[],
    percentages: [] as string[],
    name,
  };
  for (let i = 0; i < cells.length; i++) {
    const cel = cells[i];
    const data = cel
      .map(
        (x) =>
          x
            .match(GeneralRegexes.DataRegex)!
            .map((y) => y.replace(/<|>/g, ""))
            .filter((z) => z.length > 0)[0]
      )
      .map((x) => (typeof x === "undefined" ? "-" : x))
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

export function calculateAveragePoints(
  { pbs }: AthleteData,
  exclude25: boolean = true
) {
  pbs = pbs
    .filter((pb) => pb.points !== "-")
    .filter((pb) => (exclude25 ? !pb.event.includes("25m") : true));
  return (
    pbs.reduce((acc, current) => acc + parseInt(current.points), 0) / pbs.length
  ).toFixed(2);
}

export async function getCompetitieStand(): Promise<CompetitieStand[]> {
  const response = await (
    await fetch(
      "https://zwemcompetitie.knzb.nl/competitieservice/index.php?klasse=A&district=2"
    )
  ).text();
  const rows = response
    .match(CompetietieRegex.RowRegex)!
    .toSpliced(0, 4)
    .map((row) => {
      const cells = row.match(CompetietieRegex.CellRegex)!;
      return {
        team: cells[1],
        round1: parseFloat(
          cells[3]
            .match(CompetietieRegex.LinkRegex)![0]
            .replace(/\./g, "")
            .replace(/,/g, ".")
        ),
        round2: parseFloat(
          cells[5]
            .match(CompetietieRegex.LinkRegex)![0]
            .replace(/\./g, "")
            .replace(/,/g, ".")
        ),
        round3: parseFloat(
          cells[7]
            .match(CompetietieRegex.LinkRegex)![0]
            .replace(/\./g, "")
            .replace(/,/g, ".")
        ),
        round4: parseFloat(
          cells[9]
            .match(CompetietieRegex.LinkRegex)![0]
            .replace(/\./g, "")
            .replace(/,/g, ".")
        ),
        round5: parseFloat(
          cells[11]
            .match(CompetietieRegex.LinkRegex)![0]
            .replace(/\./g, "")
            .replace(/,/g, ".")
        ),
        total: parseFloat(cells[13].replace(/\./g, "").replace(/,/g, ".")),
      };
    });
  return rows;
}
