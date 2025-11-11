import styles from './index.module.scss';
import { Descriptions } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { useProfitAccounts } from '../../hooks/combine/useProfitAccounts.tsx';
import { formatDatetime } from '../../util/time.ts';

export const CexData = () => {
  const styleMr = useStyleMr(styles);

  const { user, team, platform, snapshotTime, platformDelta, userDelta, teamDelta } = useProfitAccounts();
  const teamTotal = team.reduce((acc, cur) => {
    return Number(cur.accProfit) + acc;
  }, 0);

  const data = [
    {
      label: '用户历史累计收益(USD)',
      children: Number(user?.accProfit).toFixed(2),
    },
    {
      label: '平台留存收益余额(USD)',
      children: Number(platform?.accProfit).toFixed(2),
    },

    {
      label: '团队留存收益余额(USD)',
      children: teamTotal.toFixed(2),
    },
    {
      label: '用户24时收益变动(USD)',
      children: `${userDelta || 0 > 0 ? '+' : '-'}` + userDelta?.toFixed(2),
    },
    {
      label: '平台24时余额变动(USD)',
      children: `${platformDelta || 0 > 0 ? '+' : '-'}` + platformDelta?.toFixed(2),
    },

    {
      label: '团队24时余额变动(USD)',
      children: `${teamDelta || 0 > 0 ? '+' : '-'}` + teamDelta?.toFixed(2),
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions
        className={styleMr(styles.description)}
        title={<div>收益虚拟账户 ( 截至: {snapshotTime ? formatDatetime(snapshotTime) : ''} )</div>}
        items={data}
      />
    </div>
  );
};
