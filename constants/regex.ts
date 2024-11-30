export const AthleteIdRegex = /\d{7}/gm;

export const AthleteInfoDivRegex =
  /<div\s+id="athleteinfo"[^>]*>([\s\S]*?)<\/div>/i;

export const AthleteNameDivRegex = /<div\s+id="name"[^>]*>([\s\S]*?)<\/div>/i;

export const AthleteNameRegex = /^[^\(]+/;

export const ImageRegex = /<img\s+align="top"\s+src="([^"]+)">/i;

export const BirthYearRegex = /\b(19\d{2}|20[0-2]\d)\b/g;

export const NationClubRegex = /<div\s+id="nationclub"[^>]*>([\s\S]*?)<\/div>/i;

export const TableRegex =
  /<table\s+class="athleteBest"[^>]*>(?:[^<]|<(?!\/table>))*<\/table>/gi;

export const RowRegex = /<tr\b[^>]*>[\s\S]*?<\/tr>/gi;

export const OnMouseOverRegex = /onmouseover="([\s\S]*?)"/gi;

export const DataRegex = />([^<]*)</g;

export const PoolSizeRegex = /25m|50m/gm;

export const EnglishEventName =
  /Freestyle|Backstroke|Breaststroke|Butterfly|Medley|Lap/gm;
