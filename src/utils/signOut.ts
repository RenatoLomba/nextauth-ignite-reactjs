import Router from 'next/router';
import { destroyCookie } from 'nookies';
import { authChannel } from './authChannel';

function signOut() {
  destroyCookie(null, '@nextauth.token');
  destroyCookie(null, '@nextauth.refreshToken');

  authChannel?.postMessage('signOut');

  Router.push('/');
}

export { signOut };
