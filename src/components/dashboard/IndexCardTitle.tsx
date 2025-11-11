import styles from './IndexCardTitle.module.scss';
import { bindStyleMerger, StyleMerger } from '../../util/css.ts';
import { useSmall } from '../../hooks/useSmall.tsx';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

export type IndexCardTitleProps = {
  title: string;
  desc: string;
  tips?: ReactNode;
};

export const IndexCardTitle = ({ title, desc, tips }: IndexCardTitleProps) => {
  const isSmall: boolean = useSmall();

  const styleMr: StyleMerger = bindStyleMerger(isSmall ? styles.small : '');

  return (
    <div className={styleMr(styles.titleGroup)}>
      <div className={styleMr(styles.title)}>
        {title}&nbsp;
        {tips && (
          <Tooltip title={tips}>
            <InfoCircleOutlined />
          </Tooltip>
        )}
      </div>
      <div className={styleMr(styles.desc)}>{desc}</div>
    </div>
  );
};
