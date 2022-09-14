const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapSongDetailDBToModel, mapSongDBToModel } = require('../utils/mapDBToModel');

class SongService {
  constructor() {
    /* eslint no-underscore-dangle: 0 */
    this._pool = new Pool();
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      command: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURN id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result;
  }

  async getSongs({ title, performer }) {
    let condition;

    if (title && performer) {
      condition = ` WHERE title like %${title}% AND performer like %${performer}%`;
    } else if (title) {
      condition = ` WHERE title like %${title}%`;
    } else if (performer) {
      condition = ` WHERE performer like %${performer}%`;
    }

    const command = `SELECT id, title, year, genre, performer, duration, albumId FROM songs${condition || ''}`;
    const result = await this._pool.query(command);

    return result.rows.map(mapSongDBToModel);
  }

  async getSongById(id) {
    const query = {
      command: 'SELECT id, title, year, genre, performer, duration, albumId FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongDetailDBToModel)[0];
  }

  async editSong(id, {
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const query = {
      command: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumId = $6 WHERE id = $7',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
  }

  async deleteSong(id) {
    const query = {
      command: 'DELETE FROM songs WHERE id = $1',
      values: [id],
    };

    const result = this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongService;
