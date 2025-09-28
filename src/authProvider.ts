import type { AuthProvider, AuthActionResponse } from "@refinedev/core";
import { restService } from "./service/rest.service.ts";
import { firstValueFrom } from "rxjs";
import { map, tap } from "rxjs/operators";
import { AUTH_TOKEN_STORAGE_NAME } from "./const.ts";
import { AdminUser } from "./service/types.ts";
import { getDefaultStore } from "jotai";
import { S } from "./state/global.ts";

export const authProvider: AuthProvider = {
  login: async ({ username, email, password }) => {
    if ((username || email) && password) {
      const login$ = restService.authLogin(email, password).pipe(
        tap((rs) => {
          if (rs.isOK && rs.token) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_NAME, rs.token);
            //
            const userStore = getDefaultStore();

            if (rs.user) {
              userStore.set(S.Auth.User, {
                id: rs.user.id,
                email: rs.user.email,
                permissions: rs.user.permissions || [],
              });
            }
          }
        }),
        map((rs): AuthActionResponse => {
          if (rs.isOK) {
            return {
              success: true,
              redirectTo: "/",
            };
          } else {
            return {
              success: false,
              error: {
                name: "LoginError",
                message: rs.message || "Invalid username or password",
              },
            };
          }
        }),
      );

      return await firstValueFrom(login$);
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    const token: string | null = localStorage.getItem(AUTH_TOKEN_STORAGE_NAME);

    if (!token) {
      return {
        success: true,
        redirectTo: "/login",
      };
    }

    const logout$ = restService.authLogout(token).pipe(
      map((rs) => {
        if (rs.isOK) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_NAME);
          //
          const userStore = getDefaultStore();
          //
          userStore.set(S.Auth.User, null);
          //
          return {
            success: true,
            redirectTo: "/login",
          };
        } else {
          return {
            success: false,
            error: {
              name: "LogoutError",
              message: "Logout failed",
            },
          };
        }
      }),
    );

    return await firstValueFrom(logout$);
  },
  check: async () => {
    const token: string | null = localStorage.getItem(AUTH_TOKEN_STORAGE_NAME);

    if (token) {
      const check$ = restService.authCurrentUser(token).pipe(
        map((rs) => {
          if (rs.isOK) {
            const userStore = getDefaultStore();
            //
            if (rs.user) {
              userStore.set(S.Auth.User, {
                id: rs.user.id,
                email: rs.user.email,
                permissions: rs.user.permissions || [],
              });
            }
            //
            return {
              authenticated: true,
            };
          } else {
            return {
              authenticated: false,
              redirectTo: "/login",
            };
          }
        }),
      );

      return await firstValueFrom(check$);
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const userStore = getDefaultStore();
    const userInfo: AdminUser | null = userStore.get(S.Auth.User);

    if (userInfo) {
      return userInfo.permissions;
    }

    return null;
  },
  getIdentity: async () => {
    const userStore = getDefaultStore();
    const userInfo: AdminUser | null = userStore.get(S.Auth.User);

    if (userInfo) {
      return {
        id: userInfo.id,
        name: userInfo.email,
        avatar: "https://i.pravatar.cc/300",
      };
    }

    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
