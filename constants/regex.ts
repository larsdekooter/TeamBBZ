export const AthleteIdRegex = /\d{7}/gm;

export const AthleteInfoDivRegex =
  /<div\s+id="athleteinfo"[^>]*>([\s\S]*?)<\/div>/i;

export const AthleteNameDivRegex = /<div\s+id="name"[^>]*>([\s\S]*?)<\/div>/i;

export const AthleteNameRegex = /^[^\(]+/;

export const ImageRegex = /<img\s+align="top"\s+src="([^"]+)">/i;

export const BirthYearRegex = /\b(19\d{2}|20[0-2]\d)\b/g;

export const NationClubRegex = /<div\s+id="nationclub"[^>]*>([\s\S]*?)<\/div>/i;

export const AthleteTableRegex =
  /<table\s+class="athleteBest"[^>]*>(?:[^<]|<(?!\/table>))*<\/table>/gi;

export const RowRegex = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;

export const OnMouseOverRegex = /onmouseover="([\s\S]*?)"/gi;

export const DataRegex = />([^<]*)</g;

export const PoolSizeRegex = /25m|50m/gm;

export const EnglishEventName =
  /Freestyle|Backstroke|Breaststroke|Butterfly|Medley|Lap/gm;

export const MeetTableRegex =
  /<table\s+class="athleteMeet"[^>]*>(?:[^<]|<(?!\/table>))*<\/table>/gi;

export const MonthRegex = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g;

export const Number4Regex = /\b\d{4}\b/;

export const ContentRegex =
  /<div\s+class="entry-content"[^>]*>([\s\S]*?)<\/div>/i;

export const CellRegex = /<td>((?:(?!<td>|<\/td>).)*)/g;

export const TableRegex = /<table[^>]*>([\s\S]*?)<\/table>/i;

export const CellRegex2 = /<td[^>]*>([\s\S]*?)<\/td>/gi;

export const CarrotRegex = />([\s\S]*?)</g;

export const IdRegex = /\?id=\d+/;

export const DivRegex = /<div[^>]*>([\s\S]*?)<\/div>/gm;

export const DateRegex = /\d{2}-\d{2}-\d{4}/g;

export const LivetimingRegex = /<a\s[^>]*>Livetiming([\s\S]*?)<\/a>/gm;

export const HrefRefex = /href\s*=\s*["']([^"']+)["']/i;

export const TripleNumberRegex = /\d{1,3}/g;

export const PostRegex =
  /<div\sclass="lp-box\sbox\d{1,2}[^>]">([\s\S]*?)<\/div>/gm;

export const PostImageRegex = /<img[^>]*>/gm;

export const PostImageSourceRegex = /src="[^"]*/gm;

export const PostTitleRegexFromImage = /alt="[^"]*/gm;

export const PostTitleRegexFromLink = /aria-label="[^"]*/gm;

export const TimeTableRegex =
  /<table\sclass="athleteRanking"[^>]*>([\s\S]*?<\/table>)/gi;

export const ProgramNumberCheckRegex = /^\d{1,3}m/gm;

export const MeetIdRegex = /(?<=meetId=)\d*/gm;

export const ClubIdRegex = /(?<=clubId=)\d*/gm;

export const ResultTableRegex =
  /(?<=<table\s.*class="meetResult"[^>]*>)[\s\S]*?(?=<\/table>)/gm;

export const SchemaIdRegex = /(?<=id=)[^"]*/gm;

export const SchemaGroupRegex = /(?<=<td>).*(?=<\/td>)/gm;

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
  static TableRegex = /(?<=<table\sid="t1"[^>]*>\n)[\s\S]*?(?=<\/table>)/gm;
  static RowRegex = /(?<=<tr>)[\s\S]*?(?=<\/tr>)/gm;
  static CellRegex = /(?<=<td[^>]*>)[\s\S]*?(?=<\/td>)/gm;
  static LinkRegex = /(?<=>)([\s\S]*?)(?=<)/gm;
}

export const PostDateRegex = /\d{4}\/\d{2}\/\d{2}/gm;

export const WeergaveDivRegex =
  /<div\s[^>]*><br>\n[^<]*<strong>([\s\S]*)<\/div>/gm;
