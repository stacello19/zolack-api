const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

const Channel = require('../models/channel');
const Member = require('../models/member');
const User = require('../models/user');

// all channels
router.get('/all', async (req, res, next) => {
  try {
    const myChannelsId = (await Member.findAll({ 
      where: { 
        UserId: req.user.id 
        },
        attributes: ["ChannelId"], 
      })).map(channel => channel.ChannelId);
    const myChannelsList = await Channel.findAll({ where: { [Op.or]: [{ id: [...myChannelsId] }, { goalieId: req.user.id }] } });
    const restChannelsList = await Channel.findAll({ where: { [Op.and] : [{ id: { [Op.not]: [...myChannelsId] } }, { goalieId: { [Op.not]: req.user.id } }] } });
    
    res.send({
      code: 200,
      myChannelsList,
      restChannelsList
    })
  } catch(err) {
    next(err);
  }
});

// channel information
router.get('/:channelId', async (req, res, next) => {
  try {
    const channelId = req.params.channelId;
    const currentChannelInfo = await Channel.findOne({ 
      where: { id: channelId },
      include: [{
        model: User,
        attributes: ["firstName", "lastName", "username"]
      }]
    });
    const currentMemberIds = (await Member.findAll({ where: { ChannelId: channelId }, attributes: ["UserId"]  })).map(member => member.UserId);
    const members = await User.findAll({ where: { id: [...currentMemberIds] }, attributes: ["firstName", "lastName"] });
    res.send({
      code: 200,
      channelInfo: currentChannelInfo,
      members
    })
  } catch(err) {
    next(err);
  }
});

// creating new channel
router.post('/new', async (req, res, next) => {
  try {
    const { channelName, userId } = req.body;
    await Channel.create({ channel_name: channelName, goalieId: userId });
    res.send({
      code: 200,
      message: 'Channel is successfully created!'
    })
  } catch(err) {
    next(err);
  }
});

// joining the channel
router.post('/join/:channelId', async (req, res, next) => {
  try {
    const { channelId } = req.params;
    await Member.create({ ChannelId: channelId, UserId: req.user.id });
    const channel = await Channel.findByPk(channelId, { attributes: ["channel_name"] });
    res.send({
      code: 200,
      channelName: channel.channel_name,
      user: `${req.user.firstName} ${req.user.lastName}`
    })
  } catch(err) {
    next(err);
  }
});

// leaving the channels
router.post('/exit/:channelId', async (req, res, next) => {
  try {
    const { channelId } = req.params;
    await Member.destroy({ ChannelId: channelId, UserId: req.user.id });
    const channel = await Channel.findByPk(channelId, { attributes: ["channel_name"] });
    res.send({
      code: 200,
      channelName: channel.channel_name,
      user: `${req.user.firstName} ${req.user.lastName}`
    })
  } catch(err) {
    next(err);
  }
});

// updating channel information
router.put('/:channelId', async (req, res, next) => {
  try {
    const { channelName } = req.body;
    const { channelId } = req.params;
    await Channel.update({ channel_name: channelName}, {
      where: { id: channelId }
    });
    
    res.send({
      code: 304,
      message: `Channel name is successfully changed to ${channelName}`
    })
  } catch(err) {
    next(err);
  }
});

module.exports = router;