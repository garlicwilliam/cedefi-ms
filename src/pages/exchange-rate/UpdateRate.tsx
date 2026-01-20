import { Spin, Typography } from 'antd';
import { RateForm } from '../../components/rate/RateForm.tsx';
import styles from './UpdateRate.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { StyleMerger } from '../../util/css.ts';
import { useExchangeRateExecute } from '../../hooks/graph/useExchangeRateExecute.tsx';
import { RateConfirm } from '../../components/rate/RateConfirm.tsx';
import { useMultiTimesCall } from '../../util/refresh.ts';
import { LoadingOutlined } from '@ant-design/icons';
import { RatePreview } from '../../components/rate/RatePreview.tsx';
import { useState } from 'react';

export const UpdateRate = () => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const [inputRate, setInputRate] = useState<number>();
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
          <RatePreview inputRate={inputRate} />
          <div>
            <ul>
              <li>APY计算以天 (UTC) 为时间单位</li>
              <li>一天 (UTC) 内多次更新Rate会取最后一次的数值覆盖前值</li>
            </ul>
          </div>
          <RateForm onDone={multiRefresh} onChange={setInputRate} />
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
