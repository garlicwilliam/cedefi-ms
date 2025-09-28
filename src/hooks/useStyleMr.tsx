import { useSmall } from "./useSmall.tsx";
import { bindStyleMerger, StyleMerger } from "../util/css.ts";

export const useStyleMr: (styles: any) => StyleMerger = (
  styles: any,
): StyleMerger => {
  const isSmall: boolean = useSmall();
  return bindStyleMerger(isSmall ? styles.small : "");
};
