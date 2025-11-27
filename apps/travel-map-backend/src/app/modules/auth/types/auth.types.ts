export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  message: string;
}

export interface LoginResponse extends AuthTokens {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
}

