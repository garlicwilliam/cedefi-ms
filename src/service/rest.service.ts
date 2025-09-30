import { REST_API_BASE_HOST } from "../const/const.ts";
import { httpGet, httpPost, HttpResponse } from "../util/http.ts";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AdminUser, RestResponseBody } from "./types.ts";

const URL_PATH = {
  auth_login: REST_API_BASE_HOST + "/auth/login",
  auth_logout: REST_API_BASE_HOST + "/auth/logout",
  auth_current: REST_API_BASE_HOST + "/auth/current",
  auth_password: REST_API_BASE_HOST + "/auth/password",
};

export type AuthUserResponse = {
  isOK: boolean;
  user: AdminUser | null;
};

export type AuthLoginResponse = {
  isOK: boolean;
  user: AdminUser | null;
  token?: string;
  message: string | null;
};

export type AuthSimpleResponse = {
  isOK: boolean;
  message?: string | null;
};

function resParse(res: HttpResponse<RestResponseBody>): RestResponseBody {
  if (res.status === 200) {
    return res.body;
  }

  if (res.status === 401 || res.status === 403) {
    return res.body;
  }

  return {
    isOK: false,
    message: "Error",
    data: {} as any,
  };
}

export class RestService {
  //
  public authCurrentUser(token: string): Observable<AuthUserResponse> {
    return httpGet<RestResponseBody>(
      URL_PATH.auth_current,
      {},
      { header: { Authorization: `Bearer ${token}` } },
    ).pipe(
      map((res: HttpResponse<RestResponseBody>): RestResponseBody => {
        return resParse(res);
      }),
      map((body: RestResponseBody): AuthUserResponse => {
        const isOK: boolean = body.isOK;

        return {
          isOK: isOK,
          user: isOK ? body.data.obj : null,
        };
      }),
    );
  }

  //
  public authLogin(
    email: string,
    password: string,
  ): Observable<AuthLoginResponse> {
    return httpPost<RestResponseBody>(URL_PATH.auth_login, {
      email,
      password,
    }).pipe(
      map((res: HttpResponse<RestResponseBody>): RestResponseBody => {
        return resParse(res);
      }),
      map((body: RestResponseBody): AuthLoginResponse => {
        const isOK: boolean = body.isOK;

        return {
          isOK: isOK,
          user: isOK ? body.data.obj : null,
          token: isOK ? body.data.token : undefined,
          message: isOK ? null : body.message,
        };
      }),
    );
  }

  //
  public authLogout(token: string): Observable<AuthSimpleResponse> {
    return httpPost<RestResponseBody>(
      URL_PATH.auth_logout,
      {},
      { header: { Authorization: `Bearer ${token}` } },
    ).pipe(
      map((res: HttpResponse<RestResponseBody>): RestResponseBody => {
        return resParse(res);
      }),
      map((body: RestResponseBody): AuthSimpleResponse => {
        const isOK: boolean = body.isOK;

        return {
          isOK: isOK,
          message: body.message,
        };
      }),
    );
  }

  // modify auth password
  public authPassword(
    oldPassword: string,
    newPassword: string,
    token: string,
  ): Observable<AuthSimpleResponse> {
    return httpPost<RestResponseBody>(
      URL_PATH.auth_password,
      { oldPassword, newPassword },
      { header: { Authorization: `Bearer ${token}` } },
    ).pipe(
      map((res: HttpResponse<RestResponseBody>): RestResponseBody => {
        return resParse(res);
      }),
      map((body: RestResponseBody): AuthSimpleResponse => {
        const isOK: boolean = body.isOK;

        return {
          isOK: isOK,
          message: body.message,
        };
      }),
    );
  }

  //
}

export const restService = new RestService();
