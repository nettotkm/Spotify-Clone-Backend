const express = require('express');
const mongoose = require('mongoose');

const Album = require('../models/Album');
const User = require('../models/User');
const Music = require('../models/Music');

const albumRoutes = express.Router();

albumRoutes.get('/album/', (req, res, next) => {
  Album.find()
    .then((albumFromDB) => {
      res.status(200).json(albumFromDB);
    })
    .catch(err => next(err));
});

albumRoutes.post('/album/create/:artistId', (req, res, next) => {
  const {
    name, imageAlbum, description,
  } = req.body;
  console.log(req.body);
  const newAlbum = new Album({
    name,
    imageAlbum,
    description,
    artist: req.params.artistId,
  });

  newAlbum.save()
    .then(() => {
      User.findOneAndUpdate({ _id: req.params.artistId }, { $push: { albums: newAlbum._id } })
        .then(() => {
          res.status(200).json('new album created');
        })
        .catch((err) => {
          throw new Error(err);
        });

    })
    .catch(err => next(err));
});
// include CLOUDINARY:
const uploader = require('../configs/cloudinary-setup');

albumRoutes.post('/album/upload', uploader.single('imageAlbum'), (req, res, next) => {

  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }

  res.json({ secure_url: req.file.secure_url });
});

albumRoutes.get('/album/:id', (req, res, next) => {
  const album = req.params.id;
  Album.findById(album)
    .populate('musics')
    .populate('artist')
    .then((albumFromDB) => {
      console.log(albumFromDB);
      res.status(200).json(albumFromDB);
    })
    .catch(err => next(err));
});

albumRoutes.put('/album/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
  Album.findByIdAndUpdate(req.params.id, req.body)
    .then(() => {
      res.json({ message: ` ${req.params.id} is updated successfully.` });
    })
    .catch((err) => {
      res.json(err);
    });
});

albumRoutes.get('/album/delete/:id', (req, res, next) => {
  const albumDel = req.params.id;
  Album.findByIdAndDelete(albumDel)
    .then(() => {
      res.status(200).json(' album deleted');
    })
    .catch((err) => {
      throw new Error(err);
    });
});


module.exports = albumRoutes;
