import { useTable, List } from '@refinedev/antd';
import { Table } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { ADDR_LP } from '../../const/contract.ts';

export const RateHistory = () => {
  const { tableProps } = useTable({
    resource: 'prices',
    filters: { permanent: [{ field: 'token', operator: 'eq', value: ADDR_LP.toLowerCase() }] },
    sorters: { permanent: [{ field: 'idx', order: 'desc' }] },
    pagination: { pageSize: 10 },
  });

  return (
    <List title={'Exchange Rate 提交历史'}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="idx" title={'Index'} />

        <Table.Column dataIndex="timestamp" title={'上链时间'} render={(timestamp) => formatDatetime(timestamp)} />
        <Table.Column
          dataIndex="price"
          title={'Rate'}
          render={(priceStr) => {
            return SldDecimal.fromOrigin(BigInt(priceStr), 18).format({ fix: 18, removeZero: true });
          }}
        />
      </Table>
    </List>
  );
};
