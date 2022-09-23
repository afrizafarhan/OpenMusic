const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(exportService, playlistsService, validator) {
    this._exportsService = exportService;
    this._validator = validator;
    this._playlistService = playlistsService;

    autoBind(this);
  }

  async postExportHandler(request, h) {
    this._validator.validateExportPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._playlistService.verifyOwnerPlaylist(playlistId, credentialId);
    const message = {
      userId: credentialId,
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._exportsService.sendMessage('export:songs', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(201);
  }
}

module.exports = ExportsHandler;
