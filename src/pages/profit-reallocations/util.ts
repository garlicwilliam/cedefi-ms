import { Portfolio, Team } from "../../service/types.ts";

export const FromTypes = [
  { value: "platform", label: "平台" },
  { value: "user", label: "用户" },
  { value: "team_portfolio", label: "团队投组" },
];

export const FilterTypes = [
  { value: "platform", text: "平台" },
  { value: "user", text: "用户" },
  { value: "team_portfolio", text: "团队投组" },
];

export function getFromType(
  type: any,
  portfolioId: number | null,
  teamMap: Map<number, Team>,
  portfolioMap: Map<number, Portfolio>,
): string | undefined {
  const fType = FromTypes.find((one) => one.value == type)?.label;

  if (type == "team_portfolio" && portfolioId) {
    const portfolio = portfolioMap.get(portfolioId);
    const teamId = portfolio?.teamId;
    const team = teamId ? teamMap.get(teamId) : undefined;

    return `${fType} (${team?.name} - ${portfolio?.fundAlias})`;
  }

  return fType;
}
