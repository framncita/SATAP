/* ============================================================
   SATAP - Gestión de estudiantes con localStorage (versión en español)
   ============================================================ */

/* ---------- Inicialización de datos base ---------- */
function inicializarDatosBase() {
  if (!localStorage.getItem("estudiantes")) {
    localStorage.setItem("estudiantes", JSON.stringify([]));
  }
  if (!localStorage.getItem("altoRiesgo")) {
    localStorage.setItem("altoRiesgo", JSON.stringify([]));
  }
}

/* ---------- Clasificación de riesgo ----------
   Usa asistencia (%) y nota (1.0 - 7.0) con estas reglas:

   - EXTREMO:
       asistencia < 23   Y  nota < 3.0
   - ALTO:
       asistencia < 30   Y  nota < 4.0   (y no cumple EXTREMO)
   - BAJO:
       asistencia entre 70 y 100  Y  nota entre 5.0 y 7.0
   - MODERADO:
       todos los demás casos
   --------------------------------------------------- */
function clasificarRiesgo(asistencia, nota) {
  let nivel = "MODERADO";
  let esAltoRiesgo = false;

  if (asistencia < 23 && nota < 3.0) {
    nivel = "EXTREMO";
    esAltoRiesgo = true;
  } else if (asistencia < 30 && nota < 4.0) {
    nivel = "ALTO";
    esAltoRiesgo = true;
  } else if (asistencia >= 70 && asistencia <= 100 && nota >= 5.0 && nota <= 7.0) {
    nivel = "BAJO";
    esAltoRiesgo = false;
  } else {
    // entre otras cosas, incluye:
    // - asistencia 23–29 con nota >= 4
    // - asistencia 30–69 con diferentes notas
    // - asistencia >= 50 y nota >= 5 pero asistencia < 70
    nivel = "MODERADO";
    esAltoRiesgo = false;
  }

  return { nivelRiesgo: nivel, esAltoRiesgo: esAltoRiesgo };
}

/* ---------- Helpers para trabajar con localStorage ---------- */
function obtenerEstudiantes() {
  const datos = localStorage.getItem("estudiantes");
  try {
    return datos ? JSON.parse(datos) : [];
  } catch (e) {
    console.error("Error al leer estudiantes desde localStorage:", e);
    return [];
  }
}

function guardarEstudiantes(listaEstudiantes) {
  localStorage.setItem("estudiantes", JSON.stringify(listaEstudiantes));
}

function obtenerAltoRiesgo() {
  const datos = localStorage.getItem("altoRiesgo");
  try {
    let lista = datos ? JSON.parse(datos) : [];
    // Filtramos registros dañados (sin nombre o correo)
    lista = lista.filter(
      (e) => e && e.nombre && e.correo && e.asistencia !== undefined && e.nota !== undefined
    );
    return lista;
  } catch (e) {
    console.error("Error al leer altoRiesgo desde localStorage:", e);
    return [];
  }
}

function guardarAltoRiesgo(listaAltoRiesgo) {
  localStorage.setItem("altoRiesgo", JSON.stringify(listaAltoRiesgo));
}

/* ---------- Migración sencilla ----------
   Limpia registros viejos sin nombre/correo y recalcula
   nivel de riesgo para todos los estudiantes ya guardados.
----------------------------------------- */
function migrarDatosExistentes() {
  const estudiantes = obtenerEstudiantes();
  const nuevosEstudiantes = [];
  const nuevaListaAlto = [];

  estudiantes.forEach((e) => {
    if (!e || !e.nombre || !e.correo) {
      return; // descartamos registros viejos rotos
    }

    const asistencia = Number(e.asistencia);
    const nota = Number(e.nota);
    const clasif = clasificarRiesgo(asistencia, nota);

    const estudianteNormalizado = {
      nombre: e.nombre,
      correo: e.correo,
      asistencia: asistencia,
      nota: nota,
      interacciones: Number(e.interacciones || 0),
      semanas: Number(e.semanas || 0),
      nivelRiesgo: clasif.nivelRiesgo,
      esAltoRiesgo: clasif.esAltoRiesgo
    };

    nuevosEstudiantes.push(estudianteNormalizado);
    if (clasif.esAltoRiesgo) {
      nuevaListaAlto.push(estudianteNormalizado);
    }
  });

  guardarEstudiantes(nuevosEstudiantes);
  guardarAltoRiesgo(nuevaListaAlto);
}

