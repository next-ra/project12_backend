const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const config = require('../config');
const { usersRes } = require('../libs/messages');

const createUser = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then(hash =>
      User.create({
        name: req.body.name,
        about: req.body.about,
        avatar: req.body.avatar,
        email: req.body.email,
        password: hash
      })
    )
    .then(user =>
      res.status(201).send({
        message: usersRes.userCreated,
        _id: user._id,
        name: user.name,
        email: user.email
      })
    )
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then(user => {
      const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
        expiresIn: '7d'
      });
      res.cookie('jwt', token, {
        maxAge: 3600000,
        httpOnly: true,
        sameSite: true
      });
      res.status(200).send({ message: usersRes.login });
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then(users => {
      if (users.length === 0) {
        res.send({ message: usersRes.emptyDb });
      } else res.send({ data: users });
    })

    .catch(next);
};

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then(user => {
      if (!user) {
        next();
      } else res.json({ data: user });
    })
    .catch(next);
};

const deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.userId)
    .then(user => {
      if (!user) {
        next();
      } else
        res.json({
          message: usersRes.userDeleted
        });
    })
    .catch(err => res.send(err));
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      about: req.body.about
    },
    { runValidators: true, new: true }
  )
    .then(user => {
      if (!user) {
        next();
      } else res.send({ message: usersRes.userUpdated, data: user });
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.body.avatar },
    { runValidators: true, new: true }
  )
    .then(user => {
      if (!user) {
        next();
      } else res.send({ message: usersRes.avatarUpdated, data: user });
    })
    .catch(next);
};

module.exports = {
  createUser,
  login,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  updateAvatar
};
