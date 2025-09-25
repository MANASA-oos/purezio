document.addEventListener('DOMContentLoaded', () => {

  // ----------------- User Login/Signup -----------------
  let users = JSON.parse(localStorage.getItem('users')) || {};
  let currentUser = null;
  let playerName = '';
  let points = 0;
  let lifelines = 3;
  let timeLeft = 60;
  let gameInterval = null;

  const signupBtn = document.getElementById('signup-btn');
  const loginBtn = document.getElementById('login-btn');
  const playerNameBtn = document.getElementById('player-name-btn');
  const startGameBtn = document.getElementById('start-game-btn');
  const restartBtn = document.getElementById('restart-btn');

  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginSection = document.getElementById('login-section');
  const signupSection = document.getElementById('signup-section');

  loginTab.addEventListener('click', () => {
    loginSection.style.display = 'block';
    signupSection.style.display = 'none';
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  });

  signupTab.addEventListener('click', () => {
    loginSection.style.display = 'none';
    signupSection.style.display = 'block';
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
  });

  signupBtn.addEventListener('click', () => {
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    if (!phone || !password) return alert('Enter phone and password!');
    if (users[phone]) return alert('User already exists! Login.');
    users[phone] = { password };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Signup successful! Now login.');
  });

  loginBtn.addEventListener('click', () => {
    const phone = document.getElementById('login-phone').value;
    const password = document.getElementById('login-password').value;
    if (users[phone] && users[phone].password === password) {
      currentUser = phone;
      showPage('player-page');
    } else {
      alert('Invalid phone or password!');
    }
  });

  playerNameBtn.addEventListener('click', () => {
    const name = document.getElementById('player-name-input').value;
    if (!name) return alert('Enter a player name!');
    playerName = name;
    showPage('video-page');
  });

  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  }

  // ----------------- Video Selection Buttons -----------------
  const videoLink = "https://drive.google.com/file/d/1G-eKBcteNzY0wfwhptEEtTs6_YVkCfo9/preview?usp=drivesdk";
  document.getElementById('recycle-btn').addEventListener('click', () => playVideo(videoLink));
  document.getElementById('air-btn').addEventListener('click', () => playVideo(videoLink));
  document.getElementById('soil-btn').addEventListener('click', () => playVideo(videoLink));

  function playVideo(link) {
    document.getElementById('topic-video').src = link;
    showPage('video-display-page');
  }

  // ----------------- Mini Game -----------------
  startGameBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', () => showPage('video-page'));

  const trashData = [
    { emoji: '🍌', type: 'wet' },
    { emoji: '🍎', type: 'wet' },
    { emoji: '🥤', type: 'dry' },
    { emoji: '📰', type: 'dry' },
  ];

  function startGame() {
    points = 0; lifelines = 3; timeLeft = 60;
    document.getElementById('points').innerText = `Points: ${points}`;
    document.getElementById('lifelines').innerText = '💖💖💖';
    document.getElementById('timer').innerText = `Time: ${timeLeft}s`;
    showPage('game-page');
    generateTrashItems();
    startTimer();
  }

  function generateTrashItems() {
    const container = document.getElementById('trash-items');
    container.innerHTML = '';
    trashData.forEach(item => {
      const div = document.createElement('div');
      div.className = 'trash';
      div.innerText = item.emoji;
      div.draggable = true;
      div.dataset.type = item.type;
      div.addEventListener('dragstart', dragStart);
      container.appendChild(div);
    });
    document.getElementById('wet-bin').ondragover = allowDrop;
    document.getElementById('wet-bin').ondrop = drop;
    document.getElementById('dry-bin').ondragover = allowDrop;
    document.getElementById('dry-bin').ondrop = drop;
  }

  function dragStart(e) {
    e.dataTransfer.setData('text', e.target.dataset.type);
    e.dataTransfer.setData('emoji', e.target.innerText);
  }

  function allowDrop(e) { e.preventDefault(); }

  function drop(e) {
    e.preventDefault();
    const binType = e.target.id === 'wet-bin' ? 'wet' : 'dry';
    const trashType = e.dataTransfer.getData('text');
    const emoji = e.dataTransfer.getData('emoji');
    if (trashType === binType) points += 10;
    else lifelines -= 1;
    updateGameInfo();
    const trashItems = Array.from(document.getElementsByClassName('trash'));
    trashItems.forEach(item => { if (item.innerText === emoji) item.remove(); });
    if (lifelines <= 0 || document.getElementsByClassName('trash').length === 0) endGame();
  }

  function updateGameInfo() {
    document.getElementById('points').innerText = `Points: ${points}`;
    document.getElementById('lifelines').innerText = '💖'.repeat(lifelines);
  }

  function startTimer() {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('timer').innerText = `Time: ${timeLeft}s`;
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function endGame() {
    clearInterval(gameInterval);
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name: playerName, points });
    leaderboard.sort((a,b) => b.points - a.points);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
  }

  function displayLeaderboard() {
    showPage('leaderboard-page');
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.forEach(player => {
      const li = document.createElement('li');
      li.innerText = `${player.name} - ${player.points} pts`;
      list.appendChild(li);
    });
  }

});
