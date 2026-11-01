import { Dispatch, SetStateAction } from "react";
import { Time } from "../enums";
import { DateRegexes } from "../regex";

export function convertTimestringToNumber(time: string) {
  if (time.length > 5) {
    const [minutes, seconds] = time.split(":") as string[];
    return parseInt(minutes) * 60 + parseFloat(seconds);
  } else {
    return parseFloat(time);
  }
}

export function convertTimeNumberToString(time: string | number) {
  if (typeof time === "string") time = parseInt(time);

  const minutes = Math.floor(time / 60);
  const seconds = (time - minutes * 60).toFixed(2);
  return `${minutes}:${seconds.length === 5 ? seconds : `0${seconds}`}`;
}

export function isImprovement(time: string, pb: string) {
  const timeNumber = convertTimestringToNumber(time);
  const pbNumber = convertTimestringToNumber(pb);
  return timeNumber < pbNumber;
}

export function getFastestFromArray(times: Time[]) {
  return times
    .map((time) => ({ ...time, time: convertTimestringToNumber(time.time) }))
    .sort((a, b) => a.time - b.time)[0];
}

export function isFastestFromYear(time: Time, index: number, times: Time[]) {
  const yearTimes = times
    .filter(
      (t) =>
        t.event === time.event &&
        t.poolSize === time.poolSize &&
        t.date?.match(DateRegexes.Number4Regex)?.[0] ===
          time.date?.match(DateRegexes.Number4Regex)?.[0],
    )
    .sort(
      (a, b) =>
        convertTimestringToNumber(a.time) - convertTimestringToNumber(b.time),
    );

  return yearTimes[0].time === time.time;
}

export function findMultipleEntries(times: Time[]) {
  const counts = new Map<string, number>();

  for (const { event, poolSize } of times) {
    const key = `${event}|${poolSize}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return times.filter(
    ({ event, poolSize }) => (counts.get(`${event}|${poolSize}`) ?? 0) > 1,
  );
}

export function getEventComparisonEvents(
  times: Time[],
  swimmerSelected: string,
) {
  return findMultipleEntries(
    times
      .filter(({ swimmer }) => swimmer === swimmerSelected)
      .filter(isFastestFromYear),
  )
    .map(
      ({ event, poolSize }) => `${event} ${poolSize === "25m" ? "SC" : "LC"}`,
    )
    .filter((e) => !e.includes("Lap"))
    .filter((event, index, array) => array.indexOf(event) === index);
}

export function formatEvent(event: string) {
  if (event.length === 0) return event;
  const digits = event.match(/\d+/g)![0];
  const name = event.substring(digits.length + 1, event.length);
  return `${digits}m ${name
    .split(/\s/g)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")}`;
}
