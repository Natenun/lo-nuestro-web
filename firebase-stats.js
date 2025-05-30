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
    console.log('✅ Datos actuales:', dataActual, 'Datos previos:', dataPrev);

    // Campos requeridos:
    // usuarios_activos, usuarios_totales, capitalizacion
    const actives = dataActual.usuarios_activos;
    const totalSoc = dataActual.usuarios_totales;
    const capital = dataActual.capitalizacion;

    // Cálculo de rendimiento si no existe campo 'rendimiento'
    let rendimiento = dataActual.rendimiento;
    if (rendimiento == null && dataPrev && dataPrev.capitalizacion) {
      rendimiento = Math.round((capital - dataPrev.capitalizacion) / dataPrev.capitalizacion * 100);
    }

    // Porcentaje socios activos
    const porSocios = Math.round((actives / totalSoc) * 100);

    // Actualizar el DOM
    document.getElementById('socios-porcentaje').innerText = `${porSocios}%`;
    document.getElementById('socios-totales').innerText = `${totalSoc}`;
    document.getElementById('capital').innerText = `$${capital.toLocaleString()}`;
    document.getElementById('rendimiento').innerText = `${rendimiento}%`;

    // Mostrar deltas usando datos previos
    if (dataPrev) {
      // delta socios activos
      const prevPor = Math.round((dataPrev.usuarios_activos / dataPrev.usuarios_totales) * 100);
      const deltaSoc = formatoDelta(porSocios - prevPor);
      const elDSoc = document.getElementById('delta-socios');
      elDSoc.classList.add(deltaSoc.signo);
      elDSoc.innerText = deltaSoc.texto;

      // delta socios totales
      const deltaTot = formatoDelta(totalSoc - dataPrev.usuarios_totales);
      const elDTot = document.getElementById('delta-totales');
      elDTot.classList.add(deltaTot.signo);
      elDTot.innerText = deltaTot.texto;

      // delta capital
      const deltaCap = formatoDelta(Math.round((capital - dataPrev.capitalizacion) / dataPrev.capitalizacion * 100));
      const elCap = document.getElementById('delta-capital');
      elCap.classList.add(deltaCap.signo);
      elCap.innerText = deltaCap.texto;

      // delta rendimiento
      if (rendimiento != null && dataPrev.rendimiento != null) {
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
