import styles from "./index.module.scss";
import { Descriptions } from "antd";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";
import { StyleMerger } from "../../util/css.ts";

export const RedeemData = () => {
  const styleMr: StyleMerger = useStyleMr(styles);

  const data = [
    {
      key: "1",
      label: "Processing Request Assets",
      children: (
        <div>
          <div>10000.00 USDT</div>
          <div>10000.00 USDC</div>
          <div>10000.00 USD1</div>
        </div>
      ),
    },
    {
      key: "2",
      label: "Processing Request LP",
      children: <div>10000.00</div>,
    },
    {
      key: "3",
      label: "Processed Request",
      children: (
        <div>
          <div>10000.00 USDT</div>
          <div>10000.00 USDC</div>
          <div>10000.00 USD1</div>
        </div>
      ),
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions title="赎回数据" items={data} />
    </div>
  );
};
