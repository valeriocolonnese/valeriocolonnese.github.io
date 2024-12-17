const canvas = document.getElementById('sky');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

// Parametri parabola
const a = (6*H - 800)/(2*W*W);
const b = (800 - 5*H)/(2*W);
const c = H/2;

let star = { t: 0 };
let trail = [];

const novaText = document.getElementById('nova-text');
const babyImage = document.getElementById('happybaby-image');
const listaNascitaContainer = document.getElementById('lista-nascita-container');
const postStellaContainer = document.getElementById('post-stella-container');
const messageFormContainer = document.getElementById('message-form-container');
const messagesDisplayContainer = document.getElementById('messages-display-container');
const infoNascita = document.getElementById('info-nascita');

const messagesRef = firebase.database().ref('messages');
let messagesArray = [];

messagesRef.on('child_added', (snapshot) => {
  const data = snapshot.val();
  messagesArray.push(data);
});

// Mostra un messaggio randomico ogni 3 secondi
setInterval(() => {
  if (messagesArray.length > 0 && messagesDisplayContainer.classList.contains('visible-section')) {
    showRandomMessage();
  }
}, 3000);

function showRandomMessage() {
  const container = document.getElementById('messages-inner-container');
  const randomIndex = Math.floor(Math.random() * messagesArray.length);
  const randomMessage = messagesArray[randomIndex];

  const bgColor = getRandomColor();
  const textColor = getContrastColor(bgColor);

  const card = document.createElement('div');
  card.className = 'message-card';
  card.style.backgroundColor = bgColor;
  card.style.color = textColor;
  card.innerHTML = `
    <div class="message-text">${randomMessage.message}</div>
    <div class="message-author">- ${randomMessage.author}</div>
  `;
  container.appendChild(card);

  setTimeout(() => {
    if (card && card.parentNode) {
      card.parentNode.removeChild(card);
    }
  }, 5000);
}

function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

function getContrastColor(rgbColor) {
  const rgbArray = rgbColor.match(/\d+/g).map(Number);
  const r = rgbArray[0];
  const g = rgbArray[1];
  const b = rgbArray[2];
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}

function drawStar() {
  let x = star.t;
  let y = a*x*x + b*x + c;

  if (x < W) {
    ctx.clearRect(0, 0, W, H);
  }

  trail.push({ x, y });
  if (trail.length > 200) {
    trail.shift();
  }

  // Disegna la scia
  for (let i = 0; i < trail.length - 1; i++) {
    const p1 = trail[i];
    const p2 = trail[i+1];
    const alpha = i / trail.length;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.lineWidth = 2;
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Disegna la stella
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  if (x < W) {
    star.t += 4; 
  } else {
    clearInterval(animation);
    showNovaText();
  }
}

function showNovaText() {
  // Mostra titolo Nova
  novaText.classList.remove('hidden-section');
  novaText.classList.add('visible-section');

  // Mostra immagine centrale
  const centralImageContainer = babyImage.parentNode;
  centralImageContainer.classList.remove('hidden-section');
  centralImageContainer.classList.add('visible-section');

  // Dopo 1 secondo mostra il form messaggi
  setTimeout(() => {
    messageFormContainer.classList.remove('hidden-section');
    messageFormContainer.classList.add('visible-section');
  }, 1000);

  // Dopo 2 secondi mostra la lista nascita (stessa colonna, sotto il form)
  setTimeout(() => {
    listaNascitaContainer.classList.remove('hidden-section');
    listaNascitaContainer.classList.add('visible-section');
  }, 2000);

  // Dopo 3 secondi mostra info nascita
  setTimeout(() => {
    infoNascita.classList.remove('hidden-section');
    infoNascita.classList.add('visible-section');
  }, 3000);

  // Dopo 4.5 secondi mostra i messaggi a destra
  setTimeout(() => {
    messagesDisplayContainer.classList.remove('hidden-section');
    messagesDisplayContainer.classList.add('visible-section');
  }, 4500);
}

// Gestione form messaggi
const messageForm = document.getElementById('message-form');
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message-input');
  const nameInput = document.getElementById('name-input');
  
  const newMessage = {
    message: messageInput.value,
    author: nameInput.value
  };

  messagesRef.push(newMessage);

  // Reset campi
  messageInput.value = '';
  nameInput.value = '';
});

const animation = setInterval(drawStar, 16);
