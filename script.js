// =====================================================================
//  DATI DELLA NASCITA: è l'unica parte da compilare il giorno X.
//  Finché un valore è null il sito mostra "in arrivo".
// =====================================================================
const NASCITA = {
    data: "08/11/2026",
    ora: "21:42",
    peso: "3 kg",
    altezza: "49 cm"
};

const REGALO = {
    iban: "IT43 C076 0104 2000 0102 3635 301",
    intestatario: "Valerio Colonnese"
};
// =====================================================================

const $ = (id) => document.getElementById(id);

// ---------- Info nascita ----------
function fillInfo() {
    const set = (id, v) => { $(id).textContent = v || "in arrivo…"; };
    set("info-data", NASCITA.data);
    set("info-ora", NASCITA.ora);
    set("info-peso", NASCITA.peso);
    set("info-altezza", NASCITA.altezza);

    if (REGALO.iban) {
        $("iban-code").textContent = REGALO.iban;
        $("iban-owner").textContent = REGALO.intestatario || "";
    } else {
        $("gift").hidden = true;
    }
}

$("copy-iban").addEventListener("click", async () => {
    const text = (REGALO.iban || "").replace(/\s+/g, "");
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
    }
    const btn = $("copy-iban");
    btn.textContent = "Copiato! ☀️";
    setTimeout(() => { btn.textContent = "Copia IBAN"; }, 2000);
});

// ---------- Alba ----------
function sunrise() {
    document.body.classList.add("dawn");
    const steps = [
        [300, "rising"],
        [2600, "day"],
        [3400, "show-title"],
        [4400, "show-content"]
    ];
    steps.forEach(([t, cls]) => setTimeout(() => document.body.classList.add(cls), t));
}

function skipIntro() {
    document.body.classList.add("rising", "day", "show-title", "show-content");
}
document.addEventListener("click", skipIntro, { once: true });

// ---------- Messaggi ----------
const messages = [];
const palette = ["#FFE08A", "#FFC46B", "#FFAD5C", "#FFF1B8", "#FFD6A5", "#BDE7F7"];

function showRandomMessage() {
    if (!messages.length || !document.body.classList.contains("show-content")) return;
    const box = $("messages-rotator");
    const m = messages[Math.floor(Math.random() * messages.length)];
    const card = document.createElement("div");
    card.className = "message-card";
    card.style.background = palette[Math.floor(Math.random() * palette.length)];
    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = m.message;
    const author = document.createElement("div");
    author.className = "message-author";
    author.textContent = "– " + m.author;
    card.append(text, author);
    box.replaceChildren(card);
}

function updateCount() {
    const n = messages.length;
    $("messages-count").textContent = n === 1 ? "1 messaggio" : n + " messaggi";
    $("messages-empty").hidden = n > 0;
}

if (messagesRef) {
    messagesRef.on("child_added", (snap) => {
        const d = snap.val();
        if (d && d.message && d.author) {
            messages.push(d);
            updateCount();
            if (messages.length === 1) showRandomMessage();
        }
    });
}
setInterval(showRandomMessage, 5000);

$("message-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const message = $("message-input").value.trim();
    const author = $("name-input").value.trim();
    if (!message || !author) return;

    const done = () => {
        $("message-form").reset();
        $("form-feedback").textContent = "Grazie! Il tuo augurio è arrivato ☀️";
        setTimeout(() => { $("form-feedback").textContent = ""; }, 4000);
    };

    if (messagesRef) {
        messagesRef.push({ message, author, ts: firebase.database.ServerValue.TIMESTAMP })
            .then(done)
            .catch(() => { $("form-feedback").textContent = "Ops, non è stato possibile inviare il messaggio. Riprova."; });
    } else {
        messages.push({ message, author });
        updateCount();
        done();
    }
});

fillInfo();
updateCount();
sunrise();
