import {
  openDatabaseAsync,
  SQLiteDatabase,
  SQLiteTaggedQuery,
} from "expo-sqlite";

export default class TeamBBZSQLite {
  static db: SQLiteDatabase;
  static sql: <T = unknown>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => SQLiteTaggedQuery<T>;

  constructor() {}
  static async prepare() {
    TeamBBZSQLite.db = await openDatabaseAsync("TeamBBZ");
    TeamBBZSQLite.sql = this.db.sql;
  }
}