/* ============================================================
   SECCIÓN INDEX.HTML
   ============================================================ */

/* Mostrar estudiantes en el index (div#studentsList) */
function mostrarEstudiantesIndex() {
  const contenedor = document.getElementById("studentsList");
  if (!contenedor) return;

  const estudiantes = obtenerEstudiantes();
  contenedor.innerHTML = "";

  if (estudiantes.length === 0) {
    contenedor.innerHTML = `
      <div class="list-group-item">
        No hay estudiantes registrados.
      </div>`;
    return;
  }

  estudiantes.forEach(function (e) {
    const item = document.createElement("div");
    item.className = "list-group-item";

    const clasif = clasificarRiesgo(Number(e.asistencia), Number(e.nota));

    item.innerHTML = `
      <strong>${e.nombre}</strong> - ${e.correo}<br>
      Asistencia: ${e.asistencia}% |
      Nota: ${e.nota} |
      Semanas desde registro: ${e.semanas}<br>
      <em>Riesgo: ${clasif.nivelRiesgo}</em>
    `;
    contenedor.appendChild(item);
  });
}

/* Registrar estudiante desde el formulario de index.html */
function registrarEstudianteDesdeFormulario(evento) {
  if (evento) evento.preventDefault();

  const inputNombre = document.getElementById("nombre");
  const inputCorreo = document.getElementById("correo");
  const inputAsistencia = document.getElementById("asistencia");
  const inputNotas = document.getElementById("notas");
  const inputInteracciones = document.getElementById("interacciones");
  const inputSemanas = document.getElementById("semanas");

  if (
    !inputNombre ||
    !inputCorreo ||
    !inputAsistencia ||
    !inputNotas ||
    !inputSemanas
  ) {
    alert("No se encontraron los campos del formulario.");
    console.error(
      "Revisa que los IDs sean: nombre, correo, asistencia, notas, interacciones, semanas."
    );
    return;
  }

  const nombre = inputNombre.value.trim();
  const correo = inputCorreo.value.trim();
  const asistencia = Number(inputAsistencia.value);
  const nota = Number(inputNotas.value);
  const semanas = Number(inputSemanas.value);

  let interacciones = 0;
  if (inputInteracciones) {
    interacciones = inputInteracciones.value
      ? Number(inputInteracciones.value)
      : 0;
    inputInteracciones.value = interacciones;
  }

  if (!nombre || !correo || isNaN(asistencia) || isNaN(nota) || isNaN(semanas)) {
    alert("Por favor completa todos los campos correctamente.");
    return;
  }

  // Clasificación automática de riesgo
  const clasif = clasificarRiesgo(asistencia, nota);

  const estudiantes = obtenerEstudiantes();

  const nuevoEstudiante = {
    nombre: nombre,
    correo: correo,
    asistencia: asistencia,
    nota: nota,
    interacciones: interacciones,
    semanas: semanas,
    nivelRiesgo: clasif.nivelRiesgo,
    esAltoRiesgo: clasif.esAltoRiesgo
  };

  estudiantes.push(nuevoEstudiante);
  guardarEstudiantes(estudiantes);

  // Si es ALTO o EXTREMO, lo agregamos automáticamente a altoRiesgo
  if (clasif.esAltoRiesgo) {
    const listaAlto = obtenerAltoRiesgo();
    listaAlto.push(nuevoEstudiante);
    guardarAltoRiesgo(listaAlto);
  }

  // Mostrar resultado de riesgo
  mostrarResultadoRiesgo(nuevoEstudiante);

  // Limpiamos el formulario
  const formulario = document.getElementById("formStudent");
  if (formulario) {
    formulario.reset();
  }
  if (inputInteracciones) {
    inputInteracciones.value = 0;
  }

  alert("✅ Estudiante guardado correctamente.");

  mostrarEstudiantesIndex();
}

