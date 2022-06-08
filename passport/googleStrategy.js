const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/user');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

module.exports = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5050/auth/google/redirect',
      },
      async function(req, accessToken, refreshToken, profile, done) {
        try {
          console.log('Google passport user data: ', profile);
          const [user, created] = await User.findOrCreate({ 
            where: { username: `${profile.displayName}:${profile.id}` },
            defaults: {
              firstName: profile.given_name,
              lastName: profile.family_name,
              username: `${profile.displayName}:${profile.id}`,
            }
          })
          return done(null, user);
        } catch(err) {
          done(err, null);
        }
      }
  ))
}
