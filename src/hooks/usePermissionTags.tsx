import { usePermissions } from "./usePermissions.tsx";
import { Permission } from "../service/types.ts";
import { useMemo } from "react";

type PermissionTagsHook = (permissionIds: string[]) => Permission[];

export const usePermissionTags: PermissionTagsHook = (
  ids: string[] = [],
): Permission[] => {
  const { map } = usePermissions();

  return useMemo((): Permission[] => {
    return ids
      .map((p: string) => {
        return map?.get(p);
      })
      .filter((p) => p !== undefined);
  }, [map, ids]);
};
