import * as _ from 'lodash';

export type FormatOption = {
  split?: boolean;
  fix?: number;
  precision?: number;
  ceil?: boolean;
  floor?: boolean;
  removeZero?: boolean;
  debug?: boolean;
  short?: boolean;
  sign?: boolean;
};

export enum NumAbbreviation {
  Million = 'M',
  Billion = 'B',
  Thousand = 'K',
  Trillion = 'T',
  None = '',
}

const NumAbb = {
  '0': NumAbbreviation.None,
  '3': NumAbbreviation.Thousand,
  '6': NumAbbreviation.Million,
  '9': NumAbbreviation.Billion,
  '12': NumAbbreviation.Trillion,
};

export const numString = (num: number): string => {
  const str = num.toString().toLowerCase();
  if (str.indexOf('e') >= 0) {
    return expNumToStr(str);
  } else {
    return str;
  }
};

// -----------------------------------------------------------------------------------------------------------------------------------------

export function numStrFormat(num: string, opt?: FormatOption): string {
  num = num.toLowerCase();
  num = num.indexOf('e') >= 0 ? expNumToStr(num) : num;

  const fix: number = opt?.fix !== undefined ? opt.fix : 2;
  const strategy = opt?.ceil ? 'ceil' : opt?.floor ? 'floor' : ('round' as const);
  const split = opt?.split !== false;

  let abb = '';
  if (opt?.short) {
    const abbNum = numForShort(num);

    num = abbNum.num;
    abb = abbNum.abb;
  }

  if (opt?.precision && opt.precision > 0) {
    num = numPrecision(num, opt.precision, strategy);
  } else {
    num = numFixed(num, fix, strategy, opt?.debug || false);
  }

  if (split) {
    num = numInsertSep(num);
  }

  if (opt?.removeZero && num.indexOf('.') >= 0) {
    num = _.trimEnd(num, '0');
    num = _.trimEnd(num, '.');
  }

  let numStr = num + abb;

  if (opt?.sign && !numStr.startsWith('-')) {
    numStr = '+' + numStr;
  }

  return numStr;
}

function numInsertSep(num: string): string {
  const { sign, abs } = absNumb(num);

  const chunks = (val: string): string[] => {
    const rs: any[] = [];
    const remain = val.length % 3;

    let end = remain;
    let sta = 0;
    while (end <= val.length) {
      const seg = val.substring(sta, end);

      if (seg.length > 0) {
        rs.push(seg);
      }

      sta = end;
      end = sta + 3;
    }

    return rs;
  };

  const signStr = sign < 0 ? '-' : '';
  if (abs.indexOf('.') >= 0) {
    const { int, dec } = numToDec(abs);
    return signStr + chunks(int).join(',') + '.' + dec;
  } else {
    return signStr + chunks(abs).join(',');
  }
}

function numPrecision(num: string, precision: number, strategy: 'ceil' | 'round' | 'floor'): string {
  if (precision <= 0) {
    return num;
  }

  const { int: int1, dec } = numToDec(num);
  const sign: 1 | -1 = int1.startsWith('-') ? -1 : 1;
  const int2 = sign === -1 ? _.trimStart(int1, '-') : int1;

  const isInt0: boolean = int2 === '0';

  const intStr: string = isInt0 ? '0' : _.trimStart(int2, '0');
  const intLen: number = isInt0 ? 0 : intStr.length;

  if (intLen >= precision) {
    return _.padEnd(intStr.substring(0, precision), intLen, '0');
  }

  function digitIndex(decimal: string): number {
    const arr = decimal.split('');
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] !== '0') {
        return i;
      }
    }
    return -1;
  }

  const decStart = isInt0 ? digitIndex(dec) : 0;
  if (decStart === -1) {
    return intStr;
  }

  const decTargetLen: number = decStart + (precision - intLen);
  const decLen: number = dec.length;

  if (decLen <= decTargetLen) {
    const decStr = _.padEnd(dec, decTargetLen, '0');
    return [intStr, decStr].join('.');
  }

  const decStr = dec.substring(0, decTargetLen);
  const needCarry = carrySign(dec.substring(decTargetLen), strategy);

  let numStr = [intStr, decStr].join('.');

  if (needCarry) {
    numStr = doCarry(numStr);
  }

  if (sign === -1) {
    numStr = '-' + numStr;
  }

  return numStr;
}

