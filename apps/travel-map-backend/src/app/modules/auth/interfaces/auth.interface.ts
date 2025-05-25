export interface JwtPayload {
  sub: string
  email: string
  iat?: number
  exp?: number
}

export interface AuthResponse {
  user: any
  access_token: string
  refresh_token: string
}

export interface GoogleUser {
  email: string
  firstName: string
  lastName: string
  googleId: string
  avatar?: string
  provider: string
}
