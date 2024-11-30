export type AthleteData = {
  name: string;
  birthYear: string;
  nation: string;
  club: string;
  pbs: Pb[];
};

export type Pb = {
  event: string;
  poolSize: string;
  time: string;
  points: string;
  date: Date;
  location: string;
  meet: string;
};
