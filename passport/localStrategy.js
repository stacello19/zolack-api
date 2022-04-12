const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

module.exports =  () => {
  passport.use(new LocalStrategy(async function(username, password, done) {
      try {
        const foundUser = await User.findOne({ where: { username } });
        if (!foundUser) return done(null, false);
        if (foundUser.password !== password) return done(null, false);
        return done(null, foundUser);
      } catch(err) {
        return done(err);
      }
  }))
};