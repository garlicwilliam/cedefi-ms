import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { usePortfolios } from '../../hooks/usePortfolios.tsx';
import { usePortfolioFilters } from '../../hooks/usePortfolioFilters.tsx';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { filtered } from '../../util/filter.ts';
import React from 'react';
import { decimalFormat } from '../../util/number.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';

export function PortfolioProfitList() {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'acc_profit_from_portfolio',
  });
  const { map: portfolioMap } = usePortfolios();
  const filterItems = usePortfolioFilters();

  return (
    <List title={'投资组合累计收益快照'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="portfolioId"
          title={'投资组合'}
          render={(id) => {
            const portfolio = portfolioMap.get(id);
            return portfolio ? portfolio.fundAlias : '未知投资组合';
          }}
          filters={filterItems}
          filtered={filtered(filters, 'portfolioId')}
        />
        <Table.Column
          dataIndex="snapshotAt"
          title={'快照时间'}
          render={(val) => {
            return formatDatetime(val);
          }}
          filterDropdown={() => {
            return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'snapshotAt')}
          align={'right'}
        />

        <Table.Column
          dataIndex={'accProfit'}
          title={'累计收益(USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />

        <Table.Column
          dataIndex={'createdAt'}
          title={'抓取时间'}
          align={'right'}
          render={(val) => {
            return formatDatetime(val);
          }}
        />
      </Table>
    </List>
  );
}
