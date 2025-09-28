import styles from "./IndexCardTitle.module.scss";
import { bindStyleMerger, StyleMerger } from "../../util/css.ts";
import { useSmall } from "../../hooks/useSmall.tsx";

export type IndexCardTitleProps = {
  title: string;
  desc: string;
};

export const IndexCardTitle = ({ title, desc }: IndexCardTitleProps) => {
  const isSmall: boolean = useSmall();

  const styleMr: StyleMerger = bindStyleMerger(isSmall ? styles.small : "");

  return (
    <div className={styleMr(styles.titleGroup)}>
      <div className={styleMr(styles.title)}>{title}</div>
      <div className={styleMr(styles.desc)}>{desc}</div>
    </div>
  );
};
