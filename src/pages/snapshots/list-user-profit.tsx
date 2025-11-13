import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import React from 'react';
import { decimalFormat } from '../../util/number.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { filtered } from '../../util/filter.ts';

export const UserProfitList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'acc_profit_user',
  });

  return (
    <List title={'用户累计收益快照'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="snapshotAt"
          title={'快照时间'}
          render={(time) => {
            return formatDatetime(time);
          }}
          align={'right'}
          filterDropdown={() => {
            return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'snapshotAt')}
        />
        <Table.Column
          dataIndex="accProfit"
          title={'累计(USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          align={'right'}
          dataIndex="createdAt"
          title={'创建时间'}
          render={(time) => {
            return formatDatetime(time);
          }}
        />
      </Table>
    </List>
  );
};
