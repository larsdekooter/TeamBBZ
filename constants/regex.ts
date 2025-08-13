export class GeneralRegexes {
  static RowRegex = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;
  static OnMouseOverRegex = /onmouseover="([\s\S]*?)"/gi;
  static ContentRegex = /<div\s+class="entry-content"[^>]*>([\s\S]*?)<\/div>/i;
  static TableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i;
  static CellRegex2 = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  static CarrotRegex = />([\s\S]*?)</g;
  static IdRegex = /\?id=\d+/;
  static DivRegex = /<div[^>]*>([\s\S]*?)<\/div>/gm;
  static HrefRegex = /href\s*=\s*["']([^"']+)["']/i;
  static DataRegex = />([^<]*)</g;
}

export class SwimrankingsRegexes {
  static Athlete = {
    AthleteIdRegex: /\d{7}/gm,
    AthleteNameDivRegex: /<div\s+id="name"[^>]*>([\s\S]*?)<\/div>/i,
    NationClubRegex: /<div\s+id="nationclub"[^>]*>([\s\S]*?)<\/div>/i,
    AthleteNameRegex: /^[^\(]+/,
    BirthYearRegex: /\b(19\d{2}|20[0-2]\d)\b/g,
    AthleteTableRegex:
      /<table\s+class="athleteBest"[^>]*>(?:[^<]|<(?!\/table>))*<\/table>/gi,
  };
  static Meet = {
    MeetTableRegex:
      /<table\s+class="athleteMeet"[^>]*>(?:[^<]|<(?!\/table>))*<\/table>/gi,
    MeetIdRegex: /(?<=meetId=)\d*/g,
    ClubIdRegex: /(?<=clubId=)\d*/gm,
    TimeTableRegex: /<table\sclass="athleteRanking"[^>]*>([\s\S]*?<\/table>)/gi,
    ResultTableRegex:
      /(?<=<table\s.*class="meetResult"[^>]*>)[\s\S]*?(?=<\/table>)/gm,
  };
}

export class MeetRegexes {
  static ProgramNumberCheckRegex = /^\d{1,3}m/gm;
  static TripleNumberRegex = /\d{1,3}/g;
  static LivetimingRegex = /<a\s[^>]*>Livetiming([\s\S]*?)<\/a>/gm;
}

export class DateRegexes {
  static MonthRegex = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g;
  static Number4Regex = /\b\d{4}\b/;
  static DateRegex = /\d{2}-\d{2}-\d{4}/g;
}

export class SchemaRegexes {
  static SchemaIdRegex = /(?<=id=)[^"]*/gm;
  static SchemaGroupRegex = /(?<=<td>).*(?=<\/td>)/gm;
}

export class PostRegexes {
  static PostRegex = /<div\sclass="lp-box\sbox\d{1,2}[^>]">([\s\S]*?)<\/div>/gm;

  static PostImageRegex = /<img[^>]*>/gm;

  static PostImageSourceRegex = /src="[^"]*/gm;

  static PostTitleRegexFromImage = /alt="[^"]*/gm;

  static PostTitleRegexFromLink = /aria-label="[^"]*/gm;
  static PostDateRegex = /\d{4}\/\d{2}\/\d{2}/gm;
}

export class ClubRecordRegex {
  static TableRowRegex = /<tr\b[^>]*>[\s\S]*?(?=<tr>|<\/tr>)/gi;

  static CellReplacementRegex =
    /<td[^>]*>|<\/td>|<font[^>]*>.*<\/font>|<a\s.*?(?=title\=)title="|"\sdata-.*?(?=>)|<\/a>/gm;

  static SwimmerRegex = /^.*?(?=&#013;)/gm;

  static DateRegex = /(?<=&#013;).+?(?=&#013;)/gm;

  static LocationRegex = ClubRecordRegex.DateRegex;

  static MeetRegex = /(?<=&#013;)(?:(?!&#013;).)+?(?=\.\/\.)/gim;

  static TimeRegex = /(?<=\.\/\.).+/gm;
}

export class CompetietieRegex {
  static RowRegex = /(?<=<tr>)[\s\S]*?(?=<\/tr>)/gm;
  static CellRegex = /(?<=<td[^>]*>)[\s\S]*?(?=<\/td>)/gm;
  static LinkRegex = /(?<=>)([\s\S]*?)(?=<)/gm;
}
