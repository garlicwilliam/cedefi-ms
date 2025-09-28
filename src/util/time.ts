import dayjs, { Dayjs } from "dayjs";

export function formatDatetime(seconds: number): string {
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
  return number.toString().padStart(len, "0");
}

export function dayjsObj(timestamp: number): Dayjs {
  if (timestamp.toString().length == 10) {
    timestamp = timestamp * 1000;
  }

  const d = dayjs(timestamp);

  return d;
}
