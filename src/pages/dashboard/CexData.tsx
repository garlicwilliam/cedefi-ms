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
      key: '5',
      label: '*平台累积收益(USD)',
      children: Number(platform?.accProfit).toFixed(6),
    },
    {
      key: '6',
      label: '*用户累计收益(USD)',
      children: Number(user?.accProfit).toFixed(6),
    },
    {
      key: '7',
      label: '*团队累计收益(USD)',
      children: teamTotal.toFixed(6),
    },
    {
      key: '5',
      label: '*平台24小时变动(USD)',
      children: platformDelta?.toFixed(6),
    },
    {
      key: '6',
      label: '*用户24小时变动(USD)',
      children: userDelta?.toFixed(6),
    },
    {
      key: '7',
      label: '*团队24小时变动(USD)',
      children: teamDelta?.toFixed(6),
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions
        className={styleMr(styles.description)}
        title={<div>收益账户 ( 截至: {snapshotTime ? formatDatetime(snapshotTime) : ''} )</div>}
        items={data}
      />
    </div>
  );
};
