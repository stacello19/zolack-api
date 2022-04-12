const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const User = require('./user');
const RefreshToken = require('./refreshToken');
const Channel = require('./channel');
const Member = require('./member');

const db = {}
const sequelize = new Sequelize(
  config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.User = User;
db.RefreshToken = RefreshToken;
db.Channel = Channel;
db.Member = Member;

User.init(sequelize);
RefreshToken.init(sequelize);
Channel.init(sequelize);
Member.init(sequelize);

// associations
User.hasMany(RefreshToken);  // UserId
RefreshToken.belongsTo(User);

User.hasMany(Channel, { foreignKey: 'goalieId' });
Channel.belongsTo(User, { foreignKey: 'goalieId' });

Channel.hasMany(Member); // ChannelId
Member.belongsTo(Channel);

User.hasOne(Member); // UserId
Member.belongsTo(User);

const connect = () => db.sequelize.sync({ force: false })
                                  .then(() => console.log('Database is connected!'))
                                  .catch((err) => console.error(err));

module.exports = connect;