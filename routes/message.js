const express = require('express');
const router = express.Router();
const { redisClient } = require('../redis');

// post upload
router.post('/upload/image', (req, res, next) => {

});

// chat data as an array with offset and page
router.get('/:channelId/chats', async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const msgData = await redisClient.lRange(`/ch-${channelId}`, 0, -1);
    const parsedMsgData = msgData.map(msg => JSON.parse(msg));

    res.send({
      code: 200,
      messages: parsedMsgData
    })
  } catch(err) {
    next(err);
  }
});

module.exports = router;