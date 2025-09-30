import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { useTeamMap } from '../../hooks/useTeamMap.tsx';
import { formatDatetime } from '../../util/time.ts';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters.tsx';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';

export const TeamHourlyProfitList = () => {
  const { tableProps, filters, setFilters } = useTable({ resource: 'hourly_profit_team' });
  const { map: portfolioMap } = usePortfolios();
  const { map: teamMap } = useTeamMap();
  const teamFilters = usePortfolioFilters();

  return (
    <List title={'团队(投组)每小时收益'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="portfolioId"
          title={'团队投组'}
          render={(portfolioId) => {
            const portfolio = portfolioMap.get(portfolioId);
            const teamId = portfolio?.teamId;
            const team = teamMap.get(teamId || -1);

            return `${team?.name} - ${portfolio?.fundAlias}`;
          }}
          filters={teamFilters}
        />
        <Table.Column
          dataIndex="hourEndAt"
          title={'记账时间(Hour End At)'}
          render={(t) => {
            return formatDatetime(t);
          }}
          filterDropdown={() => {
            return <SnapshotAtFilter fieldName={'hourEndAt'} filters={filters} setFilters={setFilters} />;
          }}
        />

        <Table.Column dataIndex={'profitDelta'} title={'净增减(Net Change)'} />
        <Table.Column dataIndex={'deltaFromFund'} title={'量化增减'} />
        <Table.Column dataIndex={'deltaFromReallocation'} title={'调账增减'} />
        <Table.Column dataIndex={'deltaFromWithdraw'} title={'取现'} />
      </Table>
    </List>
  );
};
