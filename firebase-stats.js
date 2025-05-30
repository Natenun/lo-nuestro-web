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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper para formatear deltas
function formatoDelta(valor) {
  const signo = valor >= 0 ? 'up' : 'down';
  const flecha = valor >= 0 ? '▲' : '▼';
  return { signo, texto: `${flecha} ${Math.abs(valor)}%` };
}

async function cargarEstadisticas() {
  console.log('📡 Iniciando carga de estadísticas...');
  const meses = ['mayo_2025', 'abril_2025'];
  const refs = meses.map(m => doc(db, 'estadisticas', m));

  try {
    const snaps = await Promise.all(refs.map(r => getDoc(r)));
    const [snapActual, snapPrev] = snaps;

    if (!snapActual.exists()) {
      console.warn('⚠️ No existe el documento mayo_2025');
      return;
    }
    const dataActual = snapActual.data();
    const dataPrev = snapPrev.exists() ? snapPrev.data() : null;

    // Leer campos
    const actives = Number(dataActual.usuarios_activos) || 0;
    const totalSoc = Number(dataActual.usuarios_totales) || actives;
    const capitalAct = Number(dataActual.capitalizacion) || 0;

    // Porcentaje socios activos
    const porSocios = totalSoc > 0 ? Math.round((actives / totalSoc) * 100) : 0;

    // Calcular rendimiento basado en capital
    let rendimiento = 0;
    if (dataPrev && dataPrev.capitalizacion != null) {
      const capitalPrev = Number(dataPrev.capitalizacion) || 0;
      if (capitalPrev > 0) {
        rendimiento = Math.round(((capitalAct - capitalPrev) / capitalPrev) * 100);
      }
    }

    // Actualizar el DOM
    document.getElementById('socios-porcentaje').innerText = `${porSocios}%`;
    document.getElementById('socios-totales').innerText = `${totalSoc}`;
    document.getElementById('capital').innerText = `$${capitalAct.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `${rendimiento}%`;

    // Mostrar deltas si hay datos previos
    if (dataPrev) {
      // Delta socios activos porcentual
      const prevAct = Number(dataPrev.usuarios_activos) || 0;
      const prevTot = Number(dataPrev.usuarios_totales) || prevAct;
      const prevPor = prevTot > 0 ? Math.round((prevAct / prevTot) * 100) : 0;
      const deltaSoc = formatoDelta(porSocios - prevPor);
      const elDSoc = document.getElementById('delta-socios');
      elDSoc.className = `delta ${deltaSoc.signo}`;
      elDSoc.innerText = deltaSoc.texto;

      // Delta socios totales absolutos (convertir a % varia?)
      const deltaTotValue = totalSoc - prevTot;
      const deltaTot = { signo: deltaTotValue >= 0 ? 'up' : 'down', texto: `${deltaTotValue >= 0 ? '▲' : '▼'} ${Math.abs(deltaTotValue)}` };
      const elDTot = document.getElementById('delta-totales');
      elDTot.className = `delta ${deltaTot.signo}`;
      elDTot.innerText = deltaTot.texto;

      // Delta capital porcentual
      const deltaCap = formatoDelta(prevAct>0? Math.round(((capitalAct - (Number(dataPrev.capitalizacion)||0)) / (Number(dataPrev.capitalizacion)||1)) * 100):0);
      const elCap = document.getElementById('delta-capital');
      elCap.className = `delta ${deltaCap.signo}`;
      elCap.innerText = deltaCap.texto;

      // Delta rendimiento
      if (dataPrev.capitalizacion != null) {
        const prevRend = dataPrev.capitalizacion != null ? Math.round(((Number(dataPrev.capitalizacion)||0) - (Number(dataPrev.capitalizacion)||0)) / (Number(dataPrev.capitalizacion)||1) * 100) : 0;
        const deltaRen = formatoDelta(rendimiento - prevRend);
        const elRen = document.getElementById('delta-rendimiento');
        elRen.className = `delta ${deltaRen.signo}`;
        elRen.innerText = deltaRen.texto;
      }
    }
  } catch (err) {
    console.error('❌ Error al leer Firestore:', err);
  }
}

cargarEstadisticas();