function numFixed(num: string, fix: number, strategy: 'ceil' | 'round' | 'floor', debug: boolean = false): string {
  const { int, dec } = numToDec(num);

  let carry = false;
  let decStr = dec;

  if (dec.length <= fix) {
    decStr = dec + _.repeat('0', fix - dec.length);
  } else if (fix === 0) {
    decStr = '';
    carry = carrySign(dec, strategy);
  } else {
    carry = carrySign(dec.substr(fix), strategy);
    decStr = dec.substr(0, fix);
  }

  if (decStr.length === 0) {
    num = int;
  } else {
    num = int + '.' + decStr;
  }

  if (carry) {
    const { sign, abs } = absNumb(num);
    num = doCarry(abs);
    num = sign < 0 ? '-' + num : num;
  }

  if (debug) {
    //
  }

  return num;
}

function numToDec(num: string): { int: string; dec: string } {
  const parts: string[] = num.split('.');

  if (parts.length === 1) {
    return { int: parts[0], dec: '' };
  } else {
    return { int: parts[0], dec: parts[1] };
  }
}

function absNumb(num: string): { sign: -1 | 1; abs: string } {
  if (num.startsWith('-')) {
    return { sign: -1, abs: num.substring(1) };
  } else {
    return { sign: 1, abs: num };
  }
}

function doCarry(num: string): string {
  let need = true;
  let pos = num.length;
  const arr = new Array(num.length);
  while (need && pos > 0) {
    pos = pos - 1;
    const bit = num[pos];
    if (bit === '.') {
      arr[pos] = '.';
      continue;
    }

    if (Number(bit) < 9) {
      arr[pos] = (Number(bit) + 1).toString();
      need = false;
    } else {
      arr[pos] = '0';
      need = true;
    }
  }

  const fir = need ? '1' : '';

  return fir + num.substr(0, pos) + arr.slice(pos).join('');
}

function carrySign(roundBits: string, strategy: 'ceil' | 'round' | 'floor' = 'round'): boolean {
  if (strategy === 'round') {
    const fir = Number(roundBits[0]);
    if (fir < 5) {
      return false;
    } else if (fir > 5) {
      return true;
    } else {
      return !(roundBits.length === 1 || Number(roundBits[1]) % 2 === 0);
    }
  } else if (strategy === 'ceil') {
    return Number(roundBits) > 0;
  } else if (strategy === 'floor') {
    return false;
  } else {
    return false;
  }
}

function expNumToStr(num: string): string {
  const parts: string[] = String(num).split(/[eE]/); // 分离基数和指数
  if (parts.length === 1) return parts[0]; // 如果不是科学记数法，直接返回

  let sign: 1 | -1 = 1;
  let base: string = parts[0];
  const exponent: number = Number(parts[1]);

  if (base.startsWith('-')) {
    base = base.substring(1);
    sign = -1;
  }

  // 如果指数为正，将小数点向右移动
  if (exponent > 0) {
    const decimalIndex: number = base.indexOf('.');
    if (decimalIndex !== -1) {
      base = base.replace('.', ''); // 移除小数点
      base = base.padEnd(decimalIndex + exponent + 1, '0'); // 补足零
    } else {
      base = base.padEnd(base.length + exponent, '0'); // 没有小数点直接补足零
    }
  }
  // 如果指数为负，将小数点向左移动
  else {
    const decimalIndex: number = base.indexOf('.');
    if (decimalIndex !== -1) {
      base = base.replace('.', ''); // 移除小数点
      base = base.padStart(base.length - exponent, '0'); // 补足零
    } else {
      base = base.padStart(base.length - exponent, '0');
    }

    base = base.replace(/^0{1}/, '0.'); // 处理开头的零
  }

  return sign < 0 ? '-' + base : base;
}

function numForShort(num: string): { num: string; abb: string } {
  let isPositive: boolean = false;
  if (num.startsWith('-')) {
    num = num.substring(1);
    isPositive = true;
  }

  const pointOffset = num.indexOf('.');

  const parts = pointOffset >= 0 ? num.split('.') : [num, ''];
  const intPart = parts[0];
  const decPart = parts[1];

  const intLen = intPart.length;

  let newNum = num;
  let newAbb = NumAbbreviation.None;

  const sub: 12 | 9 | 6 | 3 | 0 = intLen > 12 ? 12 : intLen > 9 ? 9 : intLen > 6 ? 6 : intLen > 3 ? 3 : 0;
  const offset = intLen - sub;

  if (sub === 0) {
    return { num: isPositive ? '-' + newNum : newNum, abb: newAbb };
  }

  const newInt = intPart.substring(0, offset);
  const newDec = intPart.substring(offset) + decPart;

  const subStr = sub.toString() as '12' | '9' | '6' | '3';
  newNum = newInt + '.' + newDec;
  newAbb = NumAbb[subStr];

  return { num: isPositive ? '-' + newNum : newNum, abb: newAbb };
}
