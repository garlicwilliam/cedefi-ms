import { List } from '@refinedev/antd';
import { Table } from 'antd';
import { useAccounts } from '../../hooks/combine/useAccounts.tsx';
import { formatDatetime } from '../../util/time.ts';

export const ProfitBalanceList = () => {
  const { accounts, refresh } = useAccounts();

  return (
    <List>
      <Table dataSource={accounts} rowKey={'key'}>
        <Table.Column dataIndex="accountName" title={'账户'} />
        <Table.Column
          dataIndex="snapshotAt"
          title={'最后快照时间'}
          render={(time) => {
            return time ? formatDatetime(time) : '';
          }}
        />
        <Table.Column dataIndex={'accProfit'} title={'余额'} />
      </Table>
    </List>
  );
};
