const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(service, storageService, validator, cacheService) {
    this._service = service;
    this._validator = validator;
    this._storageService = storageService;
    this._cacheservice = cacheService;
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

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    let album = await this._cacheservice.get(`albums:${id}`);
    if (album === null) {
      album = await this._service.getAlbumById(id);
      album.coverUrl = album.coverUrl ? `http://${process.env.HOST}:${process.env.PORT}/public/images/${album.coverUrl}` : album.coverUrl;
      this._cacheservice.set(`albums:${id}`, JSON.stringify(album));
      return h.response({
        status: 'success',
        data: {
          album,
        },
      });
    }
    return h.response({
      status: 'success',
      data: {
        album: JSON.parse(album),
      },
    }).header('X-Data-Source', 'cache');
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);
    this._cacheservice.delete(`albums:${id}`);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    this._cacheservice.delete(`albums:${id}`);

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
    this._cacheservice.delete(`albums:${request.params.id}`);

    return h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
  }

  async getTotalLikeAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;
    let likes = await this._cacheservice.get(`likes:${albumId}`);
    if (likes === null) {
      likes = await this._service.getTotalLikeAlbumById(albumId);
      this._cacheservice.set(`likes:${albumId}`, likes);
      return h.response({
        status: 'success',
        data: {
          likes,
        },
      });
    }

    return h.response({
      status: 'success',
      data: {
        likes: parseInt(likes, 10),
      },
    }).header('X-Data-Source', 'cache');
  }

  async postAlbumUserLikeByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;
    await this._service.getAlbumById(albumId);
    const isLiked = await this._service.verifyUserAlbumLike(albumId, credentialId);
    let message;
    if (!isLiked) {
      await this._service.addAlbumLikeById(albumId, credentialId);
      message = 'Berhasil menambah like album';
    } else {
      await this._service.deleteAlbumLikeById(albumId, credentialId);
      message = 'Berhasi menghapus like album';
    }
    this._cacheservice.delete(`likes:${albumId}`);
    return h.response({
      status: 'success',
      message,
    }).code(201);
  }
}

module.exports = AlbumsHandler;
