import { CompetietieRegex } from "../regex";
import { CompetitieStand } from "../types";

export async function getCompetitieStand(): Promise<CompetitieStand[]> {
  const response = await (
    await fetch(
      "https://zwemcompetitie.knzb.nl/competitieservice/index.php?klasse=B&district=2",
    )
  ).text();

  const table = response.match(CompetietieRegex.TableRegex)![0];
  return (
    table.match(CompetietieRegex.TableRowRegex)?.map((row) => ({
      team: row.match(CompetietieRegex.TeamNameRegex)![0],
      round1: parseInt(
        row.match(CompetietieRegex.RoundPointsRegex)![0].replace(".", ""),
      ),
      round2: parseInt(
        row.match(CompetietieRegex.RoundPointsRegex)![1].replace(".", ""),
      ),
      round3: parseInt(
        row.match(CompetietieRegex.RoundPointsRegex)![2].replace(".", ""),
      ),
      round4: parseInt(
        row.match(CompetietieRegex.RoundPointsRegex)![3].replace(".", ""),
      ),
      round5: parseInt(
        row.match(CompetietieRegex.RoundPointsRegex)![4].replace(".", ""),
      ),
      total: parseInt(
        row.match(CompetietieRegex.TotalPointsRegex)![0].replace(".", ""),
      ),
    })) ?? ([] as CompetitieStand[])
  );
}
