import { StyleMerger } from "../../util/css.ts";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";
import styles from "./index.module.scss";
import { useList } from "@refinedev/core";
import { formatDateHour } from "../../util/time.ts";
import { ReactNode } from "react";
import { apyCompute } from "../../util/number.ts";
import { IndexCard } from "../../components/dashboard/IndexCard.tsx";
import { IndexCardTitle } from "../../components/dashboard/IndexCardTitle.tsx";
import { IndexCardAction } from "../../components/dashboard/IndexCardAction.tsx";

export const TopCards = () => {
  const styleMr: StyleMerger = useStyleMr(styles);

  const { result: nav } = useList({
    resource: "nav_snapshots",
    pagination: {
      pageSize: 1,
    },
  });
  const { result: rate } = useList({
    resource: "rate_snapshots",
    pagination: { pageSize: 1 },
  });
  const { result: assets } = useList({
    resource: "assets_snapshots",
    pagination: { pageSize: 1 },
  });
  const { result: rateList } = useList({
    resource: "rate_snapshots",
    pagination: { pageSize: 24 * 7 },
  });

  const navVal = nav.data[0];
  const navText: string = navVal
    ? `${navVal?.nav} (${formatDateHour(navVal?.snapshotAt)})`
    : "N/A";

  const rateVal = rate.data[0];
  const rateText: string = rateVal
    ? `1 LP = ${rateVal?.exchangeRate} USD  (${formatDateHour(rateVal?.snapshotAt)})`
    : "N/A";

  const assetsVal = assets.data[0];
  const assetsText: string = assetsVal
    ? `${assetsVal.assetsValue} USD  (${formatDateHour(assetsVal?.snapshotAt)})`
    : "N/A";

  const allRate = rateList.data.sort((a, b) => b.snapshotAt - a.snapshotAt);

  let apy: ReactNode = <></>;
  if (allRate.length <= 1) {
    apy = <div>数据不足，无法计算APY</div>;
  } else {
    const to = allRate[0]; // now
    const from = allRate[allRate.length - 1]; // 7 days ago
    const start = {
      value: from.exchangeRate,
      timestamp: from.snapshotAt,
    } as const;
    const end = {
      value: to.exchangeRate,
      timestamp: to.snapshotAt,
    } as const;
    apy = (
      <>
        {apyCompute(start, end).toFixed(2)}% ~ ({formatDateHour(end.timestamp)})
      </>
    );
  }

  return (
    <div className={styleMr(styles.cards)}>
      <IndexCard
        title={<IndexCardTitle title={"今日NAV"} desc={"1token"} />}
        value={`${navText}`}
        actions={[<IndexCardAction route={"/nav_snapshots"} text={"更多"} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={"今日Rate"} desc={"user"} />}
        value={`${rateText}`}
        actions={[<IndexCardAction route={"/rate_snapshots"} text={"更多"} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={"7日APY"} desc={"user"} />}
        value={apy}
        actions={[<IndexCardAction route={"/rate_snapshots"} text={"更多"} />]}
      />

      <IndexCard
        title={<IndexCardTitle title={"今日总资产"} desc={""} />}
        value={`${assetsText}`}
        actions={[
          <IndexCardAction route={"/assets_snapshots"} text={"更多"} />,
        ]}
      />
    </div>
  );
};
