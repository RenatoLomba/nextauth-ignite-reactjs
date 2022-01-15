import axios, { AxiosResponse, AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../utils/signOut';
import { AuthTokenError } from './errors/AuthTokenError';

type FailedRequestQueue = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestsQueue: FailedRequestQueue[] = [];

function setupAPIClient(ctx?: GetServerSidePropsContext) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['@nextauth.token']}`,
    },
  });

  const isTokenExpiredError = (error: AxiosError) =>
    error.response?.data?.code === 'token.expired';

  const isUnauthorizedError = (error: AxiosError) =>
    error.response?.status === 401;

  type RefreshResponse = {
    token: string;
    refreshToken: string;
  };

  const onRejected = (error: AxiosError) => {
    if (isUnauthorizedError(error)) {
      if (isTokenExpiredError(error)) {
        cookies = parseCookies(ctx);

        const { '@nextauth.refreshToken': refreshToken } = cookies;
        const originalConfig = error.config;

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post<RefreshResponse>('/refresh', { refreshToken })
            .then(({ data }) => {
              const { token, refreshToken: newRefreshToken } = data;

              setCookie(ctx, '@nextauth.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
              });

              setCookie(ctx, '@nextauth.refreshToken', newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
              });

              api.defaults.headers['Authorization'] = `Bearer ${token}`;

              failedRequestsQueue.forEach((req) => req.onSuccess(token));
              failedRequestsQueue = [];
            })
            .catch((err) => {
              failedRequestsQueue.forEach((req) => req.onFailure(err));
              failedRequestsQueue = [];

              if (process.browser) {
                signOut();
              }
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (token: string) => {
              originalConfig.headers['Authorization'] = `Bearer ${token}`;

              resolve(api(originalConfig));
            },
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        if (process.browser) {
          signOut();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }
    }

    return Promise.reject(error);
  };

  const onFulfilled = (res: AxiosResponse) => res;

  api.interceptors.response.use(onFulfilled, onRejected);

  return api;
}

export { setupAPIClient };
