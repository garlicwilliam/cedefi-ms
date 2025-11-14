import dayjs, { Dayjs } from 'dayjs';

export function formatDatetime(seconds: number): string {
  if (seconds === 0) {
    return 'N/A';
  }

  const date: Date = new Date(seconds * 1000);
  //
  const yy = date.getFullYear();
  const mm = padTimeStr(date.getMonth() + 1);
  const dd = padTimeStr(date.getDate());
  //
  const hh = padTimeStr(date.getHours());
  const min = padTimeStr(date.getMinutes());
  const ss = padTimeStr(date.getSeconds());
  //
  return `${yy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export function formatDateHour(seconds: number): string {
  if (seconds == 0) {
    return 'N/A';
  }

  const date: Date = new Date(seconds * 1000);
  //
  const yy = date.getFullYear();
  const mm = padTimeStr(date.getMonth() + 1);
  const dd = padTimeStr(date.getDate());
  //
  const hh = padTimeStr(date.getHours());
  const min = padTimeStr(date.getMinutes());

  //
  return `${yy}-${mm}-${dd} ${hh}:${min}`;
}

export function timestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

function padTimeStr(number: number, len: number = 2): string {
  return number.toString().padStart(len, '0');
}

export function dayjsObj(timestamp: number): Dayjs {
  if (timestamp.toString().length == 10) {
    timestamp = timestamp * 1000;
  }

  const d = dayjs(timestamp);

  return d;
}

/**
 *
 * @param last - 最近一个整点结束，用0表示，1 表示上一个整点结束，依次类推
 * @param delay - 延迟秒数, 当最近一个整点过去多少秒之后，才算作是整点结束，只在last = 0 时有效
 * @returns 整点结束的时间戳（秒）
 */
export function hourEndAt(last: number = 0, delay = 0): number {
  const now = new Date().getTime() / 1000;
  last = now % 3600 < delay && last === 0 ? 1 : last;

  const hourIndex = Math.floor(now / 3600);
  return (hourIndex - last) * 3600;
}

export function timeAgo(time: number): { day: number; hour: number; minute: number } {
  if (!time) {
    return { day: 0, hour: 0, minute: 0 };
  }

  const now = Math.floor(new Date().getTime() / 1000);
  let diff = now - time;

  if (diff < 0) {
    diff = 0;
  }

  const day = Math.floor(diff / (24 * 3600));
  diff = diff % (24 * 3600);

  const hour = Math.floor(diff / 3600);
  diff = diff % 3600;

  const minute = Math.floor(diff / 60);

  return { day, hour, minute };
}
