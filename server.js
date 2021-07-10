const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuid4 } = require('uuid') //uuid will generate unique id for different rooms
const {ExpressPeerServer} = require('peer')
const peerServer = ExpressPeerServer(server,{
  debug: true
})

app.use('/peerjs',peerServer)

app.set('view engine', 'ejs') //ejs is a templeting engine

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuid4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    // socket.to(roomId).emit('user-connected', userId)
    socket.to(roomId).broadcast.emit('user-connected', userId)

//     socket.on('disconnect', () => {
//       //socket.to(roomId).emit('user-disconnected', userId)
//       socket.broadcast.to(roomId).emit('user-connected', userId)
//     })
  })
})

server.listen(process.env.PORT||3000)