const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  image: String,
  Album: [{ type: Schema.Types.ObjectId, ref: 'Album' }],
  profile: { type: String, default: '2' },
});

const Artist = mongoose.model('Artist', userSchema);

module.exports = Artist;
