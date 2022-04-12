const passport = require('passport');
const User = require('../models/user');
const local = require('./localStrategy');

module.exports = () => {
  passport.serializeUser((user, done) => {
    // serializing the user a.k.a storing the userId to req.session.passport.user
    console.log('Serializing the user');
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      // saving user into req.user
      console.log('Deserializing the user');
      const foundUser = await User.findOne({ where: { id }});
      done(null, foundUser);
    } catch(err) {
      done(err);
    }
  });

  local();
}