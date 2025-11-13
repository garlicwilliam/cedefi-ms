import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { formatDateHour, formatDatetime } from '../../util/time.ts';
import React from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { filtered } from '../../util/filter.ts';

export const RateList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'rate_snapshots',
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="exchangeRate"
          title={'Rate'}
          align={'right'}
          render={(r) => {
            return (
              <span style={{ fontFamily: 'monospace' }}>
                {SldDecimal.fromNumeric(r.toString(), 18).format({ fix: 10 })}
              </span>
            );
          }}
        />
        <Table.Column
          dataIndex="snapshotAt"
          align={'right'}
          title={'Snapshot Time'}
          filterDropdown={() => {
            return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'snapshotAt')}
          render={(snapshotAt: number) => formatDateHour(snapshotAt)}
        />
        <Table.Column
          dataIndex="createdAt"
          align={'right'}
          title={'Created At'}
          render={(time: number) => formatDatetime(time)}
        />
      </Table>
    </List>
  );
};
