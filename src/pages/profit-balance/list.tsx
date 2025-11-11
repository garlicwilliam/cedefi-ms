import { List } from '@refinedev/antd';
import { Table, Tooltip } from 'antd';
import { useAccounts } from '../../hooks/combine/useAccounts.tsx';
import { formatDatetime } from '../../util/time.ts';
import { InfoCircleOutlined, InfoOutlined } from '@ant-design/icons';
import { SldDecimal } from '../../util/decimal.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';

export const ProfitBalanceList = () => {
  const { accounts } = useAccounts();

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
        <Table.Column
          dataIndex={'accProfit'}
          align={'right'}
          title={
            <div>
              累计收益 / 余额 &nbsp;
              <Tooltip title="用户为累计收益，其他账户为余额">
                <InfoCircleOutlined />
              </Tooltip>
            </div>
          }
          render={(value) => {
            const valStr = value ? SldDecimal.fromNumeric(String(value), 18).format({ fix: 4 }) : '';
            return <NumberValue>{valStr}</NumberValue>;
          }}
        />
      </Table>
    </List>
  );
};
