class AuthTokenError extends Error {
  constructor() {
    super('Authenticate token error.');
  }
}

export { AuthTokenError };
