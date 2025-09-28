import styles from "./ChainLabel.module.scss";
import { useStyleMr } from "../../hooks/useStyleMr.tsx";
import { StyleMerger } from "../../util/css.ts";

type ChainLabelProps = {
  chainId: string;
  icon: string;
  name: string;
};

export const ChainLabel = ({ icon, name }: ChainLabelProps) => {
  const styleMr: StyleMerger = useStyleMr(styles);

  return (
    <div className={styleMr(styles.label)}>
      <img src={icon} alt="" width={20} height={20} />
      <span>{name}</span>
    </div>
  );
};
