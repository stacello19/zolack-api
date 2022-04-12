const Sequelize = require('sequelize');

const User = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      firstName: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(40),
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(15),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'User',
      timestamps: true
    })
  }
}
module.exports = User;