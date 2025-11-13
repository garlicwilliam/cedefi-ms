import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';
import { formatDatetime } from '../../util/time.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { decimalFormat } from '../../util/number.ts';

export const PlatformHourlyProfitList = () => {
  const { tableProps, filters, setFilters } = useTable({ resource: 'hourly_profit_platform' });

  return (
    <List title={'平台每小时收益'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex={'hourEndAt'}
          title={'记账时间'}
          render={(t) => {
            return formatDatetime(t);
          }}
          align={'right'}
          filterDropdown={() => {
            return <SnapshotAtFilter fieldName={'hourEndAt'} filters={filters} setFilters={setFilters} />;
          }}
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
