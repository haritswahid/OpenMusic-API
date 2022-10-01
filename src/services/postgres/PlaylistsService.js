const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelPlaylists } = require('../../utils');

class PlaylistsService {
  constructor() {
    this.pool = new Pool();
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT users.username,playlists.* FROM users JOIN playlists ON users.id = playlists.owner WHERE owner = $1',
      values: [owner],
    };
    const result = await this.pool.query(query);
    return result.rows.map(mapDBToModelPlaylists);
  }

  // async getPlaylistById(id) {
  //   const query = {
  //     text: 'SELECT * FROM playlists WHERE id = $1',
  //     values: [id],
  //   };
  //   const result = await this.pool.query(query);

  //   if (!result.rows.length) {
  //     throw new NotFoundError('Playlist tidak ditemukan');
  //   }

  //   return result.rows.map(mapDBToModelPlaylists)[0];
  // }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist({
    songId, playlistId,
  }) {
    await this.verifySongExist(songId);
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_song VALUES($1, $2, $3) RETURNING id',
      values: [id, songId, playlistId],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke Playlist');
    }

    return result.rows[0].id;
  }

  async verifySongExist(songId) {
    const query = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this.pool.query(query);

    if (result.rows.length === 0) {
      throw new NotFoundError('Gagal menambahkan lagu. lagu tidak ditemukan.');
    }
  }

  async getSongsPlaylist(id) {
    const query = {
      text: 'SELECT users.username,playlists.* FROM users JOIN playlists ON users.id = playlists.owner WHERE playlists.id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const query2 = {
      text: `SELECT s.id,s.title,s.performer FROM playlists p 
              LEFT JOIN playlist_song ps ON p.id = ps.playlist_id
              LEFT JOIN songs s ON s.id = ps.song_id
              WHERE p.id = $1`,
      values: [id],
    };
    const result2 = await this.pool.query(query2);

    return { ...result.rows.map(mapDBToModelPlaylists)[0], songs: result2.rows };
  }

  async deleteSongPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_song WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Data tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
