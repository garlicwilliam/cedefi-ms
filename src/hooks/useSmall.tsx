import { Grid } from "antd";

export const useSmall: () => boolean = (): boolean => {
  const breakpoint = Grid.useBreakpoint();
  return typeof breakpoint.sm === "undefined" ? true : breakpoint.sm;
};
