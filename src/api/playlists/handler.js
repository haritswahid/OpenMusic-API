class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongByPlaylistIdHandler = this.postSongByPlaylistIdHandler.bind(this);
    this.getSongsByPlaylistIdHandler = this.getSongsByPlaylistIdHandler.bind(this);
    this.deleteSongFromPlaylistByIdHandler = this.deleteSongFromPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesByIdHandler = this.getPlaylistActivitiesByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this.service.addPlaylist({
      name, owner: credentialId,
    });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongByPlaylistIdHandler(request, h) {
    this.validator.validateSongPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const playlistSongId = await this.service.addSongToPlaylist({
      songId, playlistId: id, userId: credentialId,
    });
    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke Playlist',
      data: {
        playlistSongId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsByPlaylistIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this.service.getSongsPlaylist(id);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this.validator.validateSongPlaylistPayload(request.payload);
    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.deleteSongPlaylist(id, songId, credentialId);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari Playlist',
    };
  }

  async getPlaylistActivitiesByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.verifyPlaylistOwner(id, credentialId);
    const playlist = await this.service.getPlaylistActivities(id);
    return {
      status: 'success',
      data: {
        ...playlist,
      },
    };
  }
}

module.exports = PlaylistsHandler;
