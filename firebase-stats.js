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
    const snaps = await Promise.all(
      meses.map(m => getDoc(doc(db, 'estadisticas', m)))
    );
    const [snapAct, snapPrev] = snaps;
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
    // Valor rendimientos (campo plural) del mes actual y previo
    const rendAct = Number(dAct.rendimientos) || 0;
    const rendPrev = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // % Socios activos
    const pctSoc = tot ? Math.round(act / tot * 100) : 0;

    // Actualizar DOM
    document.getElementById('socios-porcentaje').innerText = `${pctSoc}%`;
    document.getElementById('socios-totales').innerText = tot;
    document.getElementById('capital').innerText = `$${capAct.toLocaleString()}`;
    // Mostrar rendimientos en pesos
    document.getElementById('rendimiento').innerText = `$${rendAct.toLocaleString()}`;

    // Si hay prev, calcular deltas
    if (dPrev) {
      // Delta % Socios activos
      const prevAct = Number(dPrev.usuarios_activos) || 0;
      const prevTot = Number(dPrev.usuarios_totales) || prevAct;
      const prevPct = prevTot ? Math.round(prevAct / prevTot * 100) : 0;
      const dSoc = formatoDelta(pctSoc - prevPct);
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${dSoc.signo}`;
      elSoc.innerText = dSoc.texto;

      // Delta Socios totales (valor)
      const deltaTotVal = tot - prevTot;
      const dTot = { signo: deltaTotVal >= 0 ? 'up' : 'down', texto: `${deltaTotVal >= 0 ? '▲' : '▼'} ${Math.abs(deltaTotVal)}` };
      const elTot = document.getElementById('delta-totales');
      elTot.className = `delta ${dTot.signo}`;
      elTot.innerText = dTot.texto;

      // Delta Capital %
      const capPrev = Number(dPrev.capitalizacion) || 0;
      const capPctDelta = capPrev ? Math.round((capAct - capPrev) / capPrev * 100) : 0;
      const dCap = formatoDelta(capPctDelta);
      const elCap = document.getElementById('delta-capital');
      elCap.className = `delta ${dCap.signo}`;
      elCap.innerText = dCap.texto;

      // Delta Rendimientos %
      const deltaRenPct = rendPrev ? Math.round((rendAct - rendPrev) / rendPrev * 100) : 0;
      const dRen = formatoDelta(deltaRenPct);
      const elRen = document.getElementById('delta-rendimiento');
      elRen.className = `delta ${dRen.signo}`;
      elRen.innerText = dRen.texto;
    }
  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
