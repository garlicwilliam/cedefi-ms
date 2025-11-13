import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { formatDatetime } from '../../util/time.ts';
import React from 'react';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { decimalFormat } from '../../util/number.ts';
import { filtered } from '../../util/filter.ts';

export const AssetsList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'net_asset_snapshots',
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={'ID'} />
        <Table.Column
          dataIndex="snapshotAt"
          align={'right'}
          title={'Snapshot Time'}
          filterDropdown={() => {
            return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
          }}
          filtered={filtered(filters, 'snapshotAt')}
          render={(snapshotAt: number) => formatDatetime(snapshotAt)}
        />
        <Table.Column
          dataIndex="netAssetValue"
          title={'All Assets (USD)'}
          align={'right'}
          render={(val: string) => <span style={{ fontFamily: 'monospace' }}>{decimalFormat(val)}</span>}
        />
        <Table.Column
          dataIndex={'valueCefi'}
          title={'CeFi Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueCeffu'}
          title={'Ceffu Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueSafeWallet'}
          title={'SafeWallet Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueContract'}
          title={'Withdraw Contract (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{decimalFormat(val)}</NumberValue>}
        />
      </Table>
    </List>
  );
};
