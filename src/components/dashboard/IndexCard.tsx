import { ReactNode } from 'react';
import { Card } from 'antd';
import { useSmall } from '../../hooks/useSmall.tsx';

export type IndexCardProps = {
  title: ReactNode;
  value?: ReactNode;
  isLoading?: boolean;
  actions: ReactNode[];
  children?: ReactNode;
};

export const IndexCard = ({ title, value, isLoading, actions, children }: IndexCardProps) => {
  const isSmall: boolean = useSmall();

  return (
    <Card size={isSmall ? 'small' : 'default'} loading={isLoading} actions={actions}>
      <Card.Meta title={title} description={value}></Card.Meta>
      {children}
    </Card>
  );
};
