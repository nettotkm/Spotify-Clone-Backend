const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  musics: [{ type: Schema.Types.ObjectId, ref: 'Music' }],
  artist: { type: Schema.Types.ObjectId, ref: 'User' },
  imageAlbum: String,
  description: String,
});

const Album = mongoose.model('Album', userSchema);

module.exports = Album;
