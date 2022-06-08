const SocketIO = require("socket.io");
const { sendMessage } = require("./middleware");

const socketMap = {};
let users = [];
// TODO: NEED TO CONNECT WITH REDIS FOR THE USER LIST PERSISITENT

module.exports = (server, app) => {
  const io = SocketIO(server, {
    path: '/socket.io',
    cors: {
      origin: 'http://localhost:3050'
    }
  });

  app.set('io', io);
  app.set('socketMap', socketMap);
  app.set('users', users);

  io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    console.log('username: ', username);
    if (!username) {
      return next(new Error("invalid username"));
    }
    socket.username = username;
    next();
  });

  io.on("connection", async (socket) => {
    for (let [id, socket] of io.of("/").sockets) {
      if (!users.some(user => user.username === socket.username)) {
        users.push({
          userID: id,
          username: socket.username,
          isOnline: true
        });
      } else {
        const index = users.findIndex(user => user.username === socket.username);
        users[index] = {
          ...users[index],
          isOnline: true
        }
      }
    }
    console.log('joining main page -------------!')
    // list of connected users
    io.sockets.emit("users", users);

    // broadcasting new connected user
    socket.broadcast.emit("online", {
      userID: socket.id,
      username: socket.username,
    });

    socket.on('new channel', (isNewChannel) => {
      if (isNewChannel) {
        io.sockets.emit('getList', true);
      }
    })

    // namespace connecting
    const dynamicChannel = io.of(/^\/ch-.+$/);
    dynamicChannel.on('connection', (socket) => {
      const username = socket.handshake.auth.username;
      const channelName = socket.nsp.name;
      console.log(`joining namespace ${channelName} page -------------!`)

      // creating channel map
      if (!socketMap[channelName]) {
        socketMap[channelName] = [];
      }

      // add user to channel
      if (!socketMap[channelName].includes(username)) {
        console.log('User: ', username, ' Channel: ', channelName);
        socketMap[channelName].push(username);

        // user enters channel
        dynamicChannel.emit('fetch room data', true);

        // send joined message
        const messageData = { 
          message: `${username} joined the channel`,
          alert: true,
          channelId: channelName.split('/ch-')[1],
          userID: username
        };
        sendMessage(channelName, messageData);
        dynamicChannel.emit('new message', true);
      };

      // post message
      socket.on('message', (message) => {
        console.log('sending message...  ', channelName);
        const messageData = { ...message, userID: username };
        sendMessage(channelName, messageData);
        dynamicChannel.emit('new message', true);
      })

      // someone is typing
      socket.on('typing', (user) => {
        if (user) {
          dynamicChannel.emit('typing notification', `${user} is typing`);
          return;
        }
        dynamicChannel.emit('typing notification', '');
      })

      // disconnect from channel
      socket.on('disconnect', (reason) => {
        console.log(`${username} is disconnecting from ${channelName}... ${reason}`);
        const index = socketMap[channelName]?.findIndex(user => user === username);
        socketMap[channelName]?.splice(index, 1);

         // send left message
         const messageData = { 
          message: `${username} left the channel`,
          alert: true,
          channelId: channelName.split('/ch-')[1],
          userID: username
        };
        sendMessage(channelName, messageData);
        dynamicChannel.emit('new message', true);

        // delete channel if nobody is in the channel
        if (!socketMap[channelName]?.length) {
          delete socketMap[channelName]
        }
      })
    })

    // disconnecting user
    socket.on('disconnect', (reason) => {
      console.log(`${socket.username} is disconnecting. ${reason}`);

      // delete user from the list
      const index = users.findIndex(user => user.username === socket.username);
      users[index] = {
        ...users[index],
        isOnline: false
      }

      io.sockets.emit("offline", users);
    })
  });
}