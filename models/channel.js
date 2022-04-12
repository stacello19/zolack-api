const Sequelize = require('sequelize');

const Channel = class Channel extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      channel_name: {
        type: Sequelize.STRING(50)
      },
    }, {
      sequelize,
      modelName: 'Channel',
      timestamps: false
    })
  }
}

module.exports = Channel;