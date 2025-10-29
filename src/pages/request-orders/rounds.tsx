import { List, useTable } from '@refinedev/antd';
import { Button, Divider, Table } from 'antd';
import { formatDatetime } from '../../util/time.ts';
import { Asset, RequestOrder, RequestOrderStatus, Round, RoundAsset } from '../../service/types.ts';
import { formatBigDec, toBigDec } from '../../util/string.ts';
import { useLp } from '../../hooks/graph/useAssets.tsx';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './rounds.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { SldDecimal } from '../../util/decimal.ts';
import { useOrders } from '../../hooks/graph/useOrders.tsx';
import { useCallContractState } from '../../hooks/wallet-write/useCallContract.tsx';
import { useMultiTimesCall } from '../../util/refresh.ts';
import { AbiWithdrawController } from '../../const/abis/WithdrawController.ts';
import { LoadingOutlined } from '@ant-design/icons';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

function computeRequestOrderStatistics(orders: RequestOrder[]) {
  const groups = orders.reduce(
    (acc, cur) => {
      const gKey = cur.round;
      if (!acc[gKey]) {
        acc[gKey] = [];
      }

      acc[gKey].push(cur);

      return acc;
    },
    {} as { [p: string]: RequestOrder[] },
  );

  const sumLp = Object.keys(groups).reduce(
    (acc, key) => {
      const orders: RequestOrder[] = groups[key];

      acc[key] = orders.reduce((sum: SldDecimal, one: RequestOrder) => {
        const lpAmount: SldDecimal = toBigDec(one.requestShares);
        return sum.add(lpAmount);
      }, SldDecimal.ZERO);

      return acc;
    },
    {} as { [p: string]: SldDecimal },
  );

  return { groups, sumLp };
}

export const Rounds = () => {
  const { tableProps, tableQuery } = useTable({ resource: 'withdrawRounds', dataProviderName: 'graph' });
  const lpAsset: Asset | undefined = useLp();
  const styleMr: StyleMerger = useStyleMr(styles);
  const requestingOrders: RequestOrder[] = useOrders([RequestOrderStatus.Requested]);
  const { sumLp, groups: roundRequestedOrders } = computeRequestOrderStatistics(requestingOrders);
  const { refresh } = useMultiTimesCall(tableQuery.refetch);
  const { mutate, isDisabled } = useCallContractState(refresh);

  const onRollNext = () => {
    mutate({
      abi: AbiWithdrawController,
      function: 'markAsProcessingComplete',
      address: DEPLOYED_CONTRACTS.ADDR_WITHDRAW,
      args: [],
    });
  };

  return (
    <List
      headerButtons={() => {
        return (
          <Button disabled={isDisabled} type={'primary'} onClick={onRollNext}>
            进入下一轮 {isDisabled && <LoadingOutlined />}
          </Button>
        );
      }}
    >
      <Table {...tableProps}>
        <Table.Column dataIndex={'id'} title={'ID'}></Table.Column>
        <Table.Column
          dataIndex={'startedAt'}
          title={'起止时间'}
          render={(start: string, row: Round) => {
            const started = formatDatetime(Number(start));
            const closed = Number(row.closedAt) == 0 ? '--' : formatDatetime(Number(row.closedAt));

            return (
              <span>
                <span>{started}</span> <br />
                <span>{closed}</span>
              </span>
            );
          }}
        />

        <Table.Column
          dataIndex={'id'}
          title={'待处理'}
          align={'right'}
          onCell={() => {
            return { style: { verticalAlign: 'top' } };
          }}
          render={(_, row: Round) => {
            const count: number = (roundRequestedOrders[row.id] || []).length;
            const lpAmount: SldDecimal = sumLp[row.id] || SldDecimal.ZERO;

            return (
              <div className={styleMr(styles.numValues)}>
                <span>
                  <span className={styleMr(styles.sym)}>未处理订单：</span>
                  {count}
                </span>
                <Divider dashed={true} size={'small'} orientation="right"></Divider>
                <span>
                  <span className={styleMr(styles.sym)}>未处理LP数量：</span>
                  {lpAmount.format({ fix: 6, removeZero: true })}
                </span>
                <Divider dashed={true} size={'small'} orientation="right"></Divider>
              </div>
            );
          }}
        />

        <Table.Column
          dataIndex={'sumProcessingLpAmount'}
          title={'封账数量'}
          align={'right'}
          onCell={() => {
            return { style: { verticalAlign: 'top' } };
          }}
          render={(_, row: Round) => {
            const lpAmount = formatBigDec(row.sumProcessingLpAmount, 6);
            const usdValue = formatBigDec(row.sumProcessingUsdValue, 6);
            const orders = row.sumProcessingOrderCount;
            const roundAssets: RoundAsset[] = row.sumAssets;
            return (
              <div className={styleMr(styles.numValues)}>
                <span>
                  <span className={styleMr(styles.sym)}>封账订单</span>: {orders}
                </span>

                <Divider dashed={true} size={'small'} orientation="right"></Divider>

                <span>
                  {lpAmount} <span className={styleMr(styles.sym)}>{lpAsset?.symbol}</span> ≈ {usdValue}{' '}
                  <span className={styleMr(styles.sym)}>USD</span>
                </span>

                <Divider dashed={true} size={'small'} orientation="right"></Divider>

                <>
                  {roundAssets.map((one: RoundAsset) => {
                    return (
                      <span>
                        {formatBigDec(one.processingAmount, one.asset.decimals)}{' '}
                        <span className={styleMr(styles.sym)}>{one.asset.symbol}</span>
                      </span>
                    );
                  })}
                </>
              </div>
            );
          }}
        />

        <Table.Column
          dataIndex={'sumProcessedLpAmount'}
          title={'结算数量'}
          align={'right'}
          onCell={() => {
            return { style: { verticalAlign: 'top' } };
          }}
          render={(_, row: Round) => {
            const lpAmount: string = formatBigDec(row.sumProcessedLpAmount, 6);
            const usdValue: string = formatBigDec(row.sumProcessedUsdValue, 6);
            const orders = row.sumProcessedOrderCount;
            const roundAssets: RoundAsset[] = row.sumAssets;

            return (
              <div className={styleMr(styles.numValues)}>
                <span>
                  <span className={styleMr(styles.sym)}>结算订单:</span>
                  {orders}
                </span>

                <Divider dashed={true} size={'small'} orientation="right" />

                <span>
                  {lpAmount} <span className={styleMr(styles.sym)}>{lpAsset?.symbol}</span> ≈ {usdValue}{' '}
                  <span className={styleMr(styles.sym)}>USD</span>
                </span>

                <Divider dashed={true} size={'small'} orientation="right" />

                <>
                  {roundAssets.map((one) => {
                    return (
                      <span>
                        {formatBigDec(one.processedAmount)} <span className={styleMr(styles.sym)}>{one.asset.symbol}</span>
                      </span>
                    );
                  })}
                </>
              </div>
            );
          }}
        />

        <Table.Column
          dataIndex={'id'}
          title={'实际转账'}
          render={() => {
            return '待开发';
          }}
        />
      </Table>
    </List>
  );
};
