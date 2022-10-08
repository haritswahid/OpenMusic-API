const Joi = require('joi');

// Album
const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

// Song
const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().required(),
  performer: Joi.string().required(),
  genre: Joi.string().required(),
  duration: Joi.number(),
  albumId: Joi.string(),
});

// User
const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string().required(),
});

// Authentication
const PostAuthenticationPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
const PutAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
const DeleteAuthenticationPayloadSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

// Playlist
const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
});
const PostSongPlaylistPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

// Collaboration
const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
});

// Exports
const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = {
  AlbumPayloadSchema,
  SongPayloadSchema,
  UserPayloadSchema,
  PostAuthenticationPayloadSchema,
  PutAuthenticationPayloadSchema,
  DeleteAuthenticationPayloadSchema,
  PostPlaylistPayloadSchema,
  PostSongPlaylistPayloadSchema,
  CollaborationPayloadSchema,
  ExportPlaylistsPayloadSchema,
};
