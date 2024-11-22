const wordToGuess = "NOVA";
let currentWord = "____";
let attempts = 0;
let username = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];

document.getElementById("startGame").addEventListener("click", () => {
    username = document.getElementById("username").value.trim();
    if (username) {
        document.getElementById("popup").style.display = "none";
        document.getElementById("game").style.display = "block";
        updateWord();
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
    alert(`Hai indovinato la parola "${wordToGuess}" con ${attempts} tentativi!`);
    
    const newEntry = { name: username, attempts };
    console.log("Salvataggio su Firebase:", newEntry); // Debug
	firebase.database().ref('leaderboard').push(newEntry, (error) => {
		if (error) {
			console.error("Errore durante la scrittura su Firebase:", error);
		} else {
			console.log("Dati salvati con successo su Firebase.");
		}
	});
    showLeaderboard();
}

function showLeaderboard() {
    const leaderboardTable = document.getElementById("leaderboardData");
    leaderboardTable.innerHTML = "";

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
        leaderboard.sort((a, b) => a.attempts - b.attempts);
        leaderboard.forEach((entry) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${entry.name}</td><td>${entry.attempts}</td>`;
            leaderboardTable.appendChild(row);
        });
    });
}