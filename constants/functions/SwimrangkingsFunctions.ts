import { SwimrakingEventId, Time } from "../enums";
import { SwimrankingsRequestOptions } from "../options";
import { DateRegexes, GeneralRegexes, SwimrankingsRegexes } from "../regex";
import { AthleteData, MeetData, MeetResultData, Pb } from "../types";
import { convertTimestringToNumber } from "./TimeFunctions";

function getAthleteInfo(athletePage: string, athleteId: string): AthleteData {
  const nameDiv = athletePage.match(
    SwimrankingsRegexes.Athlete.AthleteNameDivRegex,
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
    SwimrankingsRegexes.Athlete.BirthYearRegex,
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
    SwimrankingsRegexes.Meet.MeetTableRegex,
  )![0];
  const rows = meetTable
    .match(GeneralRegexes.RowRegex)!
    .map(
      (meet) =>
        meet
          .match(GeneralRegexes.DataRegex)!
          .map((match) => match.replace("<", "").replace(">", ""))
          .filter((match) => match.length > 0)!,
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

export function getAthleteData(
  athletePage: string,
  meetsPage: string,
  athleteId: string,
): AthleteData {
  const athleteInfo = getAthleteInfo(athletePage, athleteId);
  const meetsInfo = getMeetsInfo(meetsPage);
  return { ...athleteInfo, meets: meetsInfo };
}
export async function fetchSwimrankingSwimmer(username: string) {
  const athleteWithUsername = await (
    await fetch(
      `https://www.swimrankings.net/index.php?&internalRequest=athleteFind&athlete_clubId=-1&athlete_gender=-1&athlete_lastname=${username.replace(
        /\s/g,
        "%20",
      )}&athlete_firstname=`,
      SwimrankingsRequestOptions,
    )
  ).text();

  const table = athleteWithUsername.split("<tr");
  table.splice(0, 2);
  const athleteId = table
    .find((t) => !t.includes("*"))
    ?.match(SwimrankingsRegexes.Athlete.AthleteIdRegex)![0];
  if (athleteId) {
    const [athletePage, meetsPage] = await Promise.all([
      fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}`,
        SwimrankingsRequestOptions,
      ).then((r) => r.text()),
      fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}&athletePage=MEET`,
        SwimrankingsRequestOptions,
      ).then((r) => r.text()),
    ]);
    const aData = getAthleteData(athletePage, meetsPage, athleteId);
    //TODO: rework this to historyFirstStroke
    const history25mFreestyle = await getProgression(
      SwimrakingEventId[aData.pbs[0].event as keyof typeof SwimrakingEventId],
      athleteId,
      aData.pbs[0].poolSize,
    );
    if (history25mFreestyle) return { aData, history25mFreestyle };
  }
  return {};
}

