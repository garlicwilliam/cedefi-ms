import { useSmall } from "../../hooks/useSmall.tsx";
import { bindStyleMerger, StyleMerger } from "../../util/css.ts";
import styles from "./FilterDropdown.module.scss";
import { ReactNode } from "react";

export const FilterDropdown = (props: { children: ReactNode }) => {
  const isSmall: boolean = useSmall();
  const styleMr: StyleMerger = bindStyleMerger(isSmall ? styles.small : "");

  return <div className={styleMr(styles.dropdown)}>{props.children}</div>;
};
