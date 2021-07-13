// Creating express server.
const express = require('express')
// app variable will run the express function.
const app = express()
// Creating server which will be used to run our application.
// http is built in module.
const server = require('http').Server(app)
// uuid creates dynamic URLs, we are using it to create unique urls for different rooms.
const { v4: uuid4 } = require('uuid')
// socket.io allows us to communicate back and forth with server.
const io = require('socket.io')(server)
const {ExpressPeerServer} = require('peer')
const peerServer = ExpressPeerServer(server,{
  debug: true
})

// Use peerServer as middleware.
app.use('/peerjs',peerServer)

//Setting our views.
// ejs is a templeting engine.
app.set('view engine', 'ejs')

// This will allow us to access all of the static files within the public folder.
app.use(express.static('public'))

// Creating default route of our server.
//uuid library will create random unique URL for each room, and will redirect our user to that room.
app.get('/', (req, res) => {
  res.redirect(`/${uuid4()}`)
})
// Creating route for rooms.
// Here we are passing dynamic URLs.
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

// This will start running when someone connects to webpage.
io.on('connection', socket => {
  //Server is going to listen when someone connects to the room.
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    // Broadcast everyone else in the room when someone connects.
    socket.to(roomId).broadcast.emit('user-connected', userId)
    // Broadcast everyone else in the room when someone send a message.
    socket.on('message', (message, userName) => {
      io.to(roomId).emit('createMessage', message, userName);
    });
    // Broadcast everyone else in the room when someone disconnects.
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

// This will start our server in provided port.
server.listen(process.env.PORT||3000)