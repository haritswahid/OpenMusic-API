const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this.producerService = producerService;
    this.playlistsService = playlistsService;
    this.validator = validator;

    this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    try {
      this.validator.validateExportPlaylistPayload(request.payload);
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this.playlistsService.verifyPlaylistOwner(id, credentialId);

      const message = {
        playlistId: id,
        targetEmail: request.payload.targetEmail,
      };

      await this.producerService.sendMessage('export:playlists', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;