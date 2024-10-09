// frontend/main.js

const socket = io();

// Elements
const mainPage = document.getElementById('mainPage');
const usernameDisplay = document.getElementById('usernameDisplay');
const roomLink = document.getElementById('roomLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const youtubeLink = document.getElementById('youtubeLink');
const loadVideoBtn = document.getElementById('loadVideoBtn');
const videoPlayerContainer = document.getElementById('videoPlayerContainer');
const datetimeDisplay = document.getElementById('datetime');

// YouTube Player Instance
let player;
let isPlayerReady = false;

// Get username from localStorage
const username = localStorage.getItem('username');
if (!username) {
  window.location.href = 'index.html';
}

// Display username
usernameDisplay.textContent = username;

// Get room ID from URL
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');

// If roomId is not present, redirect to index
if (!roomId) {
  alert('No room ID provided. Redirecting to home page.');
  window.location.href = 'index.html';
}

// Set room link
const currentUrl = window.location.href;
roomLink.value = currentUrl;

// Copy Room Link
copyLinkBtn.addEventListener('click', () => {
  roomLink.select();
  document.execCommand('copy');
  alert('Invite link copied!');
});

// Join the room via Socket.io
socket.emit('joinRoom', { roomId, username });

// Listen for room existence
socket.on('roomExists', (exists) => {
  if (!exists) {
    alert('Room does not exist. Redirecting to home page.');
    window.location.href = 'index.html';
  }
});

// Update users list (optional: can display in UI)
socket.on('updateUsers', (users) => {
  console.log('Users in room:', users);
});

// Handle YouTube Video Loading
loadVideoBtn.addEventListener('click', () => {
  const videoUrl = youtubeLink.value.trim();
  if (isValidYoutubeLink(videoUrl)) {
    const videoId = extractVideoID(videoUrl);
    if (videoId) {
      loadYouTubeVideo(videoId);
      // Notify other users
      socket.emit('videoControl', { roomId, action: 'load', data: { videoId } });
    }
  } else {
    alert('Please enter a valid YouTube URL.');
  }
});

// Receive video control actions
socket.on('videoControl', ({ action, data }) => {
  if (action === 'load' && data.videoId) {
    loadYouTubeVideo(data.videoId, false);
  } else if (action === 'play') {
    if (isPlayerReady) player.playVideo();
  } else if (action === 'pause') {
    if (isPlayerReady) player.pauseVideo();
  }
});

// YouTube IFrame API Integration
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '', // Start with no video
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
      'onError': onPlayerError
    }
  });
}

function onPlayerReady(event) {
  isPlayerReady = true;
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    socket.emit('videoControl', { roomId, action: 'play', data: {} });
  } else if (event.data === YT.PlayerState.PAUSED) {
    socket.emit('videoControl', { roomId, action: 'pause', data: {} });
  }
}

function onPlayerError(event) {
  console.error('YouTube Player Error:', event.data);
  alert('Failed to load the YouTube video. Please try a different link.');
}

function loadYouTubeVideo(videoId, emit = true) {
  if (isPlayerReady) {
    player.loadVideoById(videoId);
  } else {
    // If player is not ready yet, wait for it to be ready
    const interval = setInterval(() => {
      if (isPlayerReady) {
        player.loadVideoById(videoId);
        clearInterval(interval);
      }
    }, 100);
  }
}

function isValidYoutubeLink(url) {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return pattern.test(url);
}

function extractVideoID(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Date and Time Update
function updateDateTime() {
  const now = new Date();
  const formatted = `${String(now.getDate()).padStart(2, '0')} `
                 + `${String(now.getMonth() + 1).padStart(2, '0')} `
                 + `${String(now.getFullYear()).substr(-2)} `
                 + `${String(now.getHours()).padStart(2, '0')}:`
                 + `${String(now.getMinutes()).padStart(2, '0')}:`
                 + `${String(now.getSeconds()).padStart(2, '0')}`;
  datetimeDisplay.textContent = formatted;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Handle Mouse Movement (Basic Implementation)
document.addEventListener('mousemove', (e) => {
  const mouseData = { x: e.clientX, y: e.clientY };
  socket.emit('mouseMove', { roomId, mouseData });
});

// Receive Mouse Movement from others
socket.on('mouseMove', (mouseData) => {
  // Create a custom cursor or indicator
  const cursor = document.createElement('div');
  cursor.classList.add('remote-cursor');
  cursor.style.left = `${mouseData.x}px`;
  cursor.style.top = `${mouseData.y}px`;
  document.body.appendChild(cursor);

  // Remove the cursor after a short delay
  setTimeout(() => {
    cursor.remove();
  }, 100);
});

// Load YouTube IFrame API Script Once
(function loadYouTubeIFrameAPI() {
  if (document.getElementById('youtube-iframe-api')) return; // Prevent multiple loads
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  tag.id = 'youtube-iframe-api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();
