import { Hash } from "node:crypto";
import { createHash } from "crypto";
import type { ResponseFail, ResponseList, ResponseObj, User } from "./types";

export function passwordToHash(password: string): string {
  const hash: Hash = createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

export function successList<T>(list: T[], total: number): ResponseList<T> {
  return {
    isOK: true,
    message: "success",
    data: {
      list,
      total,
    },
  };
}

export function successObj<T>(obj: T, args: object = {}): ResponseObj<T> {
  return {
    isOK: true,
    message: "success",
    data: {
      obj,
      ...args,
    },
  };
}

export function failRes(message: string): ResponseFail {
  return {
    isOK: false,
    message,
    data: null,
  };
}

export function userPublic(user: User): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

export function curTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
