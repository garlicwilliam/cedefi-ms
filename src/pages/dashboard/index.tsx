import { TopCards } from "./TopCards.tsx";
import { ChainData } from "./ChainData.tsx";
import { CeffuData } from "./CeffuData.tsx";
import { CexData } from "./CexData.tsx";
import { RedeemData } from "./RedeemData.tsx";

export const Dashboard = () => {
  return (
    <>
      <TopCards />

      <ChainData />

      {/*<CeffuData />*/}

      <CexData />

      <RedeemData />
    </>
  );
};
