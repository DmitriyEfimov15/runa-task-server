import type { Request } from 'express';

export type TResquestWithTokens = Request & {
  cookies: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export const AuthToken = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
