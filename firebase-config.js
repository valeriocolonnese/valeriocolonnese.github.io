// Stesso progetto Firebase usato per Nova e per il gioco: i messaggi di auguri stanno sotto "elio/messages".
const firebaseConfig = {
    apiKey: "AIzaSyB5AwGxjR4KdTOoD8bh_oKHyOsyaltipOY",
    authDomain: "thename-e2496.firebaseapp.com",
    databaseURL: "https://thename-e2496-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "thename-e2496",
    storageBucket: "thename-e2496.firebasestorage.app",
    messagingSenderId: "702531579276",
    appId: "1:702531579276:web:dbf50683a73adcaf957aa9"
};

let messagesRef = null;
try {
    firebase.initializeApp(firebaseConfig);
    messagesRef = firebase.database().ref("elio/messages");
} catch (e) {
    console.warn("Firebase non disponibile, uso messaggi di esempio:", e);
}
