import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import TeamBBZSQLite from "../TeamBBZSQLite";

interface TeamBBZSQLiteContextType {
  isReady: boolean;
}

const TeamBBZSQLiteContext = createContext<TeamBBZSQLiteContextType>({
  isReady: false,
});

export function TeamBBZSQLiteProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      await TeamBBZSQLite.prepare();
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY NOT NULL, username TEXT NOT NULL, email TEXT NOT NULL, birthdate TEXT NOT NULL, club TEXT NOT NULL, country TEXT NOT NULL, devMode BOOLEAN NULL, autoSaveTimes INTEGER NULL) `;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS swimmers (id INTEGER PRIMARY KEY NOT NULL, name TEXT NULL)`;
      await TeamBBZSQLite.sql`CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY NOT NULL, darkMode INTEGER NOT NULL)`;
      await TeamBBZSQLite.sql`
      CREATE TABLE IF NOT EXISTS times (
        id INTEGER PRIMARY KEY NOT NULL,
        event TEXT NOT NULL,
        time TEXT NOT NULL,
        poolSize TEXT NOT NULL,
        points NUMBER NOT NULL,
        swimmer TEXT NOT NULL, -- Added missing type
        date TEXT NULL,
        meet TEXT NULL,
        location TEXT NULL,

        CONSTRAINT unique_swimmer_performance UNIQUE (swimmer, event, time, poolSize, date)
);
      `;
      setIsReady(true);
    };

    initDatabase();
  }, []);

  return (
    <TeamBBZSQLiteContext.Provider value={{ isReady }}>
      {children}
    </TeamBBZSQLiteContext.Provider>
  );
}

export const useTeamBBZSQLite = () => useContext(TeamBBZSQLiteContext);
