import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import React from 'react';
import { formatDatetime } from '../../util/time.ts';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { decimalFormat } from '../../util/number.ts';

export const PlatformProfitList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'acc_profit_platform',
  });

  return (
    <List title={'平台累计收益快照'}>
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
