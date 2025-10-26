import { RequestOrderStatus } from '../../service/types.ts';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './OrderStatusCheck.module.scss';
import { StyleMerger } from '../../util/css.ts';
import { Tag } from 'antd';

export type OrderStatusCheckProps = {
  onChecked: (checked: RequestOrderStatus[]) => void;
  checked: RequestOrderStatus[];
};

export const OrderStatusCheck = ({ onChecked, checked: checkedStatus }: OrderStatusCheckProps) => {
  const list: RequestOrderStatus[] = Object.values(RequestOrderStatus);
  const styleMr: StyleMerger = useStyleMr(styles);
  const nowChecked = new Set<RequestOrderStatus>(checkedStatus);

  const handleChange = (status: RequestOrderStatus, checked: boolean) => {
    if (checked) {
      nowChecked.add(status);
    } else {
      nowChecked.delete(status);
    }

    onChecked(Array.from(nowChecked));
  };

  return (
    <div className={styleMr(styles.statusList)}>
      {list.map((status: RequestOrderStatus) => {
        return (
          <Tag.CheckableTag
            key={status}
            checked={nowChecked.has(status)}
            onChange={(checked: boolean): void => handleChange(status, checked)}
          >
            {status}
          </Tag.CheckableTag>
        );
      })}
    </div>
  );
};
