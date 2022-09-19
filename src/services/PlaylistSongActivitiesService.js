const { Pool } = require('pg');
const { nanoid } = require('nanoid');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  addPlaylistSongActivities(playlistId, songId, userId, action) {
    const id = `psa-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5)',
      values: [id, playlistId, songId, userId, action],
    };
    this._pool.query(query);
  }

  async getPlaylistActivitiesById(playlistId) {
    const query = {
      text: 'SELECT username, title, action, time FROM playlist_song_activities psa JOIN users u ON u.id = psa.user_id JOIN songs s ON s.id = psa.song_id WHERE playlist_id = $1',
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
