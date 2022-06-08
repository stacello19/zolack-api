const { redisClient } = require('../redis');

const sendMessage = async (channel, data) => {
  try {
    await redisClient.rPush(channel, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  sendMessage
}