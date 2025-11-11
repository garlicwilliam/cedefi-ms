import { Card, Descriptions } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './index.module.scss';
import { useStatistics } from '../../hooks/graph/useStatistics.tsx';
import { Typography } from 'antd';
import { SldDecimal } from '../../util/decimal.ts';
import { DepositAssetAccount, WithdrawAssetAccount } from '../../service/subgraph.service.ts';
import { E18 } from '../../util/big-number.ts';

const { Title } = Typography;

export const ChainData = () => {
  const styleMr = useStyleMr(styles);
  const { statistic } = useStatistics();
  const { accDeposit, accWithdrawal, lpActive, lpPrice, lpLocked, lpLockedUsdValue, accounts, deposits } = statistic || {};

  const accForfeitedUsd: SldDecimal =
    accounts
      ?.map((account): SldDecimal => account.accForfeitedUsdVal as SldDecimal)
      .reduce((a, b): SldDecimal => a.add(b), SldDecimal.ZERO) || SldDecimal.ZERO;
  const accProcessedUsd = accWithdrawal?.sub(accForfeitedUsd);
  const processed = accounts?.map((account) => {
    return {
      label: account.asset.symbol,
      children: account.accProcessedAmount.format({ fix: 2 }) + ' (≈' + account.accProcessedUsdVal.format({ fix: 2 }) + ' USD)',
    };
  });

  const forfeited = accounts?.map((account) => {
    return {
      label: account.asset.symbol,
      children: account.accForfeitedAmount.format({ fix: 2 }) + ' (≈' + account.accForfeitedUsdVal.format({ fix: 2 }) + ' USD)',
    };
  });

  const balances = accounts?.map((account) => {
    return {
      label: account.asset.symbol,
      children: `待取：${account.requiredAmount.format({ fix: 2 })}  / 可用：${account.realAmount.format({ fix: 2 })} `,
    };
  });

  const allRequired: SldDecimal =
    accounts
      ?.map((account: WithdrawAssetAccount): SldDecimal => account.requiredUsdVal)
      .reduce((a: SldDecimal, b: SldDecimal): SldDecimal => a.add(b), SldDecimal.ZERO) || SldDecimal.ZERO;

  const depositTokens = deposits?.map((account: DepositAssetAccount) => {
    return {
      label: account.asset.symbol,
      children: `${account.accDepositedAmount.format({ fix: 2 })} (≈${account.accDepositedUsdVal.format({ fix: 2 })} USD)`,
    };
  });

  const out = [
    {
      key: '2',
      label: '累计结算(USD)',
      children: accProcessedUsd?.format({ fix: 2 }) || '0.00',
    },
    ...(processed || []),
  ];
  const forfeitedOut = [
    {
      label: '累计罚没(USD)',
      children: accForfeitedUsd?.format({ fix: 2 }) || '0.00',
    },
    ...(forfeited || []),
  ];

  const claim = [
    {
      label: '待用户提取(USD)',
      children: allRequired.format({ fix: 2 }) || '0.00',
    },
    ...(balances || []),
  ];

  // 累计存入
  const deposit = [
    {
      label: '累计存入(USD)',
      children: accDeposit?.format({ fix: 2 }) || '0.00',
    },
    ...(depositTokens || []),
  ];

  // 现在流通
  const activeLpValue = lpActive?.mul(lpPrice?.toE18() || E18).div(E18);
  const fund = [
    {
      label: 'LP价值(USD)',
      children: (activeLpValue || SldDecimal.ZERO).add(lpLockedUsdValue || SldDecimal.ZERO).format({ fix: 2 }) || '0.00',
    },
    {
      label: '流通LP数量',
      children: (lpActive?.format({ fix: 2 }) || '0.00') + ` (≈${activeLpValue?.format({ fix: 2 })} USD)`,
    },
    {
      label: '锁定LP数量',
      children: (lpLocked?.format({ fix: 2 }) || '0.00') + ` (≈${lpLockedUsdValue?.format({ fix: 2 })} USD)`,
    },
  ];

  return (
    <>
      <div className={styleMr(styles.chainBox)}>
        <Title level={5}>链上数据</Title>
        <div className={styleMr(styles.chainData)}>
          <Card>
            <Descriptions title="" column={1} items={deposit} className={styleMr(styles.description)} />
          </Card>

          <Card>
            <Descriptions title="" column={1} items={fund} className={styleMr(styles.description)} />
          </Card>

          <Card>
            <div className={styleMr(styles.processCard)}>
              <div>
                <Descriptions title="" column={1} items={out} className={styleMr(styles.description)} />
              </div>
              <div>
                <Descriptions title="" column={1} items={forfeitedOut} className={styleMr(styles.description)} />
              </div>
            </div>
          </Card>
          <Card>
            <Descriptions title="" column={1} items={claim} className={styleMr(styles.description)} />
          </Card>
        </div>
      </div>
    </>
  );
};
