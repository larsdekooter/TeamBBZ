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
