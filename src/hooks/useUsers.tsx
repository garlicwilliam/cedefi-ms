import { useList } from "@refinedev/core";
import { AdminUser } from "../service/types.ts";

export const useUsers = () => {
  const { result } = useList({
    resource: "users",
    pagination: { pageSize: 100, currentPage: 1 },
  });
  const users = result.data;

  //
  const map = users.reduce((acc, cur: any) => {
    const newUser: AdminUser = {
      id: cur.id as number,
      email: cur.email,
      permissions: cur.permissions,
    };

    acc.set(cur.id, newUser);

    return acc;
  }, new Map<number, AdminUser>());

  return { arr: users, map };
};
