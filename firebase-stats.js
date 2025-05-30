
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIChaC8FOsYR0nQyI7LjXcR3FmwRhQSmk",
  authDomain: "lonuestro-71349.firebaseapp.com",
  projectId: "lonuestro-71349",
  storageBucket: "lonuestro-71349.firebasestorage.app",
  messagingSenderId: "309048050196",
  appId: "1:309048050196:web:0a918ca0c278e0918f9d01",
  measurementId: "G-J5RXKQC0LM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cargarEstadisticas() {
  const docRef = doc(db, "estadisticas", "mayo_2025");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById("socios").innerText = data.usuarios_activos ?? "—";
    document.getElementById("capital").innerText = "$" + (data.capitalizacion ?? "—");
    document.getElementById("rendimientos").innerText = (data.rendimientos ?? "—") + " metas";
  } else {
    console.log("No se encontró el documento.");
  }
}

cargarEstadisticas();
