class PlaylistsHandler {
  constructor(playlistService, playlistSongService, songService, validator) {
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;
    this._validator = validator;
    this._songService = songService;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.getSongInPlaylistHandler = this.getSongInPlaylistHandler.bind(this);
    this.deleteSongInPlaylistHandler = this.deleteSongInPlaylistHandler.bind(this);
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistService.addPlaylist(credentialId, request.payload);

    return h.response({
      status: 'success',
      data: { playlistId },
    }).code(201);
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePlaylistSongsPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this._playlistService.verifyCollaboratorPlaylist(id, credentialId);
    await this._songService.verifySongExist(request.payload);

    await this._playlistSongService.addSongToPlaylist(id, request.payload);
    return h.response({
      status: 'success',
      message: 'Berhasil memasukan lagu kedalam playlists',
    }).code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: { playlists },
    };
  }

  async getSongInPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._playlistService.verifyCollaboratorPlaylist(id, credentialId);
    const playlist = await this._playlistSongService.getSongsInPlaylistById(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._playlistService.verifyOwnerPlaylist(id, credentialId);
    await this._playlistService.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async deleteSongInPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;
    await this._playlistService.verifyCollaboratorPlaylist(id, credentialId);
    await this._playlistSongService.deleteSongInPlaylistById(id, request.payload);
    return {
      status: 'success',
      message: 'Berhasil menghapus lagu dari playlist',
    };
  }
}

module.exports = PlaylistsHandler;
