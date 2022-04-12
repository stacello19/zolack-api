const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const dbConnect = require('./models');
const passportConfig = require('./passport');
require('dotenv').config();

// routes
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const channelRouter = require('./routes/channel');

const { SESSION_COOKIE_SECRET, PORT, NODE_ENV } = process.env;

dbConnect();
passportConfig();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(SESSION_COOKIE_SECRET));
app.use(session({
  secret: SESSION_COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production',
  },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/channel', channelRouter);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.send({
    code: 500,
    error: err.toString()
  })
});

app.listen(PORT, () => {
  console.log(`Zolack api is running on port ${PORT}`)
});