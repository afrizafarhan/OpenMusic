class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this._authenticationsService = authenticationsService;
    this._usersService = usersService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this._validator.validatePostAuthenticationPayload(request.payload);
    const id = await this._usersService.verifyUserCredential(request.payload);

    const accessToken = await this._tokenManager.generateAccessToken({ id });
    const refreshToken = await this._tokenManager.generateRefreshToken({ id });

    await this._authenticationsService.addRefreshToken(accessToken, refreshToken);

    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    this._validator.validateTokenAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this._authenticationsService.verifyUserCredential(refreshToken);

    const id = await this._tokenManager.verifyRefreshToken(refreshToken);

    const accessToken = await this._tokenManager.generateAccessToken(id);
    return {
      status: 'success',
      data: { accessToken },
    };
  }

  async deleteAuthenticationHandler(request) {
    this._validator.validateTokenAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this._authenticationsService(refreshToken);
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}

module.exports = AuthenticationsHandler;
