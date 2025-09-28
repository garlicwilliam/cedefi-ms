import { generateSort } from "@refinedev/simple-rest";
import type {
  DataProvider,
  GetListParams,
  GetManyParams,
} from "@refinedev/core";
import {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
  HttpResponse,
  isStatusOK,
} from "./util/http.ts";
import { firstValueFrom, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RestResponseBody } from "./service/types.ts";
import QS from "query-string";
import { AUTH_TOKEN_STORAGE_NAME } from "./const.ts";
import { generateFilter } from "./util/filter.ts";

type SortDirection = "asc" | "desc";
type SortString =
  | SortDirection
  | `${SortDirection},${SortDirection}`
  | `${SortDirection},${SortDirection},${SortDirection}`;

export const restProvider = (
  apiUrl: string,
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({
    resource,
    pagination,
    filters,
    sorters,
    meta,
  }: GetListParams) => {
    const url = `${apiUrl}/${resource}`;

    const {
      currentPage = 1,
      pageSize = 10,
      mode = "server",
    } = pagination ?? {};

    const queryArgs: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      dir?: SortString;
    } = {};
    const { headers: headersFromMeta } = meta ?? {};

    const queryFilters = generateFilter(filters);

    if (mode === "server") {
      queryArgs.offset = (currentPage - 1) * pageSize;
      queryArgs.limit = pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;

      queryArgs.orderBy = _sort.join(",");
      queryArgs.dir = _order.join(",") as SortString;
    }

    const combinedQuery = { ...queryArgs, ...queryFilters };

    const { data, total } = await firstValueFrom(
      httpGet<RestResponseBody>(url, combinedQuery, {
        header: {
          ...headersFromMeta,
          Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
        },
      }).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const list = res.body.data.list;
            const total: number = res.body.data.total;

            return {
              data: list,
              total,
            };
          }

          const errInfo: string = res.body.message || res.message || "Error";

          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
      total: total || data.length,
    };
  },

  getMany: async ({ resource, ids, meta }: GetManyParams) => {
    const { headers } = meta ?? {};
    const url: string = `${apiUrl}/${resource}`;

    const { data } = await firstValueFrom(
      httpGet<RestResponseBody>(
        url,
        { id: ids },
        {
          header: {
            ...headers,
            Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
          },
        },
      ).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const list = res.body.data.list;

            return {
              data: list,
            };
          }

          const errInfo = res.body.message || res.message || "Error";

          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers } = meta ?? {};
    const { data } = await firstValueFrom(
      httpPost<RestResponseBody>(url, variables, {
        header: {
          ...headers,
          Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
        },
      }).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const obj = res.body.data.obj;

            return {
              data: obj,
            };
          }

          const errInfo = res.body.message || res.message || "Error";
          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    let url: string = `${apiUrl}/${resource}/${id}`;
    if (meta?.subPath) {
      url = `${url}/${meta.subPath}`;
    }

    const { headers, method } = meta ?? {};

    const funCall =
      method?.toLowerCase() === "post"
        ? httpPost
        : method?.toLowerCase() === "put"
          ? httpPut
          : method?.toLowerCase() === "patch"
            ? httpPatch
            : httpPost;

    const { data } = await firstValueFrom(
      funCall<RestResponseBody>(url, variables, {
        header: {
          ...headers,
          Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
        },
      }).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const obj = res.body.data.obj;

            return {
              data: obj,
            };
          }

          const errInfo: string = res.body.message || res.message || "Error";
          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers } = meta ?? {};
    const { data } = await firstValueFrom(
      httpGet<RestResponseBody>(
        url,
        {},
        {
          header: {
            ...headers,
            Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
          },
        },
      ).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const obj = res.body.data.obj;

            return {
              data: obj,
            };
          }

          const errInfo: string = res.body.message || res.message || "Error";
          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers } = meta ?? {};

    const { data } = await firstValueFrom(
      httpDelete<RestResponseBody>(url, variables, {
        header: {
          ...headers,
          Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
        },
      }).pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            const obj = res.body.data.obj;

            return {
              data: obj,
            };
          }

          const errInfo: string = res.body.message || res.message || "Error";
          throw new Error(errInfo);
        }),
      ),
    );

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
  }) => {
    let requestUrl = `${url}`;

    let queryArgs: { [k: string]: string } = {};

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;

        const sortQuery = {
          orderBy: _sort.join(","),
          dir: _order.join(","),
        };

        queryArgs = { ...queryArgs, ...sortQuery };
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);

      queryArgs = { ...queryArgs, ...filterQuery };
    }

    if (query) {
      queryArgs = { ...queryArgs, ...query };
    }

    requestUrl += "?" + QS.stringify(queryArgs);

    let request: Observable<HttpResponse<RestResponseBody>>;

    switch (method) {
      case "put":
        request = httpPut(url, payload, { header: headers });
        break;
      case "post":
        request = httpPost(url, payload, { header: headers });
        break;
      case "patch":
        request = httpPatch(url, payload, { header: headers });
        break;
      case "delete":
        request = httpDelete(url, payload, { header: headers });
        break;
      default:
        request = httpGet(requestUrl, {
          header: {
            ...headers,
            Authorization: localStorage.getItem(AUTH_TOKEN_STORAGE_NAME),
          },
        });
        break;
    }

    const { data } = await firstValueFrom(
      request.pipe(
        map((res: HttpResponse<RestResponseBody>) => {
          if (isStatusOK(res.status) && res.body.isOK) {
            return {
              data: res.body.data.list || res.body.data.obj,
            };
          }

          throw new Error(res.body.message || res.message || "Error");
        }),
      ),
    );

    return Promise.resolve({ data });
  },
});
