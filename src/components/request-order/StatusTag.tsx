import { RequestOrderStatus } from '../../service/types.ts';
import { Tag } from 'antd';

export type OrderStatusTagProps = {
  status: RequestOrderStatus;
};

const tagToColor: Record<RequestOrderStatus, string> = {
  [RequestOrderStatus.Requested]: 'blue',
  [RequestOrderStatus.Cancelled]: 'gray',
  [RequestOrderStatus.Rejected]: 'gray',
  [RequestOrderStatus.Processing]: 'red',
  [RequestOrderStatus.Processed]: 'green',
  [RequestOrderStatus.Completed]: 'green',
  [RequestOrderStatus.Reviewing]: 'volcano',
  [RequestOrderStatus.Forfeited]: 'orange',
};

export const OrderStatusTag = ({ status }: OrderStatusTagProps) => {
  const color: string = tagToColor[status];
  return <Tag color={color}>{status}</Tag>;
};
