const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, validator) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._service.addAlbum(request.payload);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    album.coverUrl = album.coverUrl ? `http://${process.env.HOST}:${process.env.PORT}/public/images/${album.coverUrl}` : album.coverUrl;
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateAlbumCoverPayload(cover.hapi.headers);
    const fileLocation = await this._storageService.writeFile(cover, cover.hapi);
    await this._service.addAlbumCoverById(request.params.id, fileLocation);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }

  async getTotalLikeAlbumByIdHandler(request) {
    const likes = await this._service.getTotalLikeAlbumById(request.params.id);
    return {
      status: 'success',
      data: {
        likes,
      },
    };
  }

  async postAlbumUserLikeByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    await this._service.getAlbumById(playlistId);
    const isLiked = await this._service.verifyUserAlbumLike(playlistId, credentialId);
    let message;
    if (!isLiked) {
      await this._service.addAlbumLikeById(playlistId, credentialId);
      message = 'Berhasil menambah like album';
    } else {
      await this._service.deleteAlbumLikeById(playlistId, credentialId);
      message = 'Berhasi menghapus like album';
    }
    return h.response({
      status: 'success',
      message,
    }).code(201);
  }
}

module.exports = AlbumsHandler;