/* Mostrar resultado de riesgo en el div#predictionResult */
function mostrarResultadoRiesgo(estudiante) {
  const cajaPrediccion = document.getElementById("predictionResult");
  if (!cajaPrediccion) return;

  cajaPrediccion.classList.remove("d-none", "alert-danger", "alert-success");

  const clasif = clasificarRiesgo(
    Number(estudiante.asistencia),
    Number(estudiante.nota)
  );

  let mensaje = `Riesgo: <strong>${clasif.nivelRiesgo}</strong><br>
                 Asistencia: ${estudiante.asistencia}%<br>
                 Nota: ${estudiante.nota}`;

  if (clasif.nivelRiesgo === "EXTREMO" || clasif.nivelRiesgo === "ALTO") {
    cajaPrediccion.classList.add("alert-danger");
    mensaje +=
      "<br><strong>Medida sugerida:</strong> contactar al estudiante, coordinar tutorías y apoyo académico.";
  } else {
    cajaPrediccion.classList.add("alert-success");
    mensaje +=
      "<br><strong>Medida sugerida:</strong> mantener seguimiento regular y reforzar hábitos de estudio.";
  }

  cajaPrediccion.innerHTML = mensaje;
}

/* Limpiar formulario de index */
function limpiarFormularioIndex() {
  const formulario = document.getElementById("formStudent");
  if (formulario) {
    formulario.reset();
  }

  const inputInteracciones = document.getElementById("interacciones");
  if (inputInteracciones) {
    inputInteracciones.value = "";
  }

  const cajaPrediccion = document.getElementById("predictionResult");
  if (cajaPrediccion) {
    cajaPrediccion.classList.add("d-none");
    cajaPrediccion.innerHTML = "";
  }
}

/* ============================================================
   SECCIÓN DASHBOARD.HTML
   ============================================================ */

/* Mostrar estudiantes en el dashboard (div#panel-estudiantes) */
function mostrarEstudiantesDashboard() {
  const contenedor = document.getElementById("panel-estudiantes");
  if (!contenedor) return;

  const estudiantes = obtenerEstudiantes();
  contenedor.innerHTML = "";

  if (estudiantes.length === 0) {
    contenedor.innerHTML = "<p>No hay estudiantes registrados.</p>";
    return;
  }

  estudiantes.forEach(function (e, indice) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "card-estudiante";

    const clasif = clasificarRiesgo(Number(e.asistencia), Number(e.nota));

    tarjeta.innerHTML = `
      <strong>${e.nombre}</strong><br>
      Correo: ${e.correo}<br>
      Asistencia: ${e.asistencia}%<br>
      Nota: ${e.nota}<br>
      <em>Riesgo: ${clasif.nivelRiesgo}</em><br>
      <button class="btn btn-sm btn-warning" type="button" onclick="marcarAltoRiesgo(${indice})">
        🚨 Marcar Alto Riesgo
      </button>
      <button class="btn btn-sm btn-outline-danger" type="button" onclick="eliminarEstudiante(${indice})">
        🗑️ Eliminar
      </button>
    `;

    contenedor.appendChild(tarjeta);
  });
}

