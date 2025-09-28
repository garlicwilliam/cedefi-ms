import { useAtomValue } from "jotai";
import { S } from "../state/global.ts";
import { AdminUser, Permission } from "../service/types.ts";
import { useEffect, useState } from "react";
import { usePermissions } from "./usePermissions.tsx";

type PermissionReturnType = {
  map: Map<string, Permission> | null;
  arr: Permission[];
};

// 获取当前登录用户的权限列表
export const useAuthPermissions: () => PermissionReturnType =
  (): PermissionReturnType => {
    const user: AdminUser | null = useAtomValue(S.Auth.User);
    const { map: permissionMap } = usePermissions();

    const [data, setData] = useState<PermissionReturnType>({
      arr: [],
      map: null,
    });

    //
    useEffect((): void => {
      if (user && permissionMap) {
        const map = new Map<string, Permission>();
        const arr: Permission[] = [];
        const userPermissions: Permission[] = user.permissions
          .map((id: string) => {
            return permissionMap.get(id);
          })
          .filter(Boolean) as Permission[];

        userPermissions.forEach((p) => {
          if (p && p.id && !map.has(p.id)) {
            map.set(p.id, p);
            arr.push(p);
          }
        });

        const cache: PermissionReturnType = { arr, map };
        setData(cache);
      }
    }, [user, permissionMap]);

    //
    return data;
  };
