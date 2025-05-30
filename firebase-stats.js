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

// Formatea delta con flecha y valor (opcional %)
function formatoDelta(valor, esPorcentaje = true) {
  const signo = valor >= 0 ? 'up' : 'down';
  const flecha = valor >= 0 ? '▲' : '▼';
  return esPorcentaje
    ? { signo, texto: `${flecha} ${Math.abs(valor)}%` }
    : { signo, texto: `${flecha} ${Math.abs(valor)}` };
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

    // Valores previos
    const prevAct = dPrev ? Number(dPrev.usuarios_activos) || 0 : 0;
    const prevTot = dPrev ? Number(dPrev.usuarios_totales) || 0 : 0;
    const prevCap = dPrev ? Number(dPrev.capitalizacion) || 0 : 0;
    const prevRend = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // Cálculos de porcentaje
    const pctSoc = prevAct ? Math.round(((act - prevAct) / prevAct) * 100) : 0;
    const pctTot = prevTot ? Math.round(((tot - prevTot) / prevTot) * 100) : 0;
    const pctCap = prevCap ? Math.round(((capAct - prevCap) / prevCap) * 100) : 0;
    const pctRend = prevRend ? Math.round(((rendAct - prevRend) / prevRend) * 100) : 0;

    // Actualizar DOM - valores absolutos
    document.getElementById('socios-porcentaje').innerText = act;
    document.getElementById('socios-totales').innerText = tot;
    document.getElementById('capital').innerText = `$${capAct.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `$${rendAct.toLocaleString()}`;

    // Deltas: Socios activos
    const deltaAct = formatoDelta(pctSoc);
    const deltaActCount = formatoDelta(act - prevAct, false);
    const elActDelta = document.getElementById('delta-socios');
    elActDelta.className = `delta ${deltaAct.signo}`;
    elActDelta.innerText = `${deltaActCount.texto} (${deltaAct.texto})`;

    // Deltas: Socios totales
    const deltaTotObj = formatoDelta(pctTot);
    const deltaTotCount = formatoDelta(tot - prevTot, false);
    const elTotDelta = document.getElementById('delta-totales');
    elTotDelta.className = `delta ${deltaTotObj.signo}`;
    elTotDelta.innerText = `${deltaTotCount.texto} (${deltaTotObj.texto})`;

    // Deltas: Capital total
    const deltaCapObj = formatoDelta(pctCap);
    const deltaCapCount = formatoDelta(capAct - prevCap, false);
    const elCapDelta = document.getElementById('delta-capital');
    elCapDelta.className = `delta ${deltaCapObj.signo}`;
    elCapDelta.innerText = `${deltaCapCount.texto} (${deltaCapObj.texto})`;

    // Deltas: Rendimiento
    const deltaRendObj = formatoDelta(pctRend);
    const deltaRendCount = formatoDelta(rendAct - prevRend, false);
    const elRendDelta = document.getElementById('delta-rendimiento');
    elRendDelta.className = `delta ${deltaRendObj.signo}`;
    elRendDelta.innerText = `${deltaRendCount.texto} (${deltaRendObj.texto})`;

  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
