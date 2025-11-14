import { TopCards } from './TopCards.tsx';
import { ChainData } from './ChainData.tsx';
import { CexData } from './CexData.tsx';
import { useStyleMr } from '../../hooks/useStyleMr.tsx';
import styles from './index.module.scss';

export const Dashboard = () => {
  const styleMr = useStyleMr(styles);
  return (
    <div className={styleMr(styles.board)}>
      <TopCards />

      <ChainData />

      <CexData />
    </div>
  );
};
