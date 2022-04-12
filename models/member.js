const Sequelize = require('sequelize');

const Member = class Member extends Sequelize.Model {
  static init(sequelize) {
    return super.init({}, {
      sequelize,
      modelName: 'Member',
      timestamps: false
    })
  }
}

module.exports = Member;