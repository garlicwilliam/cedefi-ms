import { ReactNode } from 'react';
import { Card } from 'antd';

export type IndexCardProps = {
  title: ReactNode;
  value?: ReactNode;
  isLoading?: boolean;
  actions: ReactNode[];
  children?: ReactNode;
};

export const IndexCard = ({ title, value, isLoading, actions, children }: IndexCardProps) => {
  return (
    <Card loading={isLoading} actions={actions}>
      <Card.Meta title={title} description={value}></Card.Meta>
      {children}
    </Card>
  );
};
