import { ReactNode } from 'react';
import { formatDateHour, timeAgo } from '../../util/time.ts';
import styles from './IndexCardValue.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { Tag } from 'antd';

type IndexCardValueProps = {
  value: ReactNode;
  time?: number | null;
};

function timeAgoString(time: number): string {
  const { day, hour, minute } = timeAgo(time);
  if (day > 0) {
    return `${day}天前`;
  } else if (hour > 0) {
    return `${hour}小时前`;
  } else if (minute > 0) {
    return `${minute}分钟前`;
  } else {
    return ``;
  }
}

export function IndexCardValue({ value, time }: IndexCardValueProps) {
  const styleMr = useStyleMr(styles);

  const timeLabel = timeAgoString(time || 0);

  return (
    <div className={styleMr(styles.valBox)}>
      <div className={styleMr(styles.valStr)}>{value}</div>
      {time && (
        <div className={styleMr(styles.timeStr)}>
          {formatDateHour(time)} <Tag>{timeLabel}</Tag>
        </div>
      )}
    </div>
  );
}
