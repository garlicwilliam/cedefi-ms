import styles from "./index.module.scss";
import { Descriptions } from "antd";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";

export const CeffuData = () => {
  const styleMr = useStyleMr(styles);

  const data = [
    {
      key: "1",
      label: "累计流入(USD)",
      children: "1000000.00",
    },
    {
      key: "2",
      label: "累计流出(USD)",
      children: "500000.00",
    },
    {
      key: "3",
      label: "累计delegate(USD)",
      children: "Zhou Maomao",
    },
    {
      key: "4",
      label: "累计undelegate(USD)",
      children: "100000.00",
    },
  ];

  return (
    <div className={styleMr(styles.info)}>
      <Descriptions title="Ceffu数据" items={data} />
    </div>
  );
};
