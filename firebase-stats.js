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
  // Documentos de meses
  const meses = ['mayo_2025', 'abril_2025'];
  const refs = meses.map(m => doc(db, 'estadisticas', m));

  try {
    // Cargar ambos docs
    const snaps = await Promise.all(refs.map(r => getDoc(r)));
    const [snapActual, snapPrev] = snaps;

    if (!snapActual.exists()) {
      console.warn('⚠️ No existe el documento mayo_2025');
      return;
    }
    if (!snapPrev.exists()) {
      console.warn('⚠️ No existe el documento abril_2025');
    }

    const dataActual = snapActual.data();
    const dataPrev = snapPrev.exists() ? snapPrev.data() : null;
    console.log('✅ Datos actuales:', dataActual, 'Datos previos:', dataPrev);

    // Cálculos
    // 1. % Socios activos (respecto a usuarios_totales)
    const sociosAct = dataActual.usuarios_activos;
    const sociosTot = dataActual.usuarios_totales || sociosAct;
    const porSocios = Math.round((sociosAct / sociosTot) * 100);

    // 2. Capital total
    const capital = dataActual.capitalizacion;

    // 3. Rendimiento (campo existente en el doc)
    const rendimiento = dataActual.rendimiento ?? 0;

    // Actualizar el DOM
    document.getElementById('socios-porcentaje').innerText = `${porSocios}%`;
    document.getElementById('capital').innerText = `$${capital.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `${rendimiento}%`;

    // Calcular y mostrar deltas si hay datos previos
    if (dataPrev) {
      // delta socios
      const prevPorSocios = Math.round((dataPrev.usuarios_activos / (dataPrev.usuarios_totales || dataPrev.usuarios_activos)) * 100);
      const deltaSoc = formatoDelta(porSocios - prevPorSocios);
      const elSoc = document.getElementById('delta-socios');
      elSoc.classList.add(deltaSoc.signo);
      elSoc.innerText = deltaSoc.texto;

      // delta capital
      const deltaCap = formatoDelta(Math.round((capital - dataPrev.capitalizacion) / dataPrev.capitalizacion * 100));
      const elCap = document.getElementById('delta-capital');
      elCap.classList.add(deltaCap.signo);
      elCap.innerText = deltaCap.texto;

      // delta rendimiento
      if (dataPrev.rendimiento != null) {
        const deltaRen = formatoDelta(rendimiento - dataPrev.rendimiento);
        const elRen = document.getElementById('delta-rendimiento');
        elRen.classList.add(deltaRen.signo);
        elRen.innerText = deltaRen.texto;
      }
    }
  } catch (err) {
    console.error('❌ Error al leer Firestore:', err);
  }
}

// Ejecuta la carga al inicio
cargarEstadisticas();
