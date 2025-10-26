import { useSmall } from './useSmall.tsx';
import { bindStyleMerger, StyleMerger } from '../util/css.ts';
import { useAtomValue } from 'jotai';
import { S } from '../state/global.ts';

export const useStyleMr: (styles: any) => StyleMerger = (styles: any): StyleMerger => {
  const isSmall: boolean = useSmall();
  const isDark: boolean = useAtomValue(S.Theme.IsDark);

  return bindStyleMerger(isSmall ? styles.small : '', isDark ? styles.dark : '');
};
