import { atom } from "jotai";
import { AdminUser, PermissionCache } from "../service/types.ts";

export const S = {
  Auth: {
    User: atom<AdminUser | null>(null),
  },
  Cache: {
    Permissions: atom<PermissionCache | null>(null),
  },
} as const;
