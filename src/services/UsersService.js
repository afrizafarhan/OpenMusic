const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthenticationError = require('../exceptions/AuthenticationError');

class UsersService {
  constructor() {
    this._pool = new Pool();

    this.verifyUsernameExist = this.verifyUsernameExist.bind(this);
  }

  async addUser({ username, password, fullname }) {
    await this.verifyUsernameExist(username);
    const id = `user-${nanoid}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSER INTO users VALUES ($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async verifyUsernameExist(username) {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool(query);

    if (result.rowCount) {
      throw new InvariantError('Gagal menambah user. Username sudah digunakan.');
    }
  }

  async getUserbyId(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  async verifyUserCredential({ username, password }) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang diberikan salah');
    }
    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang diberikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
