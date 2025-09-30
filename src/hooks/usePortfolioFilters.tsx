import { usePortfolios } from './usePortfolios.tsx';
import { useTeamMap } from './useTeamMap.tsx';
import { useMemo } from 'react';
import { ColumnFilterItem } from 'antd/es/table/interface';

export const usePortfolioFilters = () => {
  const { arr: portfolios } = usePortfolios();
  const { map: teamMap } = useTeamMap();

  const filters: ColumnFilterItem[] = useMemo(() => {
    return portfolios.map((one) => {
      const team = teamMap.get(one.teamId!);
      return {
        text: `${team?.name} - ${one.fundAlias}`,
        value: one.id,
      };
    });
  }, [portfolios, teamMap]);

  return filters;
};
