import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { useTeamMap } from '../../hooks/useTeamMap.tsx';
import { Portfolio } from '../../service/types.ts';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters.tsx';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { decimalFormat } from '../../util/number.ts';
import { filtered } from '../../util/filter.ts';

export const TeamProfitList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'acc_profit_team',
  });

  const { map: portfolioMap } = usePortfolios();
  const { map: teamMap } = useTeamMap();
  const teamFilters = usePortfolioFilters();

  return (
    <List title={'团队(投组)累计收益快照'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="portfolioId"
          title={'【团队】投资组合'}
          render={(pid: number) => {
            const portfolio: Portfolio | undefined = portfolioMap.get(pid);
            const name = portfolio?.fundAlias;
            const team = teamMap.get(portfolio?.teamId ?? -1);

            return `【${team?.name ?? '未知团队'}】 ${name}`;
          }}
          filters={teamFilters}
          filtered={filtered(filters, 'portfolioId')}
        />

        <Table.Column
          dataIndex="snapshotAt"
          title={'快照时间'}
          align={'right'}
          render={(time) => {
            return formatDatetime(time);
          }}
          filterDropdown={() => {
            return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'snapshotAt')}
        />

        <Table.Column
          dataIndex="accProfit"
          title={'留存余额(USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex="createdAt"
          title={'创建时间'}
          align={'right'}
          render={(time) => {
            return formatDatetime(time);
          }}
        />
      </Table>
    </List>
  );
};
