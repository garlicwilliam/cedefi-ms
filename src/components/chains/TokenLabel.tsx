import styles from "./TokenLabel.module.scss";
import { StyleMerger } from "../../util/css.ts";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";

type TokenLabelProps = {
  icon: string;
  symbol: string;
};

export const TokenLabel = ({ symbol, icon }: TokenLabelProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);

  return (
    <div className={styleMr(styles.label)}>
      <img src={icon} alt={symbol} width={20} height={20} />
      <span>{symbol}</span>
    </div>
  );
};
