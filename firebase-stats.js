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

// Formatea delta con flecha para porcentaje y signo para valor
function formatoDelta(valor, esPorcentaje = true) {
  const signoClass = valor >= 0 ? 'up' : 'down';
  const abs = Math.abs(valor);
  if (esPorcentaje) {
    const flecha = valor >= 0 ? '▲' : '▼';
    return { signo: signoClass, texto: `${flecha}${abs}%` };
  } else {
    const prefijo = valor >= 0 ? '+' : '-';
    return { signo: signoClass, texto: `${prefijo}${abs}` };
  }
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

    // Previos
    const prevAct = dPrev ? Number(dPrev.usuarios_activos) || 0 : 0;
    const prevTot = dPrev ? Number(dPrev.usuarios_totales) || 0 : 0;
    const prevCap = dPrev ? Number(dPrev.capitalizacion) || 0 : 0;
    const prevRend = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // Actualizar valores
    document.getElementById('socios-totales').innerText = tot;
    document.getElementById('socios-porcentaje').innerText = act;
    document.getElementById('capital').innerText = `$${capAct.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `$${rendAct.toLocaleString()}`;

    if (dPrev) {
      // Socios activos delta: count and percentage
      const deltaActCount = formatoDelta(act - prevAct, false);
      const deltaActPct = formatoDelta(Math.round(((act - prevAct) / (prevAct || 1)) * 100), true);
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${deltaActPct.signo}`;
      elSoc.innerText = `${deltaActCount.texto} (${deltaActPct.texto})`;

      // Socios totales delta
      const deltaTotCount = formatoDelta(tot - prevTot, false);
      const deltaTotPct = formatoDelta(Math.round(((tot - prevTot) / (prevTot || 1)) * 100), true);
      const elTot = document.getElementById('delta-totales');
      elTot.className = `delta ${deltaTotPct.signo}`;
      elTot.innerText = `${deltaTotCount.texto} (${deltaTotPct.texto})`;

      // Capital total delta
      const deltaCapCount = formatoDelta(capAct - prevCap, false);
      const deltaCapPct = formatoDelta(Math.round(((capAct - prevCap) / (prevCap || 1)) * 100), true);
      const elCap = document.getElementById('delta-capital');
      elCap.className = `delta ${deltaCapPct.signo}`;
      elCap.innerText = `${deltaCapCount.texto} (${deltaCapPct.texto})`;

      // Rendimiento delta
      const deltaRendCount = formatoDelta(rendAct - prevRend, false);
      const deltaRendPct = formatoDelta(Math.round(((rendAct - prevRend) / (prevRend || 1)) * 100), true);
      const elRen = document.getElementById('delta-rendimiento');
      elRen.className = `delta ${deltaRendPct.signo}`;
      elRen.innerText = `${deltaRendCount.texto} (${deltaRendPct.texto})`;
    }
  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
