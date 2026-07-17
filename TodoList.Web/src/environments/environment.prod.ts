/// <summary>
/// Production environment configuration.
/// Uses a relative URL — assumes a reverse proxy routes /api to the backend.
/// </summary>
export const environment = {
  production: true,
  apiUrl: '/api/v1'
};
