import { Asset, RequestOrder } from '../../service/types.ts';
import { formatDatetime } from '../../util/time.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './OrderItem.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { ValueItem } from './ValueItem.tsx';
import { OrderStatusTag } from './StatusTag.tsx';
import { formatBigDec } from '../../util/string.ts';
import { useAssets } from '../../hooks/graph/useAssets.tsx';
import { Checkbox, CheckboxChangeEvent } from 'antd';
import { DEPLOYED_CONTRACTS } from '../../const/env.ts';

export type OrderItemProps = {
  order: RequestOrder;
  onCheck: (val: { id: string; checked: boolean }) => void;
  curChecked: Set<string>;
};

export const OrderItem = ({ order, onCheck, curChecked }: OrderItemProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);
  const { map: assetMap } = useAssets();
  const lp: Asset | undefined = assetMap.get(DEPLOYED_CONTRACTS.ADDR_LP);

  return (
    <div className={styleMr(styles.order)}>
      <div className={styleMr(styles.no)}>
        <span>#{order.id}</span>
        <span>
          <Checkbox
            checked={curChecked.has(order.id)}
            onChange={(e: CheckboxChangeEvent) => onCheck({ checked: e.target.checked, id: order.id })}
          />
        </span>
      </div>

      <div className={styleMr(styles.metaLine)}>
        <ValueItem label={'申请时间'} value={formatDatetime(Number(order.requestedAt))} />
        <ValueItem label={'当前状态'} value={<OrderStatusTag status={order.status} />} />
      </div>

      <div className={styleMr(styles.requestLine)}>
        <ValueItem label={'申请地址'} value={order.requester} />
        <ValueItem
          label={'申请数量'}
          value={
            <span>
              <span className={styleMr(styles.highlight)}>{formatBigDec(order.requestShares)}</span> {lp?.symbol}
            </span>
          }
        />
        <ValueItem
          label={'申请资产'}
          value={
            <span>
              <span className={styleMr(styles.highlight2)}>{formatBigDec(order.assetAmount, 6)}</span> {order.requestAsset.symbol}
            </span>
          }
        />
      </div>
    </div>
  );
};
