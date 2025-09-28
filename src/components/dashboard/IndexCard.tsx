import { ReactNode } from "react";
import { Card } from "antd";

export type IndexCardProps = {
  title: ReactNode;
  value?: ReactNode;
  isLoading?: boolean;
  actions: ReactNode[];
};

export const IndexCard = ({
  title,
  value,
  isLoading,
  actions,
}: IndexCardProps) => {
  return (
    <Card loading={isLoading} actions={actions}>
      <Card.Meta title={title} description={value}></Card.Meta>
    </Card>
  );
};
