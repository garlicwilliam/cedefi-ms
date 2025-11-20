import { useMutation } from '@tanstack/react-query';
import { REST_API } from '../../const/env.ts';
import { httpPatch } from '../../util/http.ts';
import { AUTH_TOKEN_STORAGE_NAME } from '../../const/const.ts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';
import { App as AntApp } from 'antd';

export type PatchAssetPayVariable = {
  roundId: number | null;
  bindIds: number[] | null;
  unbindIds: number[] | null;
};

export function usePatchAssetPay(variables: PatchAssetPayVariable) {
  const [param, setParam] = useState<PatchAssetPayVariable | null>(null);
  const paramRef = useRef<PatchAssetPayVariable | null>(param);
  const { notification } = AntApp.useApp();

  useEffect(() => {
    paramRef.current = param;
  }, [param]);

  useEffect(() => {
    const newParam: PatchAssetPayVariable = {
      roundId: variables.roundId,
      bindIds: variables.bindIds ? Array.from(new Set(variables.bindIds)).sort() : null,
      unbindIds: variables.unbindIds ? Array.from(new Set(variables.unbindIds)).sort() : null,
    };

    if (!paramRef.current) {
      setParam(newParam);
    } else if (!_.isEqual(paramRef.current, newParam)) {
      setParam(newParam);
    }
  }, [variables, param]);

  const updater = useCallback(async () => {
    if (!param || (!param.unbindIds && !param.unbindIds)) {
      return;
    }

    const url: string = REST_API + '/asset_repay';
    const payload = {
      bind:
        param.roundId && param.bindIds
          ? {
              roundId: param.roundId,
              ids: param.bindIds,
            }
          : undefined,
      unbind: param.unbindIds
        ? {
            ids: param.unbindIds,
          }
        : undefined,
    };

    return firstValueFrom(
      httpPatch(url, payload, {
        header: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_STORAGE_NAME)}` },
      }).pipe(
        map((res) => {
          if (res.status !== 200) {
            throw new Error(res.message || 'Failed to patch asset repay');
          }

          notification.success({ message: 'Round Asset Repay updated successfully' });
        }),
      ),
    );
  }, [param, notification]);

  const key = useMemo(() => {
    return ['patch-asset-pay', param];
  }, [param]);

  return useMutation({ mutationFn: updater, mutationKey: key });
}
