class SongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;

    const songId = await this.service.addSong({
      title, year, performer, genre, duration, albumId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    let songs;
    const { title = '', performer = '' } = request.query;
    songs = await this.service.getSongs();
    if (title !== '' && performer !== '') {
      songs = songs.filter((a) => (
        a.title.toLowerCase().includes(title.toLowerCase())
        && a.performer.toLowerCase().includes(performer.toLowerCase())
      ));
    } else if (title !== '' || performer !== '') {
      const srch = title + performer;
      songs = songs.filter((a) => (
        a.title.toLowerCase().includes(srch.toLowerCase())
        || a.performer.toLowerCase().includes(srch.toLowerCase())
      ));
    }
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this.service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, performer, genre, duration, albumId,
    } = request.payload;
    const { id } = request.params;

    await this.service.editSongById(id, {
      title, year, performer, genre, duration, albumId,
    });

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
