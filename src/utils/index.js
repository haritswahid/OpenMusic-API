/* eslint-disable camelcase */
const mapDBToModelAlbums = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBToModelSongs = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToModelPlaylists = ({
  id,
  name,
  owner,
}) => ({
  id,
  name,
  owner,
});

module.exports = { mapDBToModelAlbums, mapDBToModelSongs, mapDBToModelPlaylists };
