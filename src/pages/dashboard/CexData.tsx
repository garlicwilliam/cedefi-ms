import styles from "./index.module.scss";
import { Descriptions } from "antd";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";

export const CexData = () => {
  const styleMr = useStyleMr(styles);

  const data = [
    {
      key: "1",
      label: "累计充值(USD)",
      children: "1000000.00",
    },
    {
      key: "2",
      label: "累计提现(USD)",
      children: "500000.00",
    },
    {
      key: "3",
      label: "24小时盈利(USD)",
      children: "100.00",
    },
    {
      key: "4",
      label: "基金累计收益(USD)",
      children: "100000.00",
    },
    {
      key: "5",
      label: "*平台累积收益(USD)",
      children: "100000.00",
    },
    {
      key: "6",
      label: "*用户累计收益(USD)",
      children: "100000.00",
    },
    {
      key: "7",
      label: "*团队累计收益(USD)",
      children: "100000.00",
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions title="Cex数据" items={data} />
    </div>
  );
};
