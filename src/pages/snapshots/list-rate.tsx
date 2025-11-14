import { List, useTable } from '@refinedev/antd';
import { Table } from 'antd';
import { SnapshotAtFilter } from '../../components/dropdown/SnapshotAtFilter.tsx';
import { formatDateHour, formatDatetime } from '../../util/time.ts';
import React, { useEffect, useRef } from 'react';
import { SldDecimal } from '../../util/decimal.ts';
import { filtered } from '../../util/filter.ts';
import { RateSnapshot } from '../../service/types.ts';
import { NumberValue } from '../../components/value/NumberValue.tsx';

export const RateList = () => {
  const { tableProps, setFilters, filters } = useTable({
    resource: 'rate_snapshots',
  });
  const mathJaxRef = useRef((window as any).MathJax);

  useEffect(() => {
    if (mathJaxRef.current) {
      mathJaxRef.current.typesetPromise();
    }
  }, []);

  return (
    <>
      <List>
        <div id={'formula'}>
          $$
          {
            '\\text{R} = \\frac{\\text{user\\_deposit} - \\text{user\\_withdraw} + \\text{user\\_acc\\_profit} - \\text{lp\\_locked\\_value}}{\\text{lp\\_amount} - \\text{lp\\_locked}}'
          }
          $$
        </div>

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
            dataIndex="id"
            align={'right'}
            title={'( Deposit - Withdraw + Profit - LockedValue ) / ActiveLp ｜ 截取两位小数'}
            render={(__, row: RateSnapshot) => {
              return (
                <NumberValue>
                  {`(${Number(row.userDeposit).toFixed(2)} - ${Number(row.userWithdraw).toFixed(2)} + ${Number(row.userProfit).toFixed(2)} - ${Number(row.lpLockedValue).toFixed(2)}) / ${Number(row.lpActive).toFixed(2)}`}
                </NumberValue>
              );
            }}
          />
          <Table.Column
            dataIndex="snapshotAt"
            align={'right'}
            title={'快照时间'}
            filterDropdown={() => {
              return <SnapshotAtFilter filters={filters} setFilters={setFilters} />;
            }}
            filtered={filtered(filters, 'snapshotAt')}
            render={(snapshotAt: number) => formatDateHour(snapshotAt)}
          />
          <Table.Column
            dataIndex="createdAt"
            align={'right'}
            title={'计算时间'}
            render={(time: number) => formatDatetime(time)}
          />
        </Table>
      </List>
    </>
  );
};
