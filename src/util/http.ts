import { from, Observable, of, forkJoin } from "rxjs";
import * as request from "superagent";
import { Response, Request } from "superagent";
import { catchError, map } from "rxjs/operators";

export const normalTimeout: number = 30000;
export type HttpResponse<T> = {
  status: number;
  message?: string;
  body: T;
};

export function httpPatch<T>(
  url: string,
  param: any,
  ops?: {
    isForm?: boolean;
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<HttpResponse<T>> {
  try {
    const postUrl: Request = ops?.isForm
      ? request.patch(url).type("form")
      : request
          .patch(url)
          .timeout(ops?.timeout || normalTimeout)
          .withCredentials(ops?.withCredentials || false)
          .set(ops?.header || {});

    return from(postUrl.send(param)).pipe(
      map((res: Response) => {
        return {
          status: res.status,
          body: res.body as T,
        };
      }),
      catchError((err) => {
        console.log("http post error", { err });
        const status: number = err.status || err.response.status;
        const message: string =
          err.message || err.response.statusText || "Error";
        const body = err.response.body || {};

        return of({
          status,
          message,
          body,
        });
      }),
    );
  } catch (err) {
    console.warn(url, err);

    return of({
      status: 500,
      message: "Error: " + err,
      body: {} as T,
    });
  }
}

export function httpPut<T>(
  url: string,
  param: any,
  ops?: {
    isForm?: boolean;
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<HttpResponse<T>> {
  try {
    const postUrl: Request = ops?.isForm
      ? request.put(url).type("form")
      : request
          .put(url)
          .timeout(ops?.timeout || normalTimeout)
          .withCredentials(ops?.withCredentials || false)
          .set(ops?.header || {});

    return from(postUrl.send(param)).pipe(
      map((res: Response) => {
        return {
          status: res.status,
          body: res.body as T,
        };
      }),
      catchError((err) => {
        console.log("http post error", { err });
        const status: number = err.status || err.response.status;
        const message: string =
          err.message || err.response.statusText || "Error";
        const body = err.response.body || {};

        return of({
          status,
          message,
          body,
        });
      }),
    );
  } catch (err) {
    console.warn(url, err);

    return of({
      status: 500,
      message: "Error: " + err,
      body: {} as T,
    });
  }
}

export function httpPost<T>(
  url: string,
  param: any,
  ops?: {
    isForm?: boolean;
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<HttpResponse<T>> {
  try {
    const postUrl: Request = ops?.isForm
      ? request.post(url).type("form")
      : request
          .post(url)
          .timeout(ops?.timeout || normalTimeout)
          .withCredentials(ops?.withCredentials || false)
          .set(ops?.header || {});

    return from(postUrl.send(param)).pipe(
      map((res: Response) => {
        return {
          status: res.status,
          body: res.body as T,
        };
      }),
      catchError((err) => {
        console.log("http post error", { err });
        const status: number = err.status || err.response.status;
        const message: string =
          err.message || err.response.statusText || "Error";
        const body = err.response.body || {};

        return of({
          status,
          message,
          body,
        });
      }),
    );
  } catch (err) {
    console.warn(url, err);

    return of({
      status: 500,
      message: "Error: " + err,
      body: {} as T,
    });
  }
}

export function httpGet<T>(
  url: string,
  param: any = {},
  ops?: {
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<HttpResponse<T>> {
  try {
    return from(
      request
        .get(url)
        .withCredentials(ops?.withCredentials || false)
        .set(ops?.header || {})
        .timeout(ops?.timeout || normalTimeout)
        .query(param),
    ).pipe(
      map((res: Response) => {
        const code: number = res.status;
        return {
          status: code,
          body: res.body as T,
        };
      }),
      catchError((err) => {
        console.log({ err });

        const status: number =
          err.status || (err.response && err.response.status) || 500;
        const message: string =
          err.message || (err.response && err.response.statusText) || "Error";

        const body = (err.response && err.response.body) || {};

        return of({
          status,
          message,
          body: body.data as T,
        });
      }),
    );
  } catch (err) {
    return of({
      status: 500,
      message: "Error: " + err,
      body: {} as T,
    });
  }
}

export function httpDelete<T>(
  url: string,
  param: any = {},
  ops?: {
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<HttpResponse<T>> {
  try {
    return from(
      request
        .delete(url)
        .withCredentials(ops?.withCredentials || false)
        .set(ops?.header || {})
        .timeout(ops?.timeout || normalTimeout)
        .query(param),
    ).pipe(
      map((res: Response) => {
        const code: number = res.status;
        return {
          status: code,
          body: res.body as T,
        };
      }),
      catchError((err) => {
        console.log({ err });

        const status: number =
          err.status || (err.response && err.response.status) || 500;
        const message: string =
          err.message || (err.response && err.response.statusText) || "Error";

        const body = (err.response && err.response.body) || {};

        return of({
          status,
          message,
          body: body.data as T,
        });
      }),
    );
  } catch (err) {
    return of({
      status: 500,
      message: "Error: " + err,
      body: {} as T,
    });
  }
}

export function httpGetMulti(
  urls: string[], // 接受一个 URL 数组
  param: any = {},
  ops?: {
    returnError?: boolean;
    withCredentials?: boolean;
    header?: { [k: string]: string };
    timeout?: number;
  },
): Observable<any[]> {
  try {
    // 创建多个请求 Observable 数组
    const requests = urls.map((url) => {
      return from(
        request
          .get(url)
          .withCredentials(ops?.withCredentials || false)
          .set(ops?.header || {})
          .timeout(ops?.timeout || 5000) // 默认超时设置为 5000 毫秒
          .query(param),
      ).pipe(
        map((response) => {
          // console.log(`请求成功: ${url}`); // 添加成功日志
          return response;
        }),
        catchError((err) => {
          console.warn(`http get error for URL ${url}:`, err);
          if (ops?.returnError) {
            throw err;
          } else {
            return of(null); // 返回 null 作为错误处理的占位符
          }
        }),
      );
    });

    // 使用 forkJoin 并行执行所有请求
    return forkJoin(requests);
  } catch (err) {
    console.warn("Error while making multiple http requests:", err);
    if (ops?.returnError) {
      throw err;
    } else {
      return of([]); // 返回空数组作为默认结果
    }
  }
}

export function httpJson(url: string): Observable<any> {
  return from(request.get(url).accept("application/json")).pipe(
    map((res: Response) => {
      return res.body;
    }),
    catchError((err) => {
      console.warn(url, err);
      return of({});
    }),
  );
}

export function isStatusOK(status: number): boolean {
  return status >= 200 && status < 300;
}
