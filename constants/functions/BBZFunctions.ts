import { Alert } from "react-native";
import {
  ClubRecordRegex,
  DateRegexes,
  GeneralRegexes,
  MeetRegexes,
  PostRegexes,
  SchemaRegexes,
} from "../regex";
import {
  CalendarSwimmer,
  Clubrecord,
  MeetResult,
  Post,
  RelayClubrecord,
  Result,
  Wedstrijd,
} from "../types";
import { getWeekNumber, time } from "./GeneralFunctions";
import { Profile } from "../enums";
import TeamBBZSQLite from "../TeamBBZSQLite";

export async function getResult(id: string): Promise<Result[]> {
  const page = await fetch(
    "https://www.b-b-z.nl/zwemmen/uitslagen/?id=" + id,
  ).then((res) => res.text());

  const data = [];

  const personTables = page
    .match(
      /<table[\s\S]*?>[\s\S]*?<\/table>[\s\S]*?<table[\s\S]*?>[\s\S]*?<\/table>[\s\S]*?<table[\s\S]*?>[\s\S]*?<\/table>/gm,
    )!
    .toSpliced(0, 2);

  for (const table of personTables) {
    const textMatches = table.match(/(?<=<em id=f9>)[\s\S]*?(?=<\/td>)/gm)!;
    const obj = {
      name: textMatches[0],
      birtDate: textMatches[1],
      id: textMatches[2],
      team: textMatches[3],
      events: [] as string[],
      places: [] as string[],
      times: [] as string[],
      pbs: [] as string[],
      percentages: [] as string[],
      points: [] as string[],
    };
    textMatches[4].split("<br>").forEach((m, i) => (obj.events[i] = m));
    table
      .match(/(?<=<td align=right width=4%>)[\s\S]*?(?=<\/td>)/gm)![0]
      .match(/<[\s\S]*?>\d*/gm)!
      .forEach(
        (m, i) =>
          (obj.places[i] = m.replace("<br>", "").replace("<em id=f9>", "")),
      );
    textMatches[6].split("<br>").forEach((m, i) => (obj.times[i] = m));
    textMatches[7].split("<br>").forEach(
      (m, i) =>
        (obj.pbs[i] = m
          .replace("<i>", "")
          .replace("</i>", "")
          .replace(/&#8211;/gm, "-")),
    );
    textMatches[8].split("<br>").forEach((m, i) => (obj.percentages[i] = m));
    textMatches[textMatches.length - 1]
      .split("<br>")
      .forEach((m, i) =>
        m.length > 0 ? (obj.points[i] = m.replace("&nbsp;Pnt.", "")) : null,
      );

    data.push(obj);
  }
  return data;
}

export async function getResultMeets(): Promise<
  {
    date: Date;
    name: string;
    poolSize: "25" | "50" | "OW";
    location: string;
    category: "competitie" | "masters" | "minioren" | "limiet" | "lac";
    id: string;
  }[]
> {
  const resultData: MeetResult[] = [];

  const page = await time(
    () =>
      fetch("https://www.b-b-z.nl/zwemmen/uitslagen/").then((res) =>
        res.text(),
      ),
    "Fetch Result Page",
  );
  const resultTable = page.match(GeneralRegexes.GlobalTableRegex)![1];
  if (!resultTable.match(GeneralRegexes.RowRegex)) {
    return [];
  }
  const tableRows = resultTable
    .match(GeneralRegexes.RowRegex)!
    .toSpliced(0, 1)
    .toSpliced(-1, 1)
    .filter(
      (row) =>
        !row.includes("strong") &&
        !row.includes('<td colspan="5" height="10"></td>'),
    )
    .splice(0, 10);
  for (const row of tableRows) {
    const data = {
      date: new Date(
        row
          .match(DateRegexes.DateRegex)![0]
          .replace(GeneralRegexes.dMYToMDYDateFormat, "$2/$1/$3"),
      ),
      name: row.match(MeetRegexes.ResultNameRegex)![0],
      poolSize: row.match(MeetRegexes.PoolSizeRegex)?.[0] as "25" | "50" | "OW",
      location: row.match(MeetRegexes.LocationRegex)![0],
      category: row.match(MeetRegexes.CategoryRegex)![0] as
        | "competitie"
        | "masters"
        | "minioren"
        | "limiet"
        | "lac",
      id: row.match(MeetRegexes.ResultIdRegex)![0],
    };
    resultData.push(data);
  }
  return resultData;
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
      w!.length > 6
        ? ({
            startDate: new Date(
              new Date(w![0]).setHours(parseInt(w![5][0] + w![5][1])),
            ),
            endDate: new Date(w![1]),
            name: w![2].split("SPLITHERE")[0],
            location: w![3],
            country: w![4],
            category: w![6],
            id: w![2].split("SPLITHERE")[1],
          } as Wedstrijd)
        : ({
            startDate: new Date(
              new Date(w![0]).setHours(parseInt(w![4][0] + w![4][1])),
            ),
            name: w![1].split("SPLITHERE")[0],
            location: w![2],
            country: w![3],
            category: w![5],
            id: w![1].split("SPLITHERE")[1],
          } as Wedstrijd),
    );
  return rows;
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
        name: p.replace(/\t/g, " "),
        no: !p.match(MeetRegexes.ProgramNumberCheckRegex)
          ? Number.parseInt(p.match(MeetRegexes.TripleNumberRegex)?.[0] ?? "-1")
          : i,
      }));
    wedstrijd.livetimeLink =
      page
        .match(MeetRegexes.LivetimingRegex)?.[0]
        .match(GeneralRegexes.HrefRegex)?.[1] ?? "";
    let swimmers: CalendarSwimmer[];

    try {
      // Means there is an opstelling
      swimmers = getOpstellingFromPageIfOpstelling(page);
    } catch {
      // Means there is no opstelling
      const entered = page.match(MeetRegexes.EnterersRegex)![0];
      swimmers = [];
      entered.match(/(?<=<li>)[\s\S]*?(?=<\/li>)/gi)?.forEach((match, i) => {
        const nameAndNumbers = match.replace("nummer(s):", "");
        swimmers[i] = {
          name: nameAndNumbers.match(/[a-zA-Z]+/g)?.join(" ") ?? "ERROR",
          id: "",
          programs: [],
        };
        match.match(/\d+/g)?.forEach((programNumber, j) => {
          const programName = wedstrijd.program?.find(
            (p) => p.no === parseInt(programNumber),
          )?.name;
          swimmers[i].programs[j] = {
            name: programName ?? "ERROR",
            number: programNumber,
            pb: "",
          };
        });
      });
    }
    wedstrijd.swimmers = swimmers;
    return wedstrijd;
  } catch (e) {
    // console.error(e);
    return wedstrijd;
  }
}

