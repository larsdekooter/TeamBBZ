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
  id: string;
  clubId: string;
  data: MeetResultData;
};

export type MeetResultData = {
  events: string[];
  places: string[];
  types: string[];
  times: string[];
  points: string[];
  courses: string[];
  pbs: string[];
  percentages: string[];
  name: string;
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

export type Clubrecord = {
  distance: string;
  event: string;
  swimmers: (string | null)[];
  dates: (string | null)[] | (Date | null)[];
  locations: (string | null)[];
  meets: (string | null)[];
  times: (string | null)[];
};

export type CompetitieStand = {
  currentPosition: string;
  team: string;
  round1: {
    points: string;
    position: string;
  };
  round2: {
    points: string;
    position: string;
  };
  round3: {
    points: string;
    position: string;
  };
  round4: {
    points: string;
    position: string;
  };
  round5: {
    points: string;
    position: string;
  };
  totalPoints: string;
};
