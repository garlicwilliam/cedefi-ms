import { useList } from "@refinedev/core";
import { Team } from "../service/types.ts";
import { useMemo } from "react";

export const useTeamMap = () => {
  const { result } = useList({
    resource: "teams",
    pagination: { pageSize: 100, currentPage: 1 },
  });
  const teams = result.data;
  const map = useMemo(() => {
    const map: Map<number, Team> = teams.reduce(
      (acc: Map<number, Team>, team) => {
        const newTeam: Team = { name: team.name, id: team.id as number };
        acc.set(newTeam.id, newTeam);

        return acc;
      },
      new Map<number, Team>(),
    );

    return map;
  }, [teams]);

  return { map, arr: teams };
};
