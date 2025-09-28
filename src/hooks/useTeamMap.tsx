import { useList } from "@refinedev/core";
import { Team } from "../service/types.ts";

export const useTeamMap = () => {
  const { result } = useList({ resource: "teams", pagination: {pageSize: 100, currentPage: 1} });
  const teams = result.data;

  const map: Map<number, Team> = teams.reduce(
    (acc: Map<number, Team>, team) => {
      const newTeam: Team = { name: team.name, id: team.id as number };
      acc.set(newTeam.id, newTeam);

      return acc;
    },
    new Map<number, Team>(),
  );

  return { map, arr: teams };
};
