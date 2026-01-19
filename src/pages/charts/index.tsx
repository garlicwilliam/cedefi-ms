import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './index.module.scss';
import { ApyOnChain } from './ApyOnChain.tsx';
import { ApyOfRate } from './ApyOfRate.tsx';

export const Charts = () => {
  const styleMr = useStyleMr(styles);

  return (
    <div className={styleMr(styles.chartsPage)}>
      <ApyOnChain />
      <ApyOfRate />
    </div>
  );
};
