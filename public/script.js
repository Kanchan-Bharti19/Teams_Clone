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

// Whenever someone opens the link of webpage this will ask the name.
const user = prompt('Enter your name:')

// Getting reference to our own video.
const my_video = document.createElement('video')
// Muting own video as we don't want own microphone to playback for us 
my_video.muted = true

const peers = {}

let my_video_stream

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    my_video_stream=stream
    addVideoStream(my_video, stream)

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream)
  })

  let text = $('input')

  $('html').keydown((e) => {
    if(e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val())
      text.val('')
    }
  })
  
  socket.on('createMessage', (message, userName) => {
    $('ul').append(`<li class="message"><b><i class="far fa-user-circle"></i><span> ${userName === user ? "me" : userName}</span></b><br/>${message}</li>`);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

// As we connect with peer server and get id this 
myPeer.on('open', id => {
  socket.emit('join-room', Room_ID, id)
})


function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
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



// const muteButton = () => {
//   const html = ` <i class="fas fa-microphone"></i>
//   <div class="text">Mute</div> `
//   document.querySelector('.mic').innerHTML = html
// }

// const unmuteButton = () => {
//   const html = ` <i class="unmute fas fa-microphone-slash"></i>
//     <div class="text">Unmute</div> `
//   document.querySelector('.mic').innerHTML = html
// }

// const stopVideo = () => {
//   const html = ` <i class="fas fa-video"></i>
//   <div class="text">Stop Video</div> `
//   document.querySelector('.video_btn').innerHTML = html
// }

// const startVideo = () => {
//   const html = ` <i class="stop fas fa-video-slash"></i>
//   <div class="text">Start Video</div> `
//   document.querySelector('.video_btn').innerHTML = html
// }

// const showChat = document.querySelector("#showChat");
// let send = document.getElementById("send_msg")
// let messages = document.querySelector(".messages")

// send.addEventListener("click", (e) => {
//   if (text.value.length !== 0) {
//     socket.emit("message", text.value)
//     text.value = ""
//   }
// })

// text.addEventListener("keydown", (e) => {
//   if (e.key === "Enter" && text.value.length !== 0) {
//     socket.emit("message", text.value)
//     text.value = ""
//   }
// })

// socket.on("createMessage", (message, userName) => {
//   messages.innerHTML =
//     messages.innerHTML +
//     `<div class="message">
//         <b><i class="fas fa-user-circle"></i> <span> ${
//           userName === user ? "me" : userName
//         }</span> </b>
//         <span>${message}</span>
//     </div>`;
// });