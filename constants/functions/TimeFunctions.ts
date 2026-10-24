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
        t.date?.match(DateRegexes.Number4Regex)?.[0] ===
        time.date?.match(DateRegexes.Number4Regex)?.[0],
    )
    .sort(
      (a, b) =>
        convertTimestringToNumber(a.time) - convertTimestringToNumber(b.time),
    );

  return yearTimes[0].time === time.time;
}
