/**
 * Request body for user login.
 * Maps to: TodoList.Application.Features.Auth.Commands.LoginUser.LoginUserCommand
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Response from the login endpoint.
 * The backend returns: { token: string }
 */
export interface LoginResponse {
  token: string;
}

/**
 * Request body for user registration.
 * Maps to: TodoList.Application.Features.Auth.Commands.RegisterUser.RegisterUserCommand
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * Response from the register endpoint.
 * The backend returns: { id: string (GUID) }
 */
export interface RegisterResponse {
  id: string;
}

/**
 * Decoded JWT payload — contains user information embedded in the token.
 * Standard JWT claims + custom claims from our backend.
 */
export interface JwtPayload {
  sub: string;       // User ID (GUID)
  email: string;     // User email
  jti: string;       // Unique token identifier
  exp: number;       // Expiry timestamp (Unix seconds)
  iat: number;       // Issued at timestamp
}
