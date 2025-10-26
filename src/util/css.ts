export type StyleMerger = (...names: (string | undefined)[]) => string;

export function styleMerge(...names: (string | undefined)[]): string {
  return names.filter((one: string | undefined): boolean => one !== undefined && one.length > 0).join(' ');
}

export function bindStyleMerger(mobileCss: string, ...cssArr: string[]): StyleMerger {
  function merger(...names: (string | undefined)[]): string {
    return styleMerge(mobileCss, ...cssArr, ...names);
  }

  return merger;
}

export function cssPick(isSelect: boolean, name: string): string {
  return isSelect ? name : '';
}

export function px(num: number | undefined) {
  return num === undefined ? undefined : `${num}px`;
}
