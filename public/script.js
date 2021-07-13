// Getting reference to socket.
// Socket will connect to root path.
const socket = io('/')

// Getting reference to video-grid where our video will appear
const video_container = document.getElementById('video-grid')

// Peer server takes WebRTC information for a user and turns is into easy-to-use id which can be passed to different places and used with peer library to connect with different peers on network. 
// Creating peer.
// Undefined is passed as server will generate id.
// Peer server takes WebRTC information for a user and turns is into easy-to-use id which can be passed to different places and used with peer library to connect with different peers on network. 
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

// Getting reference to our own video.
const my_video = document.createElement('video')
// Muting own video as we don't want own microphone to playback for us 
my_video.muted = true

// This will store the user ids of peers.
const peers = {}

let my_video_stream
navigator.mediaDevices.getUserMedia({
  // Setting audio and video permissions.
  video: true,
  audio: true
}).then(stream => {
  my_video_stream=stream
  // Add video to the stream.
  addVideoStream(my_video, stream)

  // This function will be used to answer the call.
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  // Connect to new user once userId is passed by callback function
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream)
  })

  let text = $('input')
  // when enter is pressed this will send the message to all user including the sender
  $('html').keydown((e) => {
    if(e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val())
      text.val('')
    }
  })
  // This will append our message to the chat window
  socket.on('createMessage', (message) => {
    $('ul').append(`<li class="message"><b>Participant</b><br/>${message}</li>`);
  })
})

// This will remove our user id from the peers when we disconnect.
socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// As we connect with peer server and get id we wiil broadcast to room.
myPeer.on('open', id => {
  socket.emit('join-room', Room_ID, id)
})

// This function will be used to call user and send and recieve video and audio.
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  // When someone closes the call this will remove it from our video grid.
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

// This function will add the stream to the video element.
function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  video_container.append(video)
}

// When end call option is clicked this will end our call.
const endCall = () => {
  call.on('close', () => {
    video.remove()
  })
  document.querySelector('call_drop').innerHTML = html;
}

// When the mic icon is clicked this function will turn ON the audio if it is OFF and turn OFF the audio if it is ON.
const mute_unmute = () => {
  const enabled = my_video_stream.getAudioTracks()[0].enabled
  if (enabled) {
    my_video_stream.getAudioTracks()[0].enabled = false
    const html = ` <i class="unmute fas fa-microphone-slash"></i>
    <div class="text">Unmute</div> `
    document.querySelector('.mic').innerHTML = html
  } else {
    my_video_stream.getAudioTracks()[0].enabled = true
    const html = ` <i class="fas fa-microphone"></i>
    <div class="text">Mute</div> `
    document.querySelector('.mic').innerHTML = html
  }
}

// When the video icon is clicked this function will turn ON the video if it is OFF and turn OFF the video if it is ON.
const stop_start = () => {
  let enabled = my_video_stream.getVideoTracks()[0].enabled
  if (enabled) {
    my_video_stream.getVideoTracks()[0].enabled = false
    const html = ` <i class="stop fas fa-video-slash"></i>
    <div class="text">Start Video</div> `
    document.querySelector('.video_btn').innerHTML = html
  } else {
    my_video_stream.getVideoTracks()[0].enabled = true
    const html = ` <i class="fas fa-video"></i>
    <div class="text">Stop Video</div> `
    document.querySelector('.video_btn').innerHTML = html
  }
}

// When the icon is clicked it will perform the query which is assigned by the variable.
const facebookBtn = document.querySelector('.facebook-btn')
const linkedinBtn = document.querySelector('.linkedin-btn')
const whatsappBtn = document.querySelector('.whatsapp-btn')

// This function will open the specific site corresponding to icon which is being clicked to share the link of the room.
function share_link() {
  let postUrl = encodeURI(document.location.href)
  let postTitle = encodeURI('Hi, please click here to join the meeting: ')
  facebookBtn.setAttribute(
    'href',
    `https://www.facebook.com/sharer.php?u=${postUrl}`
  )
  linkedinBtn.setAttribute(
    'href',
    `https://www.linkedin.com/shareArticle?url=${postUrl}&title=${postTitle}`
  )
  whatsappBtn.setAttribute(
    'href',
    `https://wa.me/?text=${postTitle} ${postUrl}`
  )
}

// Calling the share_link function it will be called when invite button is clicked.
share_link()

// When a new message is recieved it will automatically scroll down in the message container.
const scrollDown = () => {
  let c = $('chat_window')
  c.scrollTop(c.prop('scrollHeight'))
}