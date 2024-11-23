const wordToGuess = "NOVA";
let currentWord = "____";
let attempts = 0;
let username = "";
let guessedLetters = new Set();

document.getElementById("startGame").addEventListener("click", () => {
    console.log("Bottone Inizia cliccato");
    username = document.getElementById("username").value.trim();
    if (username) {
        console.log("Nome utente:", username);
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
    if (isCorrect) {
        updateFeedbackImage("images/happybaby.png");
    } else {
        attempts++;
        document.getElementById("attempts").innerText = attempts;
        updateFeedbackImage("images/angrybaby.png");
    }
    updateWord();
    if (currentWord === wordToGuess) {
        endGame();
    }
}

function updateWord() {
    document.getElementById("word").innerText = currentWord;
}

function updateFeedbackImage(imageSrc) {
    const feedbackImage = document.getElementById("feedbackImage");
    feedbackImage.src = imageSrc;
}

function endGame() {
    const message = `Hai indovinato il nome con ${attempts} tentativi!`;
    alert(message);

    const newEntry = { name: username, attempts };
    firebase.database().ref('leaderboard').push(newEntry, (error) => {
        if (error) {
            console.error("Errore durante la scrittura su Firebase:", error);
        } else {
            console.log("Dati salvati con successo su Firebase.");

            // Mostra l'immagine gigante della vittoria
            const winImage = document.getElementById("winImage");
            if (winImage) {
                winImage.style.display = "block";
            }

            // Nascondi il gioco
            document.getElementById("game").style.display = "none";

            // Carica la leaderboard
            showLeaderboard(message);
        }
    });
}

