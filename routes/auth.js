const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('passport');

const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');
const { generateToken, generateRefreshToken, create30minExpiryDate, refreshTokenCleanupSchedule } = require('./middlewares');

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(405).send({ message: 'User is not found!' });
    };

    req.logIn(user, async (err) => {
      if (err) return next(err);
      try {
        const userData = { firstName: user.firstName, lastName: user.lastName, username: user.username, password: user.password };
        // CREATE ACCESS TOKEN
        const accessToken = generateToken(userData);
        // CREATE REFRESH TOKEN
        const refreshToken = generateRefreshToken(userData);
        refreshTokenCleanupSchedule(user.id);
        await RefreshToken.create({ token: refreshToken, expiryDate: create30minExpiryDate(), UserId: user.id })

        return res.json({ accessToken, refreshToken });
      } catch(err) {
        return next(err);
      }
    })
  })(req, res, next);
});

router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, username, password } = req.body;
    if (firstName && lastName && username && password ) {
      const existUser = await User.findOne({ where: { username } })
      if (existUser) {
        return res.send({
          code: 403,
          message: 'This user already exists!'
        })
      }

      const newUser = await User.create({ firstName, lastName, username, password });
      const userData = { firstName: newUser.firstName, lastName: newUser.lastName, username: newUser.username, password: newUser.password };
      // CREATE ACCESS TOKEN
      const accessToken = generateToken(userData);
      // CREATE REFRESH TOKEN
      const refreshToken = generateRefreshToken(userData);
      refreshTokenCleanupSchedule(newUser.id);
      await RefreshToken.create({ token: refreshToken, expiryDate: create30minExpiryDate(), UserId: newUser.id })

      res.json({ accessToken, refreshToken });
    }
  } catch(err) {
    next(err);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    await RefreshToken.destroy({ where: { token: req.body.token, UserId: req.user.id } });
    res.send({ code: 204, message: 'Successfully logged out!' })
  } catch(err) {
    next(err);
  }
});

router.post('/token', async (req, res, next) => {
  const { token } = req.body;
  if (!token) return res.send({ code: 400, message: 'token is not found!' });

  const foundRefreshToken = await RefreshToken.findOne({ where: { token } });
  if (!foundRefreshToken) return res.send({ code: 403, message: 'Refresh token is not valid!' });

  jwt.verify(token, process.env.REFRESH_TOKEN, (err, user) => {
    if (err) return next(err);
    const accessToken = generateToken({ name: user.name, email: user.email, password: user.password });
    res.json({ accessToken });
  })
})

module.exports = router;