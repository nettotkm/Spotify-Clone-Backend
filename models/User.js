const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  artistName: String,
  email: { type: String, required: true },
  image: String,
  albums: [{ type: Schema.Types.ObjectId, ref: 'Album' }],
  role: { type: String, enum: ['User', 'Artist'], required: true },
  confirmationCode: String,
  active: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
