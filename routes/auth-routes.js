const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer');
const User = require('../models/User');
// const Artist = require('../models/Artist');
const authRoutes = express.Router();

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.PASSWORD,
  },
});

authRoutes.post('/signup', (req, res, next) => {
  const {
    username, password, artistName, email, image, role,
  } = req.body;
  console.log(req.body);
  if (!username || !password) {
    res.status(400).json({ message: 'Provide username and password' });
    return;
  }

  if (password.length < 7) {
    res.status(400).json({ message: 'Please make your password at least 8 characters long for security purposes.' });
    return;
  }

  User.findOne({ username }, (err, foundUser) => {
    if (err) {
      res.status(500).json({ message: 'Username check went bad.' });
      return;
    }

    if (foundUser) {
      res.status(400).json({ message: 'Username taken. Choose another one.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let confirmationCode = '';
    for (let i = 0; i < 25; i += 1) {
      confirmationCode += characters[Math.floor(Math.random() * characters.length)];
    }
    const aNewUser = new User({
      username,
      password: hashPass,
      artistName,
      email,
      image,
      role,
      confirmationCode,
    });

    aNewUser.save((error) => {
      // console.log(err);
      if (error) {
        res.status(400).json({ message: 'Saving user to database went wrong.' });
        return;
      }
      res.status(200).json(aNewUser);
      // res.redirect('/');
      // req.login(aNewUser, (err) => {
      //   if (err) {
      //     res.status(500).json({ message: 'Login after signup went bad.' });
      //     return;
      //   }
      // });

      if (email !== '') {
        transporter.sendMail({
          from: 'spotifyclone',
          to: email,
          subject: 'Confirmação de E-mail - Spotify Clone',
          text: 'Confirme seu e-mail, por favor!',
          html: `<b><a href=http://192.168.0.104:3000/spotify/confirm/${confirmationCode} + >Clique aqui para confirmar seu email</a></b>`,
        });
        console.log('enviando email');
      }
    });
  });
});

authRoutes.get('/spotify/confirm/:confirmationCode', (req, res) => {
  const { confirmationCode } = req.params;

  User.findOne({ confirmationCode })
    .then((event) => {
      console.log(event);
      if (event !== null) {
        User.updateOne({ confirmationCode }, { active: true })
          .then((response) => {
            console.log('teste');
            res.status(200).json({ message: 'Bem vindo!', response });
          });
        return;
      }
      console.log('code not ok');
    });
});

authRoutes.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, theUser, failureDetails) => {
    if (err) {
      res.status(500).json({ message: 'Something went wrong authenticating user' });
      return;
    }

    if (!theUser) {
      res.status(401).json(failureDetails);
      return;
    }

    // save user in session
    req.login(theUser, (err) => {
      if (err) {
        res.status(500).json({ message: 'Session save went bad.' });
        return;
      }

      res.status(200).json(theUser);
    });
  })(req, res, next);
});

authRoutes.put('/user/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
  const {
    username, password, artistName, email, image, role,
  } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashPass = bcrypt.hashSync(password, salt);

  const body = {
    username, password: hashPass, artistName, email, image, role,
  };

  User.findByIdAndUpdate(req.params.id, body)
    .then(() => {
      res.json({ message: ` ${req.params.id} is updated successfully.` });
    })
    .catch((err) => {
      res.json(err);
    });
});
const uploader = require('../configs/cloudinary-setup');

authRoutes.post('/user/upload', uploader.single('image'), (req, res, next) => {
  if (!req.file) {
    next(new Error('No file uploaded!'));
    return;
  }
  res.json({ secure_url: req.file.secure_url });
});

authRoutes.get('/logout', (req, res, next) => {
  req.logout(); // is defined by passport
  req.logout();
  res.status(200).json({ message: 'Log out success!' });
});


authRoutes.get('/loggedin', (req, res, next) => {
  req.isAuthenticated(); // is defined by passport
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
    return;
  }
  res.status(403).json({ message: 'Unauthorized' });
});

authRoutes.get('/user/delete/:id', (req, res, next) => {
  const userDel = req.params.id;
  User.findByIdAndDelete(userDel)
    .then(() => {
      res.status(200).json(' user deleted');
    })
    .catch((err) => {
      throw new Error(err);
    });
});

module.exports = authRoutes;
