import { ColorSchemeName } from "react-native";
import { Colors, Time } from "../enums";
import { DateRegexes } from "../regex";
import { convertTimestringToNumber } from "./TimeFunctions";

export function textColor(colorScheme: ColorSchemeName | boolean | null) {
  if (typeof colorScheme === "boolean") {
    return { color: colorScheme ? "#000" : "#FFF" };
  }
  return { color: colorScheme === "light" ? "#000" : "#FFF" };
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

function log<T>(val: T, index: number, array: T[]) {
  console.log({ val, index });
  return val;
}

export function wait(duration: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

export async function time<T>(
  func: () => Promise<T>,
  name?: string,
): Promise<T> {
  const start = Date.now();
  const value = await func();
  const elapsed = Date.now() - start;
  console.log(elapsed / 1000 + "s " + (name ?? func.name));
  return value;
}

export function percentageColor(
  percentage: string,
  colorScheme: ColorSchemeName | null,
) {
  if (parseFloat(percentage) >= 100) {
    if (colorScheme === "light") return Colors.LightModeGreen;
    return Colors.DarkmodeGreen;
  }
  if (colorScheme === "light") return Colors.LightmodeRed;
  return Colors.DarkmodeRed;
}

export function filterDuplicates<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

export function mapTimesPerYear(times: Time[]) {
  return times.reduce(
    (acc, time) => {
      const year = parseInt(
        time.date?.match(DateRegexes.Number4Regex)?.[0] ?? "0",
      );
      if (!(year > 0)) return acc;

      if (!acc[year]) acc[year] = [];
      acc[year].push(time);
      return acc;
    },
    {} as Record<number, Time[]>,
  );
}

export function yearProgress(times: Time[]) {
  const years = mapTimesPerYear(times);
  const yearPoints = {} as Record<string, number>;
  const yearTimes = {} as Record<string, number>;

  for (const year of Object.keys(years)) {
    const timesOfYear = years[parseInt(year)];
    const rankedTimes = timesOfYear.filter((time) => time.points > 0);

    const cumulativePoints = rankedTimes.reduce(
      (acc, time) => acc + time.points,
      0,
    );
    const averagePoints = cumulativePoints / rankedTimes.length;

    const cumulativeTimes = rankedTimes.reduce(
      (acc, time) =>
        acc +
        convertTimestringToNumber(time.time) /
          (parseInt(time.event.match(/\d+/g)?.[0] ?? "1") / 100),
      0,
    );
    const averageTime = cumulativeTimes / rankedTimes.length;

    if (!isNaN(averagePoints)) yearPoints[year] = averagePoints;

    if (!isNaN(averageTime)) yearTimes[year] = averageTime;
  }

  return { yearPoints, yearTimes };
}
