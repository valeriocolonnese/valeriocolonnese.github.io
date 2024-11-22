const wordToGuess = "NOVA";
let currentWord = "____";
let attempts = 0;
let username = "";
let guessedLetters = new Set(); // Per evitare doppie lettere

document.getElementById("restartGame").addEventListener("click", () => {
    // Reset variabili di gioco
    username = "";
    currentWord = "____";
    attempts = 0;
    guessedLetters.clear();
    document.getElementById("attempts").innerText = attempts;
    document.getElementById("word").innerText = currentWord;

    // Reset UI
    document.getElementById("leaderboard").style.display = "none"; // Nascondi la leaderboard
    document.getElementById("popup").style.display = "block"; // Mostra il popup iniziale
});

document.getElementById("startGame").addEventListener("click", () => {
    username = document.getElementById("username").value.trim();
    if (username) {
        document.getElementById("popup").style.display = "none";
        document.getElementById("game").style.display = "block";
        updateWord();
    } else {
        alert("Per favore, inserisci il tuo nome per iniziare!");
    }
});

document.getElementById("submitLetter").addEventListener("click", () => {
    const letter = document.getElementById("letterInput").value.toUpperCase();
    if (letter && letter.length === 1) {
        checkLetter(letter);
        document.getElementById("letterInput").value = "";
    }
});

function checkLetter(letter) {
    if (guessedLetters.has(letter)) {
        alert("Hai già provato questa lettera!");
        return;
    }
    guessedLetters.add(letter);

    let newWord = "";
    let isCorrect = false;
    for (let i = 0; i < wordToGuess.length; i++) {
        if (wordToGuess[i] === letter) {
            newWord += letter;
            isCorrect = true;
        } else {
            newWord += currentWord[i];
        }
    }
    currentWord = newWord;
    if (!isCorrect) {
        attempts++;
        document.getElementById("attempts").innerText = attempts;
    }
    updateWord();
    if (currentWord === wordToGuess) {
        endGame();
    }
}

function updateWord() {
    document.getElementById("word").innerText = currentWord;
}

function endGame() {
    const message = `Hai indovinato la parola "${wordToGuess}" con ${attempts} tentativi!`;
    alert(message);

    const newEntry = { name: username, attempts };
    firebase.database().ref('leaderboard').push(newEntry, (error) => {
        if (error) {
            console.error("Errore durante la scrittura su Firebase:", error);
        } else {
            console.log("Dati salvati con successo su Firebase.");
            document.getElementById("game").style.display = "none"; // Nascondi il gioco
            showLeaderboard(message); // Mostra la leaderboard con il messaggio
        }
    });
}

function showLeaderboard(message) {
    const leaderboardTable = document.getElementById("leaderboardData");
    leaderboardTable.innerHTML = "";

    // Recupera i dati della leaderboard da Firebase
    firebase.database().ref('leaderboard').once('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            console.log("Nessun dato trovato nella leaderboard.");
            return;
        }
        const leaderboard = [];
        for (let id in data) {
            leaderboard.push(data[id]);
        }
        leaderboard.sort((a, b) => a.attempts - b.attempts).slice(0, 10); // Mostra i primi 10
        leaderboard.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${entry.name}</td><td>${entry.attempts}</td>`;
            leaderboardTable.appendChild(row);
        });
    });

    document.getElementById("game").style.display = "none"; // Nascondi il gioco
    document.getElementById("leaderboard").style.display = "block"; // Mostra la leaderboard

    // Mostra il messaggio di fine partita
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    document.getElementById("leaderboard").prepend(messageElement);
}