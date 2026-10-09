// Stesso progetto Firebase usato per Nova: i dati di questo gioco stanno sotto il nodo "sole/".
// Se preferisci un progetto separato, sostituisci qui la configurazione.
const firebaseConfig = {
    apiKey: "AIzaSyB5AwGxjR4KdTOoD8bh_oKHyOsyaltipOY",
    authDomain: "thename-e2496.firebaseapp.com",
    databaseURL: "https://thename-e2496-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "thename-e2496",
    storageBucket: "thename-e2496.firebasestorage.app",
    messagingSenderId: "702531579276",
    appId: "1:702531579276:web:dbf50683a73adcaf957aa9"
};

let leaderboardRef = null;
try {
    firebase.initializeApp(firebaseConfig);
    leaderboardRef = firebase.database().ref('sole/leaderboard');
} catch (e) {
    console.error("Firebase non disponibile:", e);
}
