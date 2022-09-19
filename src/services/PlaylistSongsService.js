const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlaylist(playlistId, { songId }) {
    const id = `ps-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal menambah lagu ke playlist');
    }
  }

  async getSongsInPlaylistById(playlistId) {
    const queryPlaylist = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p JOIN users u ON u.id = p.owner WHERE p.id = $1',
      values: [playlistId],
    };
    const playlistResult = await this._pool.query(queryPlaylist);

    if (!playlistResult.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];

    const text = `SELECT ps.song_id as id, s.title, s.performer
      FROM playlist_songs ps 
      INNER JOIN songs s ON ps.song_id = s.id WHERE ps.playlist_id = $1`;

    const querySongs = {
      text,
      values: [playlist.id],
    };
    const songs = await this._pool.query(querySongs);
    playlist.songs = songs.rows;
    return playlist;
  }

  async deleteSongInPlaylistById(playlistId, { songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING id',
      values: [songId, playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Gagal hapus lagu dari playlist');
    }
  }
}

module.exports = PlaylistSongsService;
