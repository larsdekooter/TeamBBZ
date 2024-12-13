export type AthleteData = {
  name: string;
  birthYear: string;
  nation: string;
  club: string;
  pbs: Pb[];
  meets: MeetData[];
  id: string;
};

export type Pb = {
  event: string;
  poolSize: "25m" | "50m";
  time: string;
  points: string;
  date: Date;
  location: string;
  meet: string;
};

export type MeetData = {
  date: Date[];
  location: string;
  poolSize: "25m" | "50m" | "OW";
  club: string;
};

export type Wedstrijd = {
  startDate: Date;
  endDate: Date | null;
  name: string;
  location: string;
  country: string;
  category:
    | "club"
    | "minioren"
    | "master"
    | "nationaal"
    | "overig"
    | "marathon"
    | "competitie";
  id: string;
  enterable: boolean | undefined;
  program: { name: string; no: number }[] | undefined;
  livetimeLink: string;
};

export type Post = {
  title: string;
  link: string;
  image: string;
};