/* Marcar estudiante como alto riesgo (manual desde dashboard) */
function marcarAltoRiesgo(indice) {
  const estudiantes = obtenerEstudiantes();
  const listaAltoRiesgo = obtenerAltoRiesgo();

  const estudiante = estudiantes[indice];
  if (!estudiante) {
    alert("No se encontró el estudiante.");
    return;
  }

  const clasif = clasificarRiesgo(
    Number(estudiante.asistencia),
    Number(estudiante.nota)
  );

  estudiante.nivelRiesgo = clasif.nivelRiesgo;
  estudiante.esAltoRiesgo = clasif.esAltoRiesgo;
  guardarEstudiantes(estudiantes);

  if (clasif.esAltoRiesgo) {
    listaAltoRiesgo.push(estudiante);
    guardarAltoRiesgo(listaAltoRiesgo);
  }

  alert("🚨 Estudiante marcado como Alto Riesgo.");
  mostrarAltoRiesgoDashboard();
}

/* Mostrar lista de estudiantes de alto riesgo (ul#lista-alto-riesgo) */
function mostrarAltoRiesgoDashboard() {
  const lista = document.getElementById("lista-alto-riesgo");
  if (!lista) return;

  const altoRiesgo = obtenerAltoRiesgo();
  lista.innerHTML = "";

  if (altoRiesgo.length === 0) {
    lista.innerHTML = "<li>No hay estudiantes en riesgo.</li>";
    return;
  }

  altoRiesgo.forEach(function (e) {
    if (!e || !e.nombre || !e.correo) return;

    const clasif = clasificarRiesgo(Number(e.asistencia), Number(e.nota));

    let medida = "Mantener seguimiento y apoyo académico.";
    if (clasif.nivelRiesgo === "EXTREMO") {
      medida =
        "Contacto urgente, reunión con profesores y derivar a apoyo academico y psicologico.";
    } else if (clasif.nivelRiesgo === "ALTO") {
      medida =
        "Contactar en la semana, plan de tutorías y seguimiento cercano.";
    }

    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${e.nombre}</strong> - ${e.correo}<br>
      Asistencia: ${e.asistencia}% | Nota: ${e.nota}<br>
      Riesgo: <strong>${clasif.nivelRiesgo}</strong><br>
      <em>Medida sugerida: ${medida}</em>
    `;
    lista.appendChild(li);
  });
}

/* Eliminar estudiante (afecta tanto index como dashboard) */
function eliminarEstudiante(indice) {
  const estudiantes = obtenerEstudiantes();
  if (indice < 0 || indice >= estudiantes.length) return;

  const estudianteEliminado = estudiantes[indice];
  estudiantes.splice(indice, 1);
  guardarEstudiantes(estudiantes);

  // También lo eliminamos de altoRiesgo si estaba ahí
  let alto = obtenerAltoRiesgo();
  alto = alto.filter(
    (e) =>
      !(
        e.nombre === estudianteEliminado.nombre &&
        e.correo === estudianteEliminado.correo
      )
  );
  guardarAltoRiesgo(alto);

  mostrarEstudiantesDashboard();
  mostrarEstudiantesIndex();
}

/* Botón volver al inicio (para dashboard.html) */
function volverInicio() {
  window.location.href = "/";
}

/* ============================================================
   INICIALIZACIÓN GENERAL
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  inicializarDatosBase();
  migrarDatosExistentes(); // limpia y recalcula lo viejo

  // ------- Página INDEX -------
  const formulario = document.getElementById("formStudent");
  if (formulario) {
    const botonLimpiar = document.getElementById("clearBtn");
    const inputInteracciones = document.getElementById("interacciones");

    if (inputInteracciones && !inputInteracciones.value) {
      inputInteracciones.value = 0;
    }

    formulario.addEventListener("submit", registrarEstudianteDesdeFormulario);

    if (botonLimpiar) {
      botonLimpiar.addEventListener("click", function (e) {
        e.preventDefault();
        limpiarFormularioIndex();
      });
    }

    mostrarEstudiantesIndex();
  }

  // ------- Página DASHBOARD -------
  const panelDashboard = document.getElementById("panel-estudiantes");
  if (panelDashboard) {
    mostrarEstudiantesDashboard();
    mostrarAltoRiesgoDashboard();
  }
});