import type {
  CreateParams,
  DataProvider,
  GetListParams,
  GetManyParams,
  GetManyResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
  CreateResponse,
  DeleteOneParams,
  DeleteOneResponse,
} from '@refinedev/core';
import { generateFilterGraph, generateSort } from './util/filter.ts';
import { httpPost, HttpResponse } from './util/http.ts';
import { THE_GRAPH_API_KEY } from './const/keys.ts';
import { map } from 'rxjs/operators';
import { GraphListResponseBody, GraphOneResponseBody } from './service/types.ts';
import { firstValueFrom } from 'rxjs';
import { BaseRecord } from '@refinedev/core';

type GraphSubEntity = {
  entityFields: string[];
  entitySub?: {
    [key: string]: GraphSubEntity;
  };
};

type GraphMetaFields = {
  entityFields: string[];
  entityType: string;
  entityName: string;
  entitySub?: {
    [key: string]: GraphSubEntity;
  };
};

type OrderItem = {
  orderBy: string;
  orderDirection: 'asc' | 'desc';
};

const defaultOrder: OrderItem = { orderBy: 'id', orderDirection: 'desc' };
const authHeader = { Authorization: `Bearer ${THE_GRAPH_API_KEY}` };

function genSubStr(subs: { [key: string]: GraphSubEntity } | undefined): string {
  if (!subs) {
    return '';
  }

  const names: string[] = Object.keys(subs);
  const subStrs: string[] = names.map((name) => {
    const sub = subs[name];
    const fields: string = `{ 
      ${sub.entityFields.join('\n')} 
      \n
      ${genSubStr(sub.entitySub)}
    }`;

    return `${name} ${fields}`;
  });

  return subStrs.join('\n');
}

export const graphProvider = (
  url: string,
): Omit<Required<DataProvider>, 'createMany' | 'updateMany' | 'deleteMany' | 'custom'> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }: GetListParams) => {
    const { currentPage = 1, pageSize = 10 } = pagination ?? {};
    const { entityFields, entityType, entitySub } = meta as GraphMetaFields;

    const where: any = filters ? generateFilterGraph(filters) : undefined;
    const skip: number = (currentPage - 1) * pageSize || 0;
    const first: number = pageSize || 1;
    const order: OrderItem = sorters ? (generateSort(sorters) as OrderItem) || defaultOrder : defaultOrder;

    const subEntities: string = genSubStr(entitySub);

    const param = {
      query: `query Get${resource}($skip: Int, $first: Int, $orderBy: ${entityType}_orderBy, $orderDirection: OrderDirection, $where: ${entityType}_filter ) {
        ${resource}(
          skip: $skip,
          first: $first,
          orderBy: $orderBy,
          orderDirection: $orderDirection,
          where: $where
        ) {
          ${entityFields.join('\n')}
          \n
          ${subEntities}
        }
      }`,
      variables: {
        first: 1000,
        skip: skip,
        orderBy: order.orderBy,
        orderDirection: order.orderDirection,
        where: where,
      },
    };

    const { data, total } = await firstValueFrom(
      httpPost<GraphListResponseBody>(url, param, {
        header: { Authorization: `Bearer ${THE_GRAPH_API_KEY}` },
      }).pipe(
        map((res: HttpResponse<GraphListResponseBody>) => {
          const resOK: boolean = res.status === 200;
          const hasData: boolean = !!res.body.data;
          const isOK: boolean = resOK && hasData;

          if (isOK) {
            const body: GraphListResponseBody = res.body;
            let list: any[] = body.data ? body.data[resource] : [];
            const len: number = list.length;

            if (len > first) {
              list = list.slice(0, first);
            }

            const total: number = skip + len;

            return {
              data: list,
              total,
            };
          } else {
            let errInfo: string = 'Error Happened';
            if (resOK) {
              const errors = res.body.errors;
              if (errors && errors.length > 0) {
                errInfo = errors[0].message;
              }
            } else if (res.message) {
              errInfo = res.message;
            }

            throw new Error(errInfo);
          }
        }),
      ),
    );

    return {
      data,
      total,
    };
  },

  getMany: async <T extends BaseRecord>({
    resource,
    ids,
    meta,
  }: GetManyParams): Promise<GetManyResponse<T>> => {
    const { entityType, entityFields, entitySub } = meta as GraphMetaFields;

    const subEntities: string = genSubStr(entitySub);

    const where = { id_in: ids };
    const param = {
      query: `query Fetch${resource}($where: ${entityType}_filter) {
        ${resource}(
          where: $where
        ) {
          ${entityFields.join('\n')}
          \n
          ${subEntities}
        }
      }`,
      variables: {
        where: where,
      },
    };

    const { data } = await firstValueFrom(
      httpPost<GraphListResponseBody>(url, param, { header: authHeader }).pipe(
        map((res: HttpResponse<GraphListResponseBody>) => {
          const resOK: boolean = res.status === 200;
          const bodyOK: boolean = !!res.body.data;
          const isOK: boolean = resOK && bodyOK;

          if (isOK) {
            const list: T[] = res.body.data ? res.body.data[resource] : [];

            return { data: list };
          } else {
            const error = res.body.errors && res.body.errors.length > 0 ? res.body.errors[0] : null;
            const errInfo = resOK && error ? error.message : res.message || 'Error Happened';

            throw new Error(errInfo);
          }
        }),
      ),
    );

    return { data };
  },

  getOne: async <T extends BaseRecord>({ id, meta }: GetOneParams): Promise<GetOneResponse<T>> => {
    const { entityName, entityFields, entitySub } = meta as GraphMetaFields;

    const subEntities: string = genSubStr(entitySub);

    const param = {
      query: `{
        ${entityName}(id: "${id}") {
          ${entityFields.join('\n')}
          \n
          ${subEntities}
        }
      }`,
    };

    const { data } = await firstValueFrom(
      httpPost<GraphOneResponseBody>(url, param, { header: authHeader }).pipe(
        map((res: HttpResponse<GraphOneResponseBody>) => {
          const resOK: boolean = res.status === 200;
          const bodyOK: boolean = !!res.body.data;
          const isOK: boolean = resOK && bodyOK;

          if (isOK) {
            const entity: T | null = res.body.data[entityName];

            if (entity) {
              return { data: entity as T };
            } else {
              throw new Error('Not Found');
            }
          } else if (res.body.errors && res.body.errors.length > 0) {
            const errInfo: string = res.body.errors[0].message;
            throw new Error(errInfo);
          } else {
            throw new Error('Not Found');
          }
        }),
      ),
    );

    return { data };
  },

  getApiUrl: () => {
    return url;
  },

  create: async <T extends BaseRecord, P = object>(params: CreateParams<P>): Promise<CreateResponse<T>> => {
    console.log('params', params);
    return Promise.resolve({ data: {} as T });
  },

  update: async <T extends BaseRecord, P = object>(params: UpdateParams<P>): Promise<UpdateResponse<T>> => {
    console.log('params', params);
    return Promise.resolve({ data: {} as T });
  },

  deleteOne: async <T extends BaseRecord, P = object>(
    params: DeleteOneParams<P>,
  ): Promise<DeleteOneResponse<T>> => {
    console.log('params', params);
    return Promise.resolve({ data: {} as T });
  },
});
