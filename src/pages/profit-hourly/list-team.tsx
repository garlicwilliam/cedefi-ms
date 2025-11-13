import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { useTeamMap } from '../../hooks/useTeamMap.tsx';
import { formatDatetime } from '../../util/time.ts';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters.tsx';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { decimalFormat } from '../../util/number.ts';
import { filtered } from '../../util/filter.ts';

export const TeamHourlyProfitList = () => {
  const { tableProps, filters, setFilters } = useTable({ resource: 'hourly_profit_team' });
  const { map: portfolioMap } = usePortfolios();
  const { map: teamMap } = useTeamMap();
  const teamFilterOptions = usePortfolioFilters();

  return (
    <List title={'团队(投组)每小时收益'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="portfolioId"
          title={'【团队】投资组合'}
          render={(portfolioId) => {
            const portfolio = portfolioMap.get(portfolioId);
            const teamId = portfolio?.teamId;
            const team = teamMap.get(teamId || -1);

            return `【${team?.name}】 ${portfolio?.fundAlias}`;
          }}
          filters={teamFilterOptions}
          filtered={filtered(filters, 'portfolioId')}
        />

        <Table.Column
          dataIndex="hourEndAt"
          title={'记账时间'}
          render={(t) => {
            return formatDatetime(t);
          }}
          align={'right'}
          filterDropdown={() => {
            return <SnapshotAtFilter fieldName={'hourEndAt'} filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'hourEndAt')}
        />

        <Table.Column
          dataIndex={'profitDelta'}
          title={'净增减(Net Change)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'deltaFromFund'}
          title={'量化增减'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'deltaFromReallocation'}
          title={'调账增减'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'deltaFromWithdraw'}
          title={'取现'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
      </Table>
    </List>
  );
};
