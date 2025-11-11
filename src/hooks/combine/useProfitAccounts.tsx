import { useList } from '@refinedev/core';
import { PlatformAccProfit, TeamAccProfit, UserAccProfit } from '../../service/types.ts';
import { useEffect, useState } from 'react';

// 虚拟收益账户的数据
export function useProfitAccounts() {
  const deltaTime: number = 86400;
  const [snapshotTime, setSnapshotTime] = useState<number | null>(null);

  const [user, setUser] = useState<UserAccProfit | null>(null);
  const [userDelta, setUserDelta] = useState<number | null>(null);

  const [platform, setPlatform] = useState<PlatformAccProfit | null>(null);
  const [platformDelta, setPlatformDelta] = useState<number | null>(null);

  const [team, setTeam] = useState<TeamAccProfit[]>([]);
  const [teamDelta, setTeamDelta] = useState<number | null>(null);

  // 获取最新的数据
  const { result, query } = useList({
    resource: 'acc_profit_user',
    sorters: [{ field: 'id', order: 'desc' }],
    pagination: {
      pageSize: 1,
      currentPage: 1,
    },
  });

  // 获取24小时前的数据
  const { result: user24, query: user24Query } = useList({
    resource: 'acc_profit_user',
    sorters: [{ field: 'id', order: 'desc' }],
    filters: [{ field: 'snapshotAt', operator: 'eq', value: (snapshotTime || 0) - deltaTime }],
    queryOptions: {
      enabled: snapshotTime !== null && snapshotTime > 0,
    },
  });

  useEffect(() => {
    if (user && user24.data && user24.data.length > 0) {
      const pre24 = user24.data[0] as UserAccProfit;
      const delta = Number(user.accProfit) - Number(pre24.accProfit);

      setUserDelta(delta);
    }
  }, [user, user24]);

  const { result: platformResult, query: platformQuery } = useList({
    resource: 'acc_profit_platform',
    sorters: [{ field: 'id', order: 'desc' }],
    filters: [{ field: 'snapshotAt', operator: 'eq', value: snapshotTime }],
    queryOptions: {
      enabled: snapshotTime !== null,
    },
  });

  const { result: platform24, query: platform24Query } = useList({
    resource: 'acc_profit_platform',
    sorters: [{ field: 'id', order: 'desc' }],
    filters: [{ field: 'snapshotAt', operator: 'eq', value: (snapshotTime || 0) - deltaTime }],
    queryOptions: {
      enabled: snapshotTime !== null,
    },
  });

  useEffect(() => {
    if (platform && platform24 && platform24.data && platform24.data.length > 0) {
      const pre24 = platform24.data[0] as PlatformAccProfit;
      const delta = Number(platform.accProfit) - Number(pre24.accProfit);
      setPlatformDelta(delta);
    }
  }, [platform, platform24]);

  const { result: teamResult, query: teamQuery } = useList({
    resource: 'acc_profit_team',
    sorters: [{ field: 'id', order: 'desc' }],
    filters: [{ field: 'snapshotAt', operator: 'eq', value: snapshotTime }],
    queryOptions: {
      enabled: snapshotTime !== null,
    },
  });

  const { result: team24, query: team24Query } = useList({
    resource: 'acc_profit_team',
    sorters: [{ field: 'id', order: 'desc' }],
    filters: [{ field: 'snapshotAt', operator: 'eq', value: (snapshotTime || 0) - deltaTime }],
    queryOptions: {
      enabled: snapshotTime !== null,
    },
  });

  useEffect(() => {
    if (team) {
      const now = team.reduce((acc, cur) => {
        return acc + Number((cur as TeamAccProfit).accProfit);
      }, 0);

      const pre24: number = team24.data.reduce((acc, cur) => {
        return acc + Number((cur as TeamAccProfit).accProfit);
      }, 0);

      const delta = now - pre24;

      setTeamDelta(delta);
    }
  }, [team, team24]);

  useEffect(() => {
    const userProfits = result.data as UserAccProfit[];
    if (userProfits.length > 0) {
      setSnapshotTime(userProfits[0].snapshotAt);
      setUser(userProfits[0]);
    }
  }, [result]);

  useEffect(() => {
    const platforms = platformResult.data as PlatformAccProfit[];
    if (platforms.length > 0) {
      setPlatform(platforms[0]);
    }
  }, [platformResult]);

  useEffect(() => {
    const teams = teamResult.data as TeamAccProfit[];
    if (teams.length > 0) {
      setTeam(teams);
    }
  }, [teamResult]);

  return {
    snapshotTime,
    user,
    platform,
    team,
    platformDelta,
    userDelta,
    teamDelta,
  };
}
