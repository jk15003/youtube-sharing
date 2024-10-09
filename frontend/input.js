// frontend/input.js

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('usernameInput');
    const hostBtn = document.getElementById('hostBtn');
    const joinBtn = document.getElementById('joinBtn');
    const joinSection = document.getElementById('joinSection');
    const inviteLinkInput = document.getElementById('inviteLinkInput');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
  
    // Show Join Section when Join button is clicked
    joinBtn.addEventListener('click', () => {
      joinSection.style.display = 'flex';
    });
  
    // Handle Host button click
    hostBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      if (username) {
        // Save username to localStorage
        localStorage.setItem('username', username);
        // Generate a new room ID
        const roomId = generateRoomId();
        // Redirect to main page with room ID as query parameter
        window.location.href = `main.html?room=${roomId}`;
      } else {
        alert('Please enter a username.');
      }
    });
  
    // Handle Join Room button click
    joinRoomBtn.addEventListener('click', () => {
      const username = usernameInput.value.trim();
      const inviteLink = inviteLinkInput.value.trim();
  
      if (!username) {
        alert('Please enter a username.');
        return;
      }
  
      if (!inviteLink) {
        alert('Please enter an invite link or Room ID.');
        return;
      }
  
      let roomId = '';
  
      try {
        // Try to parse the room ID from a full URL
        const url = new URL(inviteLink);
        const params = new URLSearchParams(url.search);
        roomId = params.get('room');
        if (!roomId) {
          throw new Error('Room ID not found in the URL.');
        }
      } catch (e) {
        // If it's not a full URL, assume it's a room ID
        roomId = inviteLink;
      }
  
      if (roomId) {
        // Save username to localStorage
        localStorage.setItem('username', username);
        // Redirect to main page with room ID as query parameter
        window.location.href = `main.html?room=${roomId}`;
      } else {
        alert('Invalid invite link or Room ID.');
      }
    });
  
    // Function to generate a unique room ID
    function generateRoomId() {
      return 'room-' + Math.random().toString(36).substr(2, 9);
    }
  });
  