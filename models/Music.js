

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  duration: String,
  format: String,
  quality: { type: String, enum: ['Great', 'Good', 'Bad'] },
  album: [{ type: Schema.Types.ObjectId, ref: 'Album' }],
  audioUrl: { type: String, required: true },
});

const Music = mongoose.model('Music', userSchema);

module.exports = Music;
