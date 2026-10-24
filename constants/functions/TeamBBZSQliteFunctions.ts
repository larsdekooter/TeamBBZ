import { File } from "expo-file-system";
import TeamBBZSQLite from "../TeamBBZSQLite";
import { Time } from "../enums";
import { wait } from "./GeneralFunctions";

export async function handleTimeUpload(fileText: string) {
  const recievedTimes = JSON.parse(fileText) as Time[];
  const statement = await TeamBBZSQLite.db.prepareAsync(
    "INSERT INTO times (event, time, poolSize, points, date, meet, location, swimmer) VALUES ($event, $time, $poolSize, $points, $date, $meet, $location, $swimmer)",
  );
  const times = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
  try {
    // TODO: Update time if new information about it
    for (const time of recievedTimes) {
      if (
        times.find(
          (t) =>
            t.event === time.event &&
            t.poolSize === time.poolSize &&
            t.time === time.time &&
            t.date === time.date &&
            t.swimmer === time.swimmer,
        )
      )
        continue;
      await statement.executeAsync({
        $event: time.event,
        $time: time.time,
        $poolSize: time.poolSize,
        $points: time.points ?? 0,
        $date: time.date,
        $meet: time.meet,
        $location: time.location,
        $swimmer: time.swimmer,
      } as any);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await statement.finalizeAsync();
    const ts = await TeamBBZSQLite.sql<Time>`SELECT * FROM times`;
    return ts;
  }
}

export async function handleFileUpload(
  url: string,
  fileName?: string,
  shouldWait?: boolean,
) {
  console.log(url);
  const file = new File(url);
  console.log(file.uri);
  if (
    fileName &&
    !fileName.match(/Persoonlijke_Records([\s\S]*?).json/gm)?.[0] &&
    !fileName.match(/Geschiedenis_([\s\S]*?).json/gm)?.[0]
  )
    return console.log("SOME TING WONG"); //TODO: Show the error to the user
  if (shouldWait) await wait(500);
  const fileText = await file.text();
  return fileText;
}
