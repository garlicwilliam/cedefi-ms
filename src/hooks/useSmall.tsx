import { Grid } from 'antd';

export const useSmall: () => boolean = (): boolean => {
  const breakpoint = Grid.useBreakpoint();
  return typeof breakpoint.lg === 'undefined' ? false : !breakpoint.lg;
};
