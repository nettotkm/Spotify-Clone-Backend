const express = require('express');
const mongoose = require('mongoose');
const Music = require('../models/Music');
const Album = require('../models/Album');
const User = require('../models/User');

const musicRoutes = express.Router();

musicRoutes.get('/music', (req, res, next) => {
  Music.find()
    .then((musicFromDB) => {
      res.status(200).json(musicFromDB);
    })
    .catch(err => next(err));
});

musicRoutes.post('/music/create/:albumId', (req, res, next) => {
  const {
    name, duration, format, quality, audioUrl,
  } = req.body;

  const newMusic = new Music({
    name,
    duration,
    format,
    quality,
    audioUrl,
    album: req.params.albumId,
    // artist: req.params.artistId,
  });
  newMusic.save()
    .then(() => {
      Album.findOneAndUpdate({ _id: req.params.albumId }, { $push: { musics: newMusic._id} })
        .then(() => {
          res.status(200).json('new music created');
        })
        .catch((err) => {
          throw new Error(err);
        });
    })
    .catch(err => next(err));
});

musicRoutes.put('/music/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }

  Music.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: ` ${req.params.id} is updated successfully.` });
    })
    .catch((err) => {
      res.json(err);
    });
});

// include CLOUDINARY:
const uploader = require('../configs/cloudinary-setup');

musicRoutes.post('/music/upload', uploader.single('audioUrl'), (req, res, next) => {
  // console.log('file is: ', req.file)

  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }

  res.json({ secure_url: req.file.secure_url });
});

musicRoutes.get('/music/delete/:id', (req, res, next) => {
  const musicDel = req.params.id;
  // Album.deleteOne({ musics: musicDel })
  // .then(() => {
  Music.findByIdAndDelete(musicDel)
    .then(() => {
      res.status(200).json(' music deleted');
    })
    .catch((err) => {
      throw new Error(err);
    });
  // })
  // .catch((err) => {
  //   throw new Error(err);
  // });
});

musicRoutes.get('/music/:userId', (req, res, next) => {
  const user = req.params.userId;
  User.findById(user)
    .populate('albums')
    .then((userFromDB) => {
      console.log(userFromDB);
      res.status(200).json(userFromDB);
    })
    .catch(err => next(err));
});

module.exports = musicRoutes;
