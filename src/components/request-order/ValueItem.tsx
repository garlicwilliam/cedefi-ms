import { ReactNode } from 'react';

export type ValueItemProps = {
  label: ReactNode;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};
export const ValueItem = ({ label, value, className, labelClassName, valueClassName }: ValueItemProps) => {
  return (
    <div className={className}>
      <span className={labelClassName}>{label}</span>: <span className={valueClassName}>{value}</span>
    </div>
  );
};
