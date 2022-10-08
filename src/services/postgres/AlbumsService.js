const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelAlbums } = require('../../utils');

class AlbumsService {
  constructor(storageService, cacheService) {
    this.pool = new Pool();
    this.storageService = storageService;
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums(id, name, year) VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this.pool.query('SELECT * FROM albums');
    return result.rows.map(mapDBToModelAlbums);
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const query2 = {
      text: 'SELECT id,title,performer FROM songs WHERE album_id = $1',
      values: [id],
    };
    const result2 = await this.pool.query(query2);

    return { ...result.rows.map(mapDBToModelAlbums)[0], songs: result2.rows };
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async editCoverAlbumById(id, { cover }) {
    const coverName = await this.storageService.generateName(cover.hapi);
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [coverName, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
    const filename = await this.storageService.writeFile(cover, coverName);
    return filename;
  }

  async addLikeAlbum({ albumId, userId }) {
    let query2 = '';
    let action = '';

    const queryUser = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };
    const resultUser = await this.pool.query(queryUser);
    if (!resultUser.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [albumId],
    };
    const resultAlbum = await this.pool.query(queryAlbum);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const query = {
      text: 'SELECT id FROM likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId],
    };
    const result = await this.pool.query(query);

    if (!result.rows.length) {
      const id = `likes-${nanoid(16)}`;
      action = 'menyukai album';
      query2 = {
        text: 'INSERT INTO likes VALUES($1, $2, $3)',
        values: [id, albumId, userId],
      };
    } else {
      action = 'membatalkan suka pada album';
      query2 = {
        text: 'DELETE FROM likes WHERE id = $1',
        values: [result.rows[0].id],
      };
    }

    await this.pool.query(query2);
    await this.cacheService.delete(`likes:${albumId}`);
    return action;
  }

  async getLikeAlbum(id) {
    try {
      const result = await this.cacheService.get(`likes:${id}`);
      return { cache: true, like: JSON.parse(result) };
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albums WHERE id = $1',
        values: [id],
      };
      const result = await this.pool.query(query);
      if (!result.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      const query2 = {
        text: 'SELECT COUNT(id) like FROM likes WHERE album_id = $1',
        values: [id],
      };
      const result2 = await this.pool.query(query2);
      await this.cacheService.set(`likes:${id}`, JSON.stringify(result2.rows[0].like));

      return { cache: false, like: result2.rows[0].like };
    }
  }
}

module.exports = AlbumsService;
