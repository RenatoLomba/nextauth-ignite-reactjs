import React, { createContext, FC, useEffect, useState } from 'react';
import Router from 'next/router';
import { setCookie, parseCookies } from 'nookies';

import { api } from '../services/apiClient';
import { signOut } from '../utils/signOut';
import { authChannel } from '../utils/authChannel';

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};

type SessionsResponse = {
  token: string;
  permissions: string[];
  refreshToken: string;
  roles: string[];
};

type MeResponse = Omit<SessionsResponse, 'token' | 'refreshToken'> & {
  email: string;
};

const AuthContext = createContext({} as AuthContextData);

const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const {
        data: { permissions, roles, token, refreshToken },
      } = await api.post<SessionsResponse>('sessions', { email, password });

      setCookie(null, '@nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setCookie(null, '@nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      setUser({ permissions, roles, email });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err) {
      console.log(err.response?.data?.message || err.message);
    }
  }

  useEffect(() => {
    authChannel.onmessage = (message) => {
      switch (message.data) {
        case 'signOut':
          signOut();
          break;
      }
    };
  }, []);

  useEffect(() => {
    const { '@nextauth.token': token } = parseCookies();

    if (token) {
      api
        .get<MeResponse>('/me')
        .then(({ data }) => {
          const { email, permissions, roles } = data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          signOut();
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
