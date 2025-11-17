import { ReactNode } from 'react';
import styles from './VerticalItem.module.scss';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import { StyleMerger } from '../../util/css.ts';

export type VerticalItemProps = {
  label: ReactNode;
  value: ReactNode;
  labelPlace?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
};
export function VerticalItem({ label, value, labelPlace = 'bottom', align = 'center' }: VerticalItemProps) {
  const styleMr: StyleMerger = useStyleMr(styles);
  const placeCss: string = labelPlace === 'bottom' ? styles.labelBottom : styles.labelTop;
  const alignCss: string =
    align === 'left' ? styles.alignLeft : align === 'right' ? styles.alignRight : styles.alignCenter;

  return (
    <div className={styleMr(styles.item, placeCss, alignCss)}>
      <div className={styleMr(styles.label)}>{label}</div>
      <div className={styleMr(styles.value)}>{value}</div>
    </div>
  );
}
