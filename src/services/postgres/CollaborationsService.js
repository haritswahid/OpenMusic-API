const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CollaborationsService {
  constructor() {
    this.pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    await this.verifyUserExist(userId);
    await this.verifyPlaylistExist(playlistId);
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  async verifyCollaborator(playlistId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlistId, userId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }

  async verifyUserExist(userId) {
    const query = {
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal menambahkan kolaborator. user tidak ditemukan.');
    }
  }

  async verifyPlaylistExist(playlistId) {
    const query = {
      text: 'SELECT id FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal menambahkan kolaborator. playlist tidak ditemukan.');
    }
  }
}

module.exports = CollaborationsService;
