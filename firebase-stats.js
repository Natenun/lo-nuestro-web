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
    const rendAct = Number(dAct.rendimientos) || 0;
    const rendPrev = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // Cálculo porcentual socios activos para delta
    const pctSoc = tot ? Math.round((act - (dPrev ? Number(dPrev.usuarios_activos) || 0 : 0)) / (dPrev ? Number(dPrev.usuarios_activos) || 1 : act) * 100) : 0;

    // Actualizar DOM con valor absoluto de activos
    document.getElementById('socios-totales').innerText = tot;
    document.getElementById('socios-porcentaje').innerText = act;
    document.getElementById('capital').innerText = `$${capAct.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `$${rendAct.toLocaleString()}`;

    // Si hay datos previos, calcular deltas
    if (dPrev) {
      // Delta Socios totales
      const prevTot = Number(dPrev.usuarios_totales) || 0;
      const dTotVal = tot - prevTot;
      const dTot = { signo: dTotVal >= 0 ? 'up' : 'down', texto: `${dTotVal >= 0 ? '▲' : '▼'} ${Math.abs(dTotVal)}` };
      const elTot = document.getElementById('delta-totales');
      elTot.className = `delta ${dTot.signo}`;
      elTot.innerText = dTot.texto;

            // Delta Socios activos: cantidad y porcentaje
      const prevAct = Number(dPrev.usuarios_activos) || 0;
      const countDelta = act - prevAct;
      const pctDelta = pctSoc; // ya calculado
      const dSocSigno = countDelta >= 0 ? 'up' : 'down';
      const flechaSoc = countDelta >= 0 ? '▲' : '▼';
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${dSocSigno}`;
      elSoc.innerText = `${flechaSoc} ${Math.abs(countDelta)} (${pctDelta}%)`;
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${dSoc.signo}`;
      elSoc.innerText = dSoc.texto;

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
