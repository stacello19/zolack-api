const jwt = require("jsonwebtoken");
const schedule = require('node-schedule');
const { Op } = require("sequelize");

const RefreshToken = require('../models/refreshToken');

const generateToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN, { expiresIn: '30m' });
};

const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  const token = authorization && authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return next(err);
    req.user = user;
    next();
  })
}

const create30minExpiryDate = () => new Date(new Date().getTime() + (30 * 60000));

const refreshTokenCleanupSchedule = (userId) => {
  const thirdFiveMinSchedule = new Date().getTime() + (35 * 60000);
  schedule.scheduleJob(thirdFiveMinSchedule, async () => {
    console.log('Refresh Token schedule check up executing!');
    try {
      await RefreshToken.destroy({ where: { expiryDate: { [Op.lt]: new Date() }, UserId: userId } });
    } catch(err) {
      console.error('Refresh Token clean up has failed... Please check the system');
    }
  });
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  create30minExpiryDate,
  refreshTokenCleanupSchedule
}