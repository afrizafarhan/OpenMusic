const mapAlbumDBToModel = ({
  id,
  name,
  year,
  cover,
}) => ({
  id,
  name,
  year,
  coverUrl: cover,
});
const mapSongDBToModel = ({ id, title, performer }) => ({ id, title, performer });
const mapSongDetailDBToModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

module.exports = { mapAlbumDBToModel, mapSongDBToModel, mapSongDetailDBToModel };
