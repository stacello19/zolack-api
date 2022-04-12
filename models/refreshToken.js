const Sequelize = require('sequelize');

const RefreshToken = class RefreshToken extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      token: {
        type: Sequelize.TEXT
      },
      expiryDate: {
        type: Sequelize.DATE,
      },
    }, {
      sequelize,
      modelName: 'RefreshToken',
      timestamps: false
    })
  }
}

module.exports = RefreshToken;