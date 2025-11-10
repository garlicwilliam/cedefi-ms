import { TopCards } from './TopCards.tsx';
import { ChainData } from './ChainData.tsx';
import { CexData } from './CexData.tsx';

export const Dashboard = () => {
  return (
    <>
      <TopCards />

      <ChainData />

      {/*<CeffuData />*/}

      <CexData />

      {/*<RedeemData />*/}
    </>
  );
};
