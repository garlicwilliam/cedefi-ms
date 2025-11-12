import styles from './index.module.scss';
import { Descriptions } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { formatDatetime } from '../../util/time.ts';
import { useProfitAccountsReserve24h } from '../../hooks/combine/useProfitAccountsReserve24h.tsx';

export const CexData = () => {
  const styleMr = useStyleMr(styles);

  const { userProfit, userDelta, platformProfit, platformDelta, teamReserve, teamDelta, snapshotAt } =
    useProfitAccountsReserve24h();

  const data = [
    {
      label: '用户历史累计收益(USD)',
      children: userProfit.format(),
    },
    {
      label: '平台留存收益余额(USD)',
      children: platformProfit.format(),
    },

    {
      label: '团队留存收益余额(USD)',
      children: teamReserve.format(),
    },
    {
      label: '用户24时收益变动(USD)',
      children: userDelta.format({ sign: true }),
    },
    {
      label: '平台24时余额变动(USD)',
      children: platformDelta.format({ sign: true }),
    },
    {
      label: '团队24时余额变动(USD)',
      children: teamDelta.format({ sign: true }),
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions
        className={styleMr(styles.description)}
        title={<div>收益虚拟账户 ( 截至: {snapshotAt ? formatDatetime(snapshotAt) : ''} )</div>}
        items={data}
      />
    </div>
  );
};
