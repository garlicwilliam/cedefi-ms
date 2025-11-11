import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { formatDatetime } from '../../util/time.ts';
import React from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';

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
          render={(snapshotAt: number) => formatDatetime(snapshotAt)}
        />
        <Table.Column
          dataIndex="netAssetValue"
          title={'All Assets (USD)'}
          align={'right'}
          render={(val: string) => <span style={{ fontFamily: 'monospace' }}>{SldDecimal.fromNumeric(val, 18).format()}</span>}
        />
        <Table.Column
          dataIndex={'valueCefi'}
          title={'CeFi Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{SldDecimal.fromNumeric(val, 18).format()}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueCeffu'}
          title={'Ceffu Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{SldDecimal.fromNumeric(val, 18).format()}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueSafeWallet'}
          title={'SafeWallet Balance (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{SldDecimal.fromNumeric(val, 18).format()}</NumberValue>}
        />
        <Table.Column
          dataIndex={'valueContract'}
          title={'Withdraw Contract (USD)'}
          align={'right'}
          render={(val) => <NumberValue>{SldDecimal.fromNumeric(val, 18).format()}</NumberValue>}
        />
      </Table>
    </List>
  );
};
