import { GetServerSideProps } from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import decode from 'jwt-decode';

import { AuthTokenError } from '../services/errors/AuthTokenError';
import { validateUserPermissions } from './validateUserPermissions';

type TokenInfo = {
  permissions: string[];
  roles: string[];
  sub: string;
};

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
};

function withSSRAuth(fn: GetServerSideProps, options?: WithSSRAuthOptions) {
  const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { '@nextauth.token': token } = parseCookies(ctx);

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    if (options) {
      const { permissions, roles } = options;
      const tokenInfo = decode<TokenInfo>(token);

      const userHasValidPermissions = validateUserPermissions({
        user: { ...tokenInfo },
        roles,
        permissions,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      const isAuthTokenError = err instanceof AuthTokenError;

      if (isAuthTokenError) {
        destroyCookie(ctx, '@nextauth.token');
        destroyCookie(ctx, '@nextauth.refreshToken');

        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    }
  };

  return getServerSideProps;
}

export { withSSRAuth };
