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

// Formatea delta con valor y opcional porcentaje
function formatoDelta(valor, esPorcentaje = true) {
  const signo = valor >= 0 ? 'up' : 'down';
  const prefijo = valor >= 0 ? '+' : '-';
  const abs = Math.abs(valor);
  const texto = esPorcentaje ? `${prefijo}${abs}%` : `${prefijo}${abs}`;
  return { signo, texto };
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

    // Actual
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
      // Socios activos delta
      const deltaActCount = formatoDelta(act - prevAct, false);
      const deltaActPct = formatoDelta(Math.round(((act - prevAct) / (prevAct || 1)) * 100));
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${deltaActPct.signo}`;
      elSoc.innerText = `${deltaActCount.texto} (${deltaActPct.texto})`;

      // Socios totales delta
      const deltaTotCount = formatoDelta(tot - prevTot, false);
      const deltaTotPct = formatoDelta(Math.round(((tot - prevTot) / (prevTot || 1)) * 100));
      const elTot = document.getElementById('delta-totales');
      elTot.className = `delta ${deltaTotPct.signo}`;
      elTot.innerText = `${deltaTotCount.texto} (${deltaTotPct.texto})`;

      // Capital total delta
      const deltaCapCount = formatoDelta(capAct - prevCap, false);
      const deltaCapPct2 = formatoDelta(Math.round(((capAct - prevCap) / (prevCap || 1)) * 100));
      const elCap = document.getElementById('delta-capital');
      elCap.className = `delta ${deltaCapPct2.signo}`;
      elCap.innerText = `${deltaCapCount.texto} (${deltaCapPct2.texto})`;

      // Rendimiento delta
      const deltaRendCount = formatoDelta(rendAct - prevRend, false);
      const deltaRendPct2 = formatoDelta(Math.round(((rendAct - prevRend) / (prevRend || 1)) * 100));
      const elRen = document.getElementById('delta-rendimiento');
      elRen.className = `delta ${deltaRendPct2.signo}`;
      elRen.innerText = `${deltaRendCount.texto} (${deltaRendPct2.texto})`;
    }
  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
