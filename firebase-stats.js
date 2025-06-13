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

// Formatea delta con signo y flecha
function formatoDelta(valor, esPorcentaje = true) {
  const signoClass = valor >= 0 ? 'up' : 'down';
  const abs = Math.abs(valor);
  if (esPorcentaje) {
    const flecha = valor >= 0 ? '▲' : '▼';
    const texto = `${flecha}${abs.toFixed(2)}%`;
    return { signo: signoClass, texto };
  } else {
    const prefijo = valor >= 0 ? '+' : '-';
    const texto = `${prefijo}${abs.toLocaleString('en-US')}`;
    return { signo: signoClass, texto };
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

    // Valores previos
    const prevAct = dPrev ? Number(dPrev.usuarios_activos) || 0 : 0;
    const prevTot = dPrev ? Number(dPrev.usuarios_totales) || 0 : 0;
    const prevCap = dPrev ? Number(dPrev.capitalizacion) || 0 : 0;
    const prevRend = dPrev ? Number(dPrev.rendimientos) || 0 : 0;

    // Actualizar DOM con valores actuales
    document.getElementById('socios-totales').innerText = tot.toLocaleString('en-US');
    document.getElementById('socios-porcentaje').innerText = act.toLocaleString('en-US');
    document.getElementById('capital').innerText = `$${capAct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('aportaciones').innerText = `$${rendAct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('capitalizacion').innerText = `$${capAct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (dPrev) {
      // Socios activos
      const deltaActCount = formatoDelta(act - prevAct, false);
      const deltaActPct = formatoDelta(((act - prevAct) / (prevAct || 1)) * 100, true);
      const elSoc = document.getElementById('delta-socios');
      elSoc.className = `delta ${deltaActPct.signo}`;
      elSoc.innerText = `${deltaActCount.texto} (${deltaActPct.texto})`;

      // Socios totales
      const deltaTotCount = formatoDelta(tot - prevTot, false);
      const deltaTotPct = formatoDelta(((tot - prevTot) / (prevTot || 1)) * 100, true);
      const elTot = document.getElementById('delta-totales');
      elTot.className = `delta ${deltaTotPct.signo}`;
      elTot.innerText = `${deltaTotCount.texto} (${deltaTotPct.texto})`;

      // Rendimiento (Aportaciones)
      const deltaRendCount = formatoDelta(rendAct - prevRend, false);
      const deltaRendPct = formatoDelta(((rendAct - prevRend) / (prevRend || 1)) * 100, true);
      const elRend = document.getElementById('delta-aportaciones');
      elRend.className = `delta ${deltaRendPct.signo}`;
      elRend.innerText = `${deltaRendCount.texto} (${deltaRendPct.texto})`;

      // Capitalización
      const deltaCapCount = formatoDelta(capAct - prevCap, false);
      const deltaCapPct = formatoDelta(((capAct - prevCap) / (prevCap || 1)) * 100, true);
      const elCap = document.getElementById('delta-capitalizacion');
      elCap.className = `delta ${deltaCapPct.signo}`;
      elCap.innerText = `${deltaCapCount.texto} (${deltaCapPct.texto})`;

      // Fondo colectivo (usamos mismo capital)
      const elCap2 = document.getElementById('delta-capital');
      elCap2.className = `delta ${deltaCapPct.signo}`;
      elCap2.innerText = `${deltaCapCount.texto} (${deltaCapPct.texto})`;
    }

  } catch (e) {
    console.error('Error Firebase:', e);
  }
}

cargarEstadisticas();