export async function getHistory(
  event: SwimrakingEventId,
  athleteId: string,
  poolSize: "25m" | "50m",
) {
  const page = (
    await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=athleteDetail&athleteId=${athleteId}&styleId=${event}`,
        SwimrankingsRequestOptions,
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
        .filter((m) => m.length > 0),
    )
    .map((row) => ({
      time: row[0],
      points: row[1],
      date: convertToDate(row[2].replace(/&nbsp;/g, " ")),
      location: row[3].replace(/&nbsp;/g, " "),
    }));
  return rows;
}

export function getSpecialityDataFromTimes(times: Time[]) {
  const points = times
    .filter(filterFastestFromArray)
    .map(({ points, event, poolSize }) => ({ event, points, poolSize }))
    .filter(({ points, event }) => points > 0 && !event.includes("Lap"))
    .sort((a, b) => b.points - a.points);

  const pointsPerStroke = {
    butterfly: { count: 0, amount: 0 },
    backstroke: { count: 0, amount: 0 },
    breaststroke: { count: 0, amount: 0 },
    freestyle: { count: 0, amount: 0 },
    medley: { count: 0, amount: 0 },
  };

  points.forEach(({ points, event }) => {
    if (event.toLowerCase().includes("vlinderslag")) {
      pointsPerStroke.butterfly.count += points;
      pointsPerStroke.butterfly.amount++;
    } else if (event.toLowerCase().includes("rugslag")) {
      pointsPerStroke.backstroke.count += points;
      pointsPerStroke.backstroke.amount++;
    } else if (event.toLowerCase().includes("schoolslag")) {
      pointsPerStroke.breaststroke.count += points;
      pointsPerStroke.breaststroke.amount++;
    } else if (event.toLowerCase().includes("vrije slag")) {
      pointsPerStroke.freestyle.count += points;
      pointsPerStroke.freestyle.amount++;
    } else if (event.toLowerCase().includes("wisselslag")) {
      pointsPerStroke.medley.count += points;
      pointsPerStroke.medley.amount++;
    }
  });

  Object.entries(pointsPerStroke).forEach((p) => {
    pointsPerStroke[p[0] as keyof typeof pointsPerStroke].count =
      p[1].count / (p[1].amount || 1) / (points[0].points || 1);
  });

  return Object.values(pointsPerStroke).map(({ count }) => count);
}

export function getSpecialityData(
  athleteData: AthleteData,
  shouldShow25?: boolean,
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
  currentYear: number,
) {
  return ((previousYear - currentYear) / previousYear) * 100;
}

export async function getProgression(
  event: SwimrakingEventId,
  athleteId: string,
  poolSize: "25m" | "50m",
) {
  const history = await getHistory(event, athleteId, poolSize);

  const groupedPoints = history.reduce(
    (acc, item) => {
      const year = item.date.getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(item);
      return acc;
    },
    {} as Record<number, typeof history>,
  );

  const result = Object.keys(groupedPoints).map((year) => {
    const points = groupedPoints[parseInt(year) as keyof typeof groupedPoints];
    points.map((point, i) => {
      if (point.points === "-") point.points = "0";
      return point;
    });
    points.sort((a, b) => parseInt(b.points) - parseInt(a.points));
    return { year, points: points[0] };
  });
  return result;
}

export async function getMeetData(meet: MeetData, athleteData: AthleteData) {
  const page = (
    await (
      await fetch(
        `https://www.swimrankings.net/index.php?page=meetDetail&meetId=${meet.id}&clubId=${meet.clubId}`,
        SwimrankingsRequestOptions,
      )
    ).text()
  ).replace(GeneralRegexes.OnMouseOverRegex, "");
  const meetTitle = page.match(
    /(?<=<td\sclass="titleLeft">).*?(?=<\/td>)/gm,
  )![0];
  const resultsTable = page.match(
    SwimrankingsRegexes.Meet.ResultTableRegex,
  )![0];
  const rows = resultsTable.match(GeneralRegexes.RowRegex)!.toSpliced(0, 1);
  const idRows = rows.filter((row) => row.includes("athleteId"));
  const idRowIndexes = idRows.map((id) => rows.findIndex((x) => x === id));

  if (idRowIndexes.length === 1) {
    rows.splice(0, 1);
    const cells = rows.map((row) =>
      row
        .match(GeneralRegexes.CellRegex2)!
        .filter((cell) => cell !== "<td></td>"),
    );
    return mapMeet(cells, meetTitle) as MeetResultData;
  } else {
    const startIndex = rows.findIndex(
      (y) => y === idRows.find((x) => x.includes(athleteData.id)),
    );
    rows.splice(0, startIndex);
    const endIndex = rows.findIndex(
      (y, i) => i != 0 && y.includes("athleteId"),
    );
    const data = rows.slice(0, endIndex);
    data.splice(0, 1);
    const cells = data
      .filter((d) => !d.includes("height=15") && !d.includes("meetResultHead"))
      .map((d) =>
        d
          .match(GeneralRegexes.CellRegex2)!
          .filter((cell) => cell !== "<td></td>"),
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
            .filter((z) => z.length > 0)[0],
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
export function translateEvent(event: string) {
  return event
    .replace("Freestyle", "vrije slag")
    .replace("Backstroke", "rugslag")
    .replace("Breaststroke", "schoolslag")
    .replace("Butterfly", "vlinderslag")
    .replace("Medley", "wisselslag")
    .replace("Lap", "split");
}

export function convertToDate(dateString: string) {
  const [day, month, year] = dateString.split(" ");
  const monthNames = [
    "jan",
    "feb",
    "mrt",
    "apr",
    "mei",
    "jun",
    "jul",
    "aug",
    "sep",
    "okt",
    "nov",
    "dec",
  ];
  const monthIndex = monthNames.indexOf(month.toLowerCase());

  if (monthIndex === -1) {
    // throw new Error("Invalid month format");
    console.log(`\u001b[1;31m Invalid date format, ${dateString}`);
  }

  return new Date(parseInt(year), monthIndex, parseInt(day));
}

export function formatDate(date: string, i: number, arr: string[]) {
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
export function filterFastestFromArray(
  time: Time,
  index: number,
  times: Time[],
) {
  const currentTime = time.time;
  const sameEventTimes = times
    .filter((t) => t.event === time.event && t.poolSize === time.poolSize)
    .sort(
      (a, b) =>
        convertTimestringToNumber(a.time) - convertTimestringToNumber(b.time),
    );
  return !(
    convertTimestringToNumber(sameEventTimes[0].time) <
    convertTimestringToNumber(currentTime)
  );
}

export function calculateAveragePoints(
  { pbs }: AthleteData,
  exclude25: boolean = true,
) {
  pbs = pbs
    .filter((pb) => pb.points !== "-")
    .filter((pb) => (exclude25 ? !pb.event.includes("25m") : true));
  return (
    pbs.reduce((acc, current) => acc + parseInt(current.points), 0) / pbs.length
  ).toFixed(2);
}
