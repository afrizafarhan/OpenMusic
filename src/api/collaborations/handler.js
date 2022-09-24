const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(playlistsService, collaborationsService, usersService, validator) {
    this._playlistService = playlistsService;
    this._collaborationsService = collaborationsService;
    this._usersService = usersService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistService.verifyOwnerPlaylist(playlistId, credentialId);
    await this._usersService.getUserbyId(userId);

    const collaborationId = await this._collaborationsService.addCollaborator(playlistId, userId);

    return h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    }).code(201);
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateCollaborationPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const { playlistId, userId } = request.payload;

    await this._playlistService.verifyOwnerPlaylist(playlistId, credentialId);
    await this._usersService.getUserbyId(userId);
    await this._collaborationsService.deleteCollaborator(playlistId, userId);
    return {
      status: 'success',
      message: 'Kolaborasi berhasi dihapus',
    };
  }
}

module.exports = CollaborationsHandler;
