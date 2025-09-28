import { useAtom } from "jotai/index";
import { S } from "../state/global.ts";
import { useList } from "@refinedev/core";
import { useEffect } from "react";
import { Permission, PermissionCache } from "../service/types.ts";

type PermissionReturnType = {
  map: Map<string, Permission> | null;
  arr: Permission[];
};

export const usePermissions: () => PermissionReturnType =
  (): PermissionReturnType => {
    const [permissions, setPermissions] = useAtom(S.Cache.Permissions);

    const { result } = useList({
      resource: "permissions",
      pagination: { pageSize: 100, currentPage: 1 },
      queryOptions: {
        enabled: !permissions,
      },
    });

    //
    const fetched = result.data;

    //
    useEffect(() => {
      if (fetched && fetched.length > 0 && !permissions) {
        const map = new Map<string, Permission>();
        const arr: Permission[] = [];

        fetched.forEach((p) => {
          if (p && p.id) {
            const obj: Permission = {
              id: p.id as string,
              label: p.label,
              description: p.description,
            };

            map.set(obj.id, obj);
            arr.push(obj);
          }
        });

        const cache: PermissionCache = { arr, map };
        setPermissions(cache);
      }
    }, [fetched, permissions, setPermissions]);

    return {
      map: permissions?.map || null,
      arr: permissions?.arr || [],
    };
  };