function getOpstellingFromPageIfOpstelling(page: string) {
  const opstellingTable = page.match(GeneralRegexes.GlobalTableRegex)![5];
  const rows = opstellingTable.match(GeneralRegexes.LookupRowRegex)!;
  const swimmers: CalendarSwimmer[] = [];

  for (const row of rows) {
    const cells = row
      .match(GeneralRegexes.CellRegexLookup)
      ?.map((cell) =>
        cell
          .replace(/<em id=f8>/g, "")
          .replace(/&eacute;/g, "é")
          .replace(/<br>/g, " ")
          .trim(),
      )!
      .filter((l) => l.length > 0)!;
    const swimmer = {} as CalendarSwimmer;
    swimmer.id = cells[0];
    swimmer.name = cells[1];
    swimmer.programs = [];
    cells[3]
      .split(" ")
      .forEach(
        (n, i) => (swimmer.programs[i] = { number: n, name: "", pb: "" }),
      );
    cells[4]
      .split(/\s(?=\d)/g)
      .forEach((p, i) => (swimmer.programs[i].name = p));
    cells[5].split(" ").forEach((pb, i) => (swimmer.programs[i].pb = pb));
    swimmers.push(swimmer);
  }
  return swimmers;
}

export async function getSchemaData(group?: string, date = new Date()) {
  const weekNo = getWeekNumber(date);

  const res = await (
    await fetch(
      `https://www.b-b-z.nl/training/schema/?jaar=${date.getFullYear()}&week=${weekNo}`,
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
      }-${date.getFullYear()}`,
    ),
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
      schema: [`A \n`, ...schema.map((line) => `${line.trim()}\n`)].join(""),
      groups: tdMatch.map(
        (match) => match.match(SchemaRegexes.SchemaGroupRegex)![1],
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
  const profile = await TeamBBZSQLite.db.getFirstAsync<Profile>(
    "SELECT * FROM profile",
  );
  if (!profile) {
    return Alert.alert("Login voordat je jezelf inschrijft!");
  }

  let params = new URLSearchParams({
    soort,
    datum,
    plaats,
    baanlengte,
    naam: profile.username,
    email: profile.email,
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
            .replace(/&#013;(?=.\/.)/gm, ""),
        )
        .filter((cell) => cell.length > 0),
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
//TODO: Fix this function to recognize two <td></td> as one empty entry
export function mapRelayClubrecords(page: string) {
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
            .replace(/&#013;(?=.\/.)/gm, ""),
        )
        .filter((cell) => cell.length > 0),
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
      } as RelayClubrecord;
      for (let i = 2; i < row.length; i++) {
        const index = i - 2;
        if (
          (row[i].includes("0000") &&
            (row[i].length === 43 || row[i].length === 42)) ||
          row[i] === "<td></td>"
        ) {
          data.swimmers[index] = null;
          data.dates[index] = null;
          data.locations[index] = null;
          data.meets[index] = null;
          data.times[index] = null;
        } else {
          data.swimmers[index] = row[i].match(
            ClubRecordRegex.RelaySwimmerRegex,
          )!;
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

export function getAgeGroupsForClubrecord(
  relay: boolean,
  gender: "mixed" | "women" | "men",
) {
  if (relay) {
    if (gender === "mixed")
      return [
        "Onder 8",
        "Onder 10",
        "Onder 12",
        "Onder 14",
        "Onder 16",
        "Onder 18",
        "Senioren",
      ];
    if (gender === "women") return ["Onder 14", "Onder 16", "Senioren"];
    else return ["Onder 14", "Onder 16", "Onder 18", "Senioren"];
  } else if (gender === "men")
    return [
      "Onder 8",
      "Onder 10",
      "Onder 12",
      "Onder 14",
      "Onder 16",
      "Onder 18",
      "Onder 20",
      "Senioren",
    ];
  else
    return [
      "Onder 8",
      "Onder 10",
      "Onder 12",
      "Onder 14",
      "Onder 16",
      "Onder 18",
      "Senioren",
    ];
}

export async function getClubRecords() {
  const femalePage = await time(
    () =>
      fetch(
        "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Dames&estafette=1",
      ).then((res) => res.text()),
    "Dames Estafettes Clubrecords",
  );

  const malePage = await time(
    () =>
      fetch(
        "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Heren&estafette=1",
      ).then((res) => res.text()),
    "Heren Clubrecords",
  );

  const relayMixedPage = await time(
    () =>
      fetch(
        "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Gemengd&estafette=4",
      ).then((res) => res.text()),
    "Gemengde Estafettes Clubrecords",
  );
  const relayFemalePage = await time(
    () =>
      fetch(
        "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Dames&estafette=4",
      ).then((res) => res.text()),
    "Dames Estafettes",
  );
  const relayMalePage = await time(
    () =>
      fetch(
        "https://www.b-b-z.nl/zwemmen/overzicht-clubrecords/?geslacht=Heren&estafette=4",
      ).then((res) => res.text()),
    "Heren Estafette",
  );

  const female = mapClubrecords(femalePage);
  const male = mapClubrecords(malePage);
  const relayMixed = mapRelayClubrecords(relayMixedPage);
  const relayWomen = mapRelayClubrecords(relayFemalePage);
  const relayMen = mapRelayClubrecords(relayMalePage);

  return { male, female, relayMixed, relayWomen, relayMen };
}

export function filterSwimmers(wedstrijd: Wedstrijd, programNumber: number) {
  return wedstrijd.swimmers?.filter((swimmer) =>
    swimmer.programs
      ?.map(({ number }) => number)
      .includes(programNumber.toString()),
  );
}
