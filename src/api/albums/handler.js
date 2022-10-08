// import autoBind from 'auto-bind';

class AlbumsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name = 'untitled', year } = request.payload;

    const albumId = await this.service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  async getAlbumsHandler() {
    const albums = await this.service.getAlbums();
    return {
      status: 'success',
      data: {
        albums,
      },
    };
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this.service.getAlbumById(id);
    if (album.coverUrl) album.coverUrl = `http://${process.env.HOST}:${process.env.PORT}/albums/cover/${album.coverUrl}`;
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    await this.service.editAlbumById(id, { name, year });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this.service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postCoverAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const { cover } = request.payload;
    console.log(cover.hapi.filename);
    this.validator.validateImageHeaders(cover.hapi.headers);
    await this.service.editCoverAlbumById(id, { cover });
    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }

  async postLikeAlbum(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const result = await this.service.addLikeAlbum({ albumId: id, userId: credentialId });

    const response = h.response({
      status: 'success',
      message: `Berhasil ${result}`,
    });
    response.code(201);
    return response;
  }

  async getLikeAlbum(request, h) {
    const { id } = request.params;
    const { cache, like } = await this.service.getLikeAlbum(id);
    const response = h.response({
      status: 'success',
      data: {
        likes: parseInt(like, 10),
      },
    });
    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  }
}

module.exports = AlbumsHandler;
