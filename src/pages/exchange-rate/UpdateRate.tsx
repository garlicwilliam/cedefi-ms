import { Spin, Typography } from 'antd';
import { RateForm } from '../../components/rate/RateForm.tsx';
import styles from './UpdateRate.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { StyleMerger } from '../../util/css.ts';
import { useExchangeRateExecute } from '../../hooks/graph/useExchangeRateExecute.tsx';
import { RateConfirm } from '../../components/rate/RateConfirm.tsx';
import { useMultiTimesCall } from '../../util/refresh.ts';
import { LoadingOutlined } from '@ant-design/icons';

export const UpdateRate = () => {
  const styleMr: StyleMerger = useStyleMr(styles);

  const { data: priceExecute, refresh } = useExchangeRateExecute();
  const { refresh: multiRefresh, isPending } = useMultiTimesCall(refresh);
  const hasExecute: boolean = priceExecute.length > 0;

  return (
    <div style={{ paddingBottom: '30px' }}>
      <Typography.Title level={4}>
        ExchangeRate上链 {isPending && <Spin indicator={<LoadingOutlined spin />} size="default" />}
      </Typography.Title>

      {/* Form */}
      {!hasExecute && (
        <div className={styleMr(styles.form)}>
          <RateForm onDone={multiRefresh} />
        </div>
      )}

      {/* Confirm */}
      {hasExecute && (
        <div className={styleMr(styles.execute)}>
          {priceExecute.map((execute) => {
            return <RateConfirm key={execute.id} execute={execute} onDone={multiRefresh} />;
          })}
        </div>
      )}
    </div>
  );
};
