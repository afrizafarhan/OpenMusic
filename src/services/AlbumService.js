const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const { mapAlbumDBToModel } = require('../utils/mapDBToModel');

class AlbumService {
  constructor() {
    /* eslint no-underscore-dangle: 0 */
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      command: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result;
  }

  async getAlbumById(id) {
    const query = {
      command: 'SELECT id, name, year FROM albums WHERE id = $1',
      values: [id],
    };

    const querySong = {
      command: 'SELECT id, title, performer FROM songs WHERE id = $1',
      values: [id],
    }

    const result = await this._pool.query(query);
    
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }
    
    const songs = await this._pool.query(querySong);

    return result.rows.map(mapAlbumDBToModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();

    const query = {
      command: 'UPDATE albums SET name = $1, year = $2 updatedAt = $3 WHERE id = $4',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      command: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = AlbumService;
