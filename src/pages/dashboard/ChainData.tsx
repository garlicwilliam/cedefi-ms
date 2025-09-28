import { Descriptions } from "antd";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";
import styles from "./index.module.scss";

export const ChainData = () => {
  const styleMr = useStyleMr(styles);

  const data = [
    {
      key: "1",
      label: "累计存款(USD)",
      children: "200000.00",
    },
    {
      key: "2",
      label: "累计结算赎回(USD)",
      children: "100000.00",
    },
    {
      key: "3",
      label: "流动LP数量",
      children: "18000.00",
    },
    {
      key: "4",
      label: "待Claim资产",
      children: (
        <div>
          <div>100 USDC</div>
          <div>100 USDT</div>
        </div>
      ),
    },
    {
      key: "5",
      label: "退出费收入",
      children: (
        <div>
          <div>100 USDC</div>
          <div>100 USDT</div>
        </div>
      ),
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions title="链上数据" items={data} />
    </div>
  );
};
