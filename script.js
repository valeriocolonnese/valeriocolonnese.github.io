// Il nome e il suo significato sono offuscati, così non saltano all'occhio aprendo il sorgente
const decode = (codes) => new TextDecoder().decode(new Uint8Array(codes.map((c) => c ^ 0x5A)));
const NAME = decode([31, 22, 19, 21]);
const MEANING = decode([62, 59, 54, 122, 61, 40, 63, 57, 53, 122, 102, 63, 55, 100, 18, 187, 226, 205, 54, 51, 53, 41, 102, 117, 63, 55, 100, 118, 122, 51, 54, 122, 9, 53, 54, 63, 122, 184, 194, 218, 181, 226, 213]);
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const COLORS = ["#FF6B35", "#FF9F1C", "#FFD23F", "#7BD389", "#5BC0EB", "#F78FB3", "#B388EB"];

let username = "";
let tried = new Set();
let found = new Set();
let tries = 0;
let seconds = 0;
let timerId = null;
let playing = false;

const $ = (id) => document.getElementById(id);

$("startGame").addEventListener("click", start);
$("username").addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
$("playAgain").addEventListener("click", () => {
    $("winScreen").style.display = "none";
    newGame();
});

// Da computer si può giocare anche con la tastiera
document.addEventListener("keydown", (e) => {
    if (!playing) return;
    const letter = e.key.toUpperCase();
    if (letter.length === 1 && ALPHABET.includes(letter)) {
        const balloon = document.querySelector(`.balloon[data-letter="${letter}"]`);
        if (balloon) pop(balloon);
    }
});

function start() {
    username = $("username").value.trim();
    if (!username) {
        $("username").classList.add("shake");
        setTimeout(() => $("username").classList.remove("shake"), 500);
        $("username").focus();
        return;
    }
    $("popup").style.display = "none";
    newGame();
}

function newGame() {
    tried = new Set();
    found = new Set();
    tries = 0;
    seconds = 0;
    clearInterval(timerId);
    timerId = null;
    $("tries").textContent = "0";
    $("timer").textContent = "0:00";
    $("mascot").textContent = "🌤️";

    const slots = $("slots");
    slots.innerHTML = "";
    for (let i = 0; i < NAME.length; i++) {
        const s = document.createElement("span");
        s.className = "slot";
        s.textContent = "?";
        slots.appendChild(s);
    }

    const sky = $("balloons");
    sky.innerHTML = "";
    ALPHABET.split("").forEach((letter, i) => {
        const b = document.createElement("button");
        b.className = "balloon";
        b.dataset.letter = letter;
        b.style.setProperty("--color", COLORS[i % COLORS.length]);
        b.style.animationDelay = `${-Math.random() * 3}s`;
        b.style.animationDuration = `${2.5 + Math.random() * 1.5}s`;
        b.setAttribute("aria-label", `Lettera ${letter}`);
        b.innerHTML = `<span class="body">${letter}</span><span class="string"></span>`;
        b.addEventListener("click", () => pop(b));
        sky.appendChild(b);
    });

    $("game").style.display = "block";
    playing = true;
}

function pop(balloon) {
    const letter = balloon.dataset.letter;
    if (!playing || tried.has(letter)) return;
    if (!timerId) timerId = setInterval(tick, 1000);

    tried.add(letter);
    tries++;
    $("tries").textContent = tries;
    balloon.disabled = true;

    if (NAME.includes(letter)) {
        found.add(letter);
        balloon.classList.add("fly");
        revealLetter(letter);
        $("mascot").textContent = "☀️";
        if ([...NAME].every((l) => found.has(l))) {
            playing = false;
            setTimeout(win, 1200);
        }
    } else {
        balloon.classList.add("popped");
        $("mascot").textContent = "⛈️";
    }
}

function revealLetter(letter) {
    const slots = $("slots").children;
    for (let i = 0; i < NAME.length; i++) {
        if (NAME[i] === letter) {
            slots[i].textContent = letter;
            slots[i].classList.add("found");
        }
    }
}

function tick() {
    seconds++;
    $("timer").textContent = formatTime(seconds);
}

function formatTime(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function win() {
    clearInterval(timerId);
    timerId = null;
    $("game").style.display = "none";
    $("bigName").textContent = NAME;
    $("meaning").innerHTML = MEANING;
    $("finalTries").textContent = tries;
    $("finalTime").textContent = formatTime(seconds);
    $("winScreen").style.display = "block";
    launchConfetti();

    if (leaderboardRef) {
        leaderboardRef.push({ name: username, tries, seconds, date: Date.now() })
            .catch((err) => console.error("Errore durante il salvataggio su Firebase:", err));
    }
}

// Pioggia di soli e coriandoli dorati
function launchConfetti() {
    const canvas = $("confetti");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#FFD23F", "#FF9F1C", "#FF6B35", "#FFF3B0", "#7BD389", "#5BC0EB"];
    const pieces = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height,
        size: 6 + Math.random() * 8,
        speed: 2 + Math.random() * 3,
        drift: -1 + Math.random() * 2,
        angle: Math.random() * Math.PI,
        spin: -0.1 + Math.random() * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        sun: Math.random() < 0.15
    }));
    const startedAt = performance.now();

    function frame(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        for (const p of pieces) {
            p.y += p.speed;
            p.x += p.drift;
            p.angle += p.spin;
            if (p.y < canvas.height + 20) alive = true;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            if (p.sun) {
                ctx.font = `${p.size * 2.5}px serif`;
                ctx.fillText("☀️", 0, 0);
            } else {
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }
            ctx.restore();
        }
        if (alive && now - startedAt < 8000) requestAnimationFrame(frame);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    requestAnimationFrame(frame);
}
