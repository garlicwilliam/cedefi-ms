import styles from './index.module.scss';
import { Card, Descriptions, Typography } from 'antd';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { formatDatetime } from '../../util/time.ts';
import { useProfitAccountsReserve24h } from '../../hooks/combine/useProfitAccountsReserve24h.tsx';
const { Title } = Typography;

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
      label: '用户24时收益变动(USD)',
      children: userDelta.format({ sign: true }),
    },
  ];
  const data2 = [
    {
      label: '平台留存收益余额(USD)',
      children: platformProfit.format(),
    },
    {
      label: '平台24时余额变动(USD)',
      children: platformDelta.format({ sign: true }),
    },
  ];

  const data3 = [
    {
      label: '团队留存收益余额(USD)',
      children: teamReserve.format(),
    },

    {
      label: '团队24时余额变动(USD)',
      children: teamDelta.format({ sign: true }),
    },
  ];

  return (
    <div className={styleMr(styles.accounts)}>
      <Title level={5}>虚拟账户 ( 截至: {snapshotAt ? formatDatetime(snapshotAt) : ''} )</Title>

      <div className={styleMr(styles.accountsData)}>
        <Card size={'small'} title={'用户账户'}>
          <Descriptions column={1} className={styleMr(styles.description)} items={data} />
        </Card>

        <Card size={'small'} title={'平台账户'}>
          <Descriptions column={1} className={styleMr(styles.description)} items={data2} />
        </Card>

        <Card size={'small'} title={'团队账户'}>
          <Descriptions column={1} className={styleMr(styles.description)} items={data3} />
        </Card>
      </div>
    </div>
  );
};
