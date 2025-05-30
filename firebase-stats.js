// firebase-stats.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAIChaC8FOsYR0nQyI7LjXcR3FmwRhQSmk",
  authDomain: "lonuestro-71349.firebaseapp.com",
  projectId: "lonuestro-71349",
  storageBucket: "lonuestro-71349.appspot.com",
  messagingSenderId: "309048050196",
  appId: "1:309048050196:web:0a918ca0c278e0918f9d01",
  measurementId: "G-J5RXKQC0LM"
};

// Inicializa Firebase y Firestore
initializeApp(firebaseConfig);
const db = getFirestore();

// Formatea delta con flecha y porcentaje
function formatoDelta(valor) {
  const signo = valor >= 0 ? 'up' : 'down';
  const flecha = valor >= 0 ? '▲' : '▼';
  return { signo, texto: `${flecha} ${Math.abs(valor)}%` };
}

async function cargarEstadisticas() {
  try {
    const meses = ['mayo_2025', 'abril_2025'];
    const [snapAct, snapPrev] = await Promise.all(
      meses.map(m => getDoc(doc(db, 'estadisticas', m)))
    );
    if (!snapAct.exists()) {
      console.warn('Documento mayo_2025 no existe');
      return;
    }
    const dAct = snapAct.data();
    const dPrev = snapPrev.exists() ? snapPrev.data() : null;

    // Valores actuales
    const act = Number(dAct.usuarios_activos) || 0;
    const tot = Number(dAct.usuarios_totales) || act;
    const capAct = Number(dAct.capitalizacion) || 0;
    const rendAct = Number(dAct.rendimientos) || 0;
    const rendPrev = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // % Socios activos para display
    const pctSocAct = tot ? Math.round((act / tot) * 100) : 0;

    // Delta % Socios activos
    const prevAct = dPrev ? Number(dPrev.usuarios_activos) || 0 : 0;
    const pctSocPrev = prevAct && dPrev.usuarios_totales ?
      Math.round((prevAct / Number(dPrev.usuarios_totales)) * 100) : 0;
    const deltaSocPct = pctSocPrev ? Math.round(((pctSocAct - pctSocPrev) / pctSocPrev) * 100) : 0;
    const deltaSocCount = act - prevAct;

    // Delta Socios totales count
    const prevTot = dPrev ? Number(dPrev.usuarios_totales) || 0 : 0;
    const deltaTot = tot - prevTot;

    // Delta Capital %
    const capPrev = dPrev ? Number(dPrev.capitalizacion) || 0 : 0;
    const deltaCapPct = capPrev ? Math.round(((capAct - capPrev) / capPrev) * 100) : 0;

    // Delta Rendimientos %
    const deltaRendPct = rendPrev ? Math.round(((rendAct - rendPrev) / rendPrev) * 100) : 0;

    // Actualizar DOM
    document.getElementById('socios-totales').innerText = tot;
    const elTot = document.getElementById('delta-totales');
    elTot.className = `delta ${deltaTot >= 0 ? 'up' : 'down'}`;
    elTot.innerText = `${deltaTot >= 0 ? '▲' : '▼'} ${Math.abs(deltaTot)}`;

    document.getElementById('socios-porcentaje').innerText = act;
    const elSoc = document.getElementById('delta-socios');
    elSoc.className = `delta ${deltaSocCount >= 0 ? 'up' : 'down'}`;
    elSoc.innerText = `▲ ${deltaSocCount} (${deltaSocPct}%)`;

    document.getElementById('capital').innerText = `$${capAct.toLocaleString()}`;
    const elCap = document.getElementById('delta-capital');
    elCap.className = `delta ${deltaCapPct >= 0 ? 'up' : 'down'}`;
    elCap.innerText = formatoDelta(deltaCapPct).texto;

    document.getElementById('rendimiento').innerText = `$${rendAct.toLocaleString()}`;
    const elRend = document.getElementById('delta-rendimiento');
    elRend.className = `delta ${deltaRendPct >= 0 ? 'up' : 'down'}`;
    elRend.innerText = formatoDelta(deltaRendPct).texto;

  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
