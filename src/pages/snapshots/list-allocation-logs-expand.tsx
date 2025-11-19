import { PortfolioAccProfit, ProfitAllocationLog, ProfitAllocationRatio } from '../../service/types.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './list-allocation-logs-expand.module.scss';
import { VerticalItem } from '../../components/content/VerticalItem.tsx';
import { NumberValue } from '../../components/value/NumberValue.tsx';
import { formatDatetime } from '../../util/time.ts';

export type AllocationLogExpandProps = {
  log: ProfitAllocationLog;
  pnlMap: Record<number, PortfolioAccProfit>;
  ratioMap: Record<number, ProfitAllocationRatio>;
};

function getStartProfit(first: PortfolioAccProfit): PortfolioAccProfit {
  return {
    id: 0,
    portfolioId: first.portfolioId,
    snapshotAt: first.snapshotAt,
    accProfit: '0',
    createdAt: first.createdAt,
  };
}

export function AllocationLogExpand({ log, pnlMap, ratioMap }: AllocationLogExpandProps) {
  const styleMr = useStyleMr(styles);
  const cur: PortfolioAccProfit = pnlMap[log.hourlySnapshotCurrId];
  const pre: PortfolioAccProfit =
    log.hourlySnapshotPrevId === -1 ? getStartProfit(cur) : pnlMap[log.hourlySnapshotPrevId];
  const ratio: ProfitAllocationRatio = ratioMap[log.allocationRatioId];

  return (
    <div className={styleMr(styles.expand)}>
      <div className={styleMr(styles.diff)}>
        <div className={styleMr(styles.result)}>
          <VerticalItem
            label={<div className={styleMr(styles.label)}>1小时收益</div>}
            value={<NumberValue>{log.hourlyProfit}</NumberValue>}
            align={'center'}
          />
        </div>

        <div className={styleMr(styles.eq)}>=</div>

        <div className={styleMr(styles.after)}>
          <VerticalItem
            label={
              <div className={styleMr(styles.label)}>
                {formatDatetime(Number(cur?.snapshotAt))} (ID:{cur?.id})
              </div>
            }
            value={<NumberValue>{cur.accProfit}</NumberValue>}
            align={'center'}
          />
        </div>

        <div className={styleMr(styles.sub)}>-</div>

        <div className={styleMr(styles.before)}>
          <VerticalItem
            label={
              <div className={styleMr(styles.label)}>
                {formatDatetime(Number(pre?.snapshotAt))} (ID:{pre?.id})
              </div>
            }
            value={<NumberValue>{pre?.accProfit}</NumberValue>}
            align={'center'}
          />
        </div>
      </div>

      <div className={styleMr(styles.ratio)}>
        <div className={styleMr(styles.label)}>分配比例 (ID:{ratio?.id})</div>
        <div>
          <VerticalItem
            label={<div className={styleMr(styles.label)}>用户</div>}
            value={<NumberValue>{`${ratio?.toUserRatio / 100}%`}</NumberValue>}
          />
        </div>
        <div>
          <VerticalItem
            label={<div className={styleMr(styles.label)}>平台</div>}
            value={<NumberValue>{`${ratio?.toPlatformRatio / 100}%`}</NumberValue>}
          />
        </div>
        <div>
          <VerticalItem
            label={<div className={styleMr(styles.label)}>团队</div>}
            value={<NumberValue>{`${ratio?.toTeamRatio / 100}%`}</NumberValue>}
          />
        </div>
      </div>
    </div>
  );
}
