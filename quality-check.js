const assert = require("assert");
const fs = require("fs");
const path = require("path");

const questions = JSON.parse(fs.readFileSync(path.join(__dirname, "questions.json"), "utf8"));
const reference = JSON.parse(fs.readFileSync(path.join(__dirname, "reference.json"), "utf8"));

const TIPOS = ["caso", "clasificar", "concepto", "norma"];

const NEW_UNITS = {
  propiedad_intelectual: "propiedad intelectual/resumen_propiedad_intelectual.md",
  contratos: "contratos/resumen_contratos.md",
  derecho_laboral: "derecho laboral/resumen_derecho_laboral.md",
  ejercicio_profesional: "ejercicio profesional/resumen_ejercicio_profesional.md"
};
const EXPECTED_UNITS = ["derecho_y_estado", "derecho_penal", "delitos_informaticos", "proteccion_datos", ...Object.keys(NEW_UNITS)];
assert.deepStrictEqual(reference.unidades.map((unit) => unit.key), EXPECTED_UNITS, "el juego debe incluir las ocho unidades de la materia");

for (const unitKey of Object.keys(NEW_UNITS)) {
  const entries = Object.values(reference.entradas).filter((entry) => entry.unidad === unitKey);
  assert(!entries.some((entry) => entry.archivoFuente || entry.categoria === "Resumen completo"), `${unitKey}: el libro no debe duplicar los apartados con un resumen completo`);
  assert(entries.length >= 10, `${unitKey}: deben conservarse los apartados temáticos`);
  for (const entry of entries) {
    const notes = entry.notas.map((note) => note.trim().toLowerCase().replace(/\s+/g, " "));
    assert.equal(new Set(notes).size, notes.length, `${unitKey}: hay notas idénticas repetidas en ${entry.titulo}`);
  }
}

// Cobertura por apartado, incluidos detalles que antes solo aparecían en los resúmenes completos.
const INTEGRATED_BOOK_COVERAGE = {
  pi_obras_organismos: ["DNDA", "INPI", "WIPO", "25.036"],
  pi_autoria: ["artículo 3", "retracto", "paternidad", "integridad", "independiente"],
  pi_software: ["55 bis", "NDA", "salvaguardia", "royalties", "DRM", "competencia desleal"],
  pi_registro_plazos: ["70", "57", "63", "derivada", "conexos", "FNA", "CAL", "CAPIF", "SADAIC"],
  pi_cc: ["BY", "NC", "SA", "ND", "software"],
  pi_marcas: ["denominativa", "figurativa", "mixta", "naming", "fonéticas"],
  pi_tramite_marca: ["45", "34", "11", "TMclass", "10 años", "30 días"],
  pi_invenciones_tratados: ["20 años", "10 años", "París", "Berna", "Roma", "ADPIC", "WCT", "PCT", "FIFA"],
  pi_dominios: ["DNS", "ICANN", "ARIU", "2/2022", "renovación"],
  pi_disputas_redes: ["UDRP", "cancelación", "transferencia", "Pugliese/PSA", "Mc Donough", "Hermès", "squatting"],
  ct_formacion: ["972", "973", "978", "979", "980", "983"],
  ct_validez: ["1003", "1012", "970", "1021", "1027", "sucesores"],
  ct_tratativas: ["990", "991", "992", "993", "985", "1061", "demostraciones"],
  ct_forma_prueba: ["286", "287", "1019", "1020", "testigos", "autenticidad"],
  ct_consumo: ["1106", "1109", "1111", "1116", "diez días", "34"],
  ct_modalidades: ["licencia", "cesión", "escrow", "hosting", "housing", "llave en mano"],
  ct_entrega: ["provisoria", "definitiva", "SLA", "moneda", "ajustes", "tratamiento de datos"],
  ct_incumplimiento: ["1031", "1032", "evicción", "redhibitorio", "1054", "1055", "1057", "1059", "1076"],
  ct_firmas: ["25.506", "electrónica", "autoría", "integridad", "prueba en contrario", "impugna"],
  ct_infraestructura: ["privada", "pública", "revocación", "licenciado", "182/2019", "2628/2002"],
  dl_dependencia: ["técnica", "económica", "jurídica", "primacía", "27.802", "23"],
  dl_principios_cct: ["14 bis", "irrenunciabilidad", "23.551", "paritarias", "confidencialidad"],
  dl_contrato_prueba: ["plazo fijo", "eventual", "temporada", "92 bis", "27.742", "seis meses"],
  dl_remuneracion: ["bruto", "neto", "30 de junio", "18 de diciembre", "50 %"],
  dl_jornada_guardias: ["11.544", "48", "12 horas", "201", "guardia", "27.802"],
  dl_licencias: ["14 días", "21", "28", "35", "155", "158", "208", "211", "90 días"],
  dl_extincion: ["240", "242", "243", "245 bis", "178", "indirecto"],
  dl_indemnizaciones: ["232", "233", "245", "67 %", "27.802", "preaviso"],
  dl_riesgos: ["24.557", "in itinere", "enfermedad profesional", "Comisiones Médicas"],
  dl_reclamos_prueba: ["24.635", "homologación", "VPN", "cautelar", "embarazo"],
  ep_habilitacion: ["6070/1958", "14.467", "11 y 12", "gratuitas", "jurisdicción"],
  ep_instituciones: ["COPITEC", "CPCIBA", "13.016", "10.416", "CPCI", "CESSI"],
  ep_etica: ["1099/1984", "240/1999", "2.2.1.4", "reserva", "concursos", "colegas"],
  ep_disciplina: ["ratificación", "tres meses", "cinco días hábiles", "diez días hábiles", "seis días", "treinta días", "tres años", "moneda nacional"],
  ep_convenio: ["Anexos Operativos Complementarios", "propiedad común", "no exclusividad", "treinta días corridos", "Quilmes"],
  ep_riesgo_cid: ["confidencialidad", "integridad", "disponibilidad", "amenaza", "vulnerabilidad", "riesgo"],
  ep_controles: ["preventivo", "detectivo", "respuesta", "forense", "800-63B-4", "MFA"],
  ep_continuidad: ["BCP", "DRP", "RTO", "RPO", "restauración"],
  ep_equipos_ot: ["Red Team", "Blue Team", "Purple Team", "MTTD", "MTTR", "SGSI", "62443", "SCADA"],
  ep_normas_ciber: ["CSF 2.0", "Gobernar", "27.401", "856/2020", "47/2018", "1768", "1757"]
};
for (const [entryKey, fragments] of Object.entries(INTEGRATED_BOOK_COVERAGE)) {
  const entry = reference.entradas[entryKey];
  assert(entry, `falta el apartado temático ${entryKey}`);
  const text = [entry.titulo, ...[].concat(entry.intro || []), ...entry.notas, ...[].concat(entry.pasos || []), ...entry.ejemplos, entry.ojo].join(" ").toLowerCase();
  for (const fragment of fragments) {
    assert(text.includes(fragment.toLowerCase()), `${entryKey}: falta integrar en este apartado el contenido de ${fragment}`);
  }
}

const embeddedHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
for (const name of ["questions", "reference", "definitions", "errors", "glossary"]) {
  const match = embeddedHtml.match(new RegExp(`<script id="${name}-data" type="application/json">([\\s\\S]*?)<\\/script>`));
  assert(match, `falta el bloque incrustado ${name}`);
  assert.deepStrictEqual(JSON.parse(match[1]), JSON.parse(fs.readFileSync(path.join(__dirname, `${name}.json`), "utf8")), `${name}: el HTML no contiene los datos actualizados`);
}

assert(questions.length >= 140, "el banco debe tener al menos 140 casos");

for (const item of questions) {
  const where = `[${item.id}]`;
  assert(TIPOS.includes(item.tipo), `${where} tipo invalido: ${item.tipo}`);
  assert(item.titulo && item.titulo.length <= 40, `${where} falta titulo corto del caso`);
  assert(item.situacion && item.situacion.length >= 40, `${where} la situacion debe contar un caso`);
  assert(item.pregunta.trim().endsWith("?"), `${where} la pregunta debe terminar en signo de pregunta`);
  assert.equal(item.respuestasIncorrectas.length, 5, `${where} debe haber 5 distractores`);

  const allAnswers = [item.respuestaCorrecta, ...item.respuestasIncorrectas];
  assert.equal(new Set(allAnswers.map((a) => a.toLowerCase())).size, 6, `${where} hay opciones repetidas`);

  assert(item.pista && item.pista.length >= 20, `${where} falta una pista especifica`);
  assert(!item.pista.includes(item.respuestaCorrecta), `${where} la pista no debe contener la respuesta`);
  assert(item.explicacion && item.explicacion.length >= 40, `${where} falta la explicacion posterior`);

  const entry = reference.entradas[item.referencia.entradaLibro];
  assert(entry, `${where} la entrada del libro no existe`);
  assert.equal(entry.unidad, item.unidad, `${where} la entrada del libro es de otra unidad`);
}

const unitCounts = {};
for (const item of questions) unitCounts[item.unidad] = (unitCounts[item.unidad] || 0) + 1;
for (const unit of reference.unidades) {
  assert(unitCounts[unit.key] >= 25, `la unidad ${unit.titulo} debe tener al menos 25 casos`);
}

// Clasificacion de dolo y culpa: debe haber varios casos que pidan identificar la forma.
const doloCases = questions.filter((item) => /dolo|culpa/i.test(item.respuestaCorrecta) && item.tipo === "clasificar");
assert(doloCases.length >= 6, "debe haber al menos 6 casos para clasificar dolo y culpa");
for (const form of ["Dolo directo de primer grado", "Dolo directo de segundo grado", "Dolo eventual", "Culpa con representación", "Culpa sin representación"]) {
  assert(doloCases.some((item) => item.respuestaCorrecta.startsWith(form)), `falta un caso cuya respuesta sea ${form}`);
}

const requiredFragments = [
  "art. 14", "art. 16", "10 días corridos", "5 días hábiles", "2 años", "derecho al olvido", "Veraz",
  "estadístico", "RGPD", "AAIP 47/2018", "75 inc. 22", "art. 90", "art. 50", "art. 56", "art. 45",
  "juez natural", "art. 19", "habeas corpus", "habeas data", "amparo", "tipificar", "legalidad",
  "analogía", "legítima defensa", "inimputable", "tentativa", "concurso real", "concurso ideal",
  "reincidencia", "imprudencia", "negligencia", "impericia", "inobservancia", "calumnia", "injuria",
  "hurto", "robo", "usurpación", "estafa", "extorsión", "chantaje", "usura", "falso testimonio",
  "apología", "acción privada", "instancia privada", "emoción violenta", "debilitación", "perito",
  "InfoLEG", "fe pública", "impuro", "puro", "26.388", "acceso ilegítimo", "daño informático",
  "fraude informático", "grooming", "27.436", "Olimpia", "Budapest", "ransomware", "doble extorsión",
  "phishing", "ingeniería social", "malware", "integridad", "confidencialidad", "disponibilidad",
  "defensa en profundidad", "Red Team", "Blue Team", "vCISO", "retest", "gap", "gray hat",
  "finalidad", "calidad", "consentimiento", "art. 9", "biométrico", "privacidad desde el diseño"
];

const corpus = questions
  .map((item) => [item.situacion, item.pregunta, item.respuestaCorrecta, item.explicacion].join(" "))
  .join(" ")
  .toLowerCase();

for (const fragment of requiredFragments) {
  assert(corpus.includes(fragment.toLowerCase()), `debe existir un caso sobre: ${fragment}`);
}

for (const [key, entry] of Object.entries(reference.entradas)) {
  const intro = [].concat(entry.intro || []).join(" ");
  assert(intro.length >= 80, `la entrada ${key} necesita una introduccion explicativa`);
  assert(entry.notas.length >= 3, `la entrada ${key} necesita al menos 3 puntos clave`);
  assert(entry.ejemplos && entry.ejemplos.length >= 1, `la entrada ${key} necesita al menos un ejemplo`);
  if (entry.categoria !== "Empezá por acá") {
    assert(questions.some((item) => item.referencia.entradaLibro === key), `la entrada ${key} no la usa ningun caso`);
  }
}

for (const unit of reference.unidades.filter((unit) => unit.key !== "proteccion_datos")) {
  assert(
    Object.values(reference.entradas).some((entry) => entry.unidad === unit.key && entry.categoria === "Empezá por acá"),
    `la unidad ${unit.titulo} debe empezar con un glosario de palabras basicas`
  );
}

assert(!reference.entradas.pd_glosario, "Protección de Datos debe explicar los conceptos en sus apartados, sin una sección básica repetida");
for (const label of ["Dato personal", "Dato sensible", "Dato estadístico (o disociado)", "Titular de los datos", "Base de datos", "Responsable de la base de datos", "Tratamiento de datos"]) {
  assert(reference.entradas.pd_conceptos.notas.some((note) => note.startsWith(`${label}:`)), `el apartado de conceptos debe conservar la explicación de ${label}`);
}

console.log(`${questions.length} casos y ${Object.keys(reference.entradas).length} entradas del libro validados`);

const definitions = JSON.parse(fs.readFileSync(path.join(__dirname, "definitions.json"), "utf8"));
assert(definitions.length >= 80, "debe haber al menos 80 definiciones");
for (const unit of reference.unidades) {
  const minimum = NEW_UNITS[unit.key] ? 18 : 15;
  assert(definitions.filter((item) => item.unidad === unit.key).length >= minimum, `la unidad ${unit.titulo} necesita al menos ${minimum} definiciones`);
}
for (const item of definitions) {
  assert(item.respuestasIncorrectas.length >= 2, `[${item.id}] necesita al menos 2 distractores del mismo grupo`);
  assert(!item.respuestasIncorrectas.includes(item.respuestaCorrecta), `[${item.id}] un distractor repite la definicion correcta`);
  assert(item.pregunta.endsWith("?"), `[${item.id}] la pregunta debe terminar en signo de pregunta`);
  assert(reference.entradas[item.referencia.entradaLibro].unidad === item.unidad, `[${item.id}] la entrada del libro es de otra unidad`);
}
console.log(`${definitions.length} definiciones validadas`);

// Encontrá el error: textos de 5 oraciones con exactamente una incorrecta, que no se delate por la forma.
const errors = JSON.parse(fs.readFileSync(path.join(__dirname, "errors.json"), "utf8"));
const ABSOLUTE = /\b(siempre|nunca|jamás|todos|todas|ninguno|ninguna|cualquier)\b/i;
for (const unit of reference.unidades) {
  assert(errors.filter((item) => item.unidad === unit.key).length >= 8, `la unidad ${unit.titulo} necesita al menos 8 textos de encontrar el error`);
}
for (const item of errors) {
  const where = `[${item.id}]`;
  assert(item.titulo && item.titulo.length <= 40, `${where} falta titulo corto`);
  assert.equal(item.oraciones.length, 5, `${where} debe tener 5 oraciones`);
  assert(Number.isInteger(item.incorrecta) && item.oraciones[item.incorrecta], `${where} la oracion incorrecta no existe`);
  assert.equal(new Set(item.oraciones).size, 5, `${where} hay oraciones repetidas`);
  const wrong = item.oraciones[item.incorrecta];
  assert(item.correccion && item.correccion !== wrong, `${where} la correccion debe cambiar la oracion incorrecta`);
  assert(!ABSOLUTE.test(wrong) || item.oraciones.some((s, i) => i !== item.incorrecta && ABSOLUTE.test(s)), `${where} la oracion incorrecta no debe delatarse con palabras absolutas`);
  const longestValid = Math.max(...item.oraciones.filter((_, i) => i !== item.incorrecta).map((s) => s.length));
  assert(wrong.length <= longestValid + 15, `${where} la oracion incorrecta es notoriamente la mas larga`);
  assert(item.pista && item.pista.length >= 20 && !item.pista.includes(item.correccion), `${where} falta una pista que no revele la correccion`);
  assert(item.explicacion.includes(item.correccion), `${where} la explicacion debe mostrar la oracion corregida`);
  const entry = reference.entradas[item.referencia.entradaLibro];
  assert(entry && entry.unidad === item.unidad, `${where} la entrada del libro no existe o es de otra unidad`);
}
console.log(`${errors.length} textos de encontrar el error validados`);

// Una pista tiene que ayudar a elegir: nunca puede limitarse a mandar al libro de consulta.
for (const item of [...questions, ...definitions, ...errors]) {
  assert(!/revis[aá] la entrada|libro de consulta/i.test(item.pista), `[${item.id}] la pista solo manda al libro: ${item.pista}`);
  assert(!item.pista.includes(item.respuestaCorrecta), `[${item.id}] la pista no debe contener la respuesta`);
}
// En las definiciones, la pista no puede compartir palabras clave con la definicion correcta que no esten
// tambien en las otras definiciones del grupo: el jugador elegiria por coincidencia de palabras, sin entender.
const HINT_STOP = new Set(("para como cuando donde porque pero sobre entre desde hasta este esta esto estos estas ese esa eso esos esas " +
  "aquel cada otro otra otros otras todo toda todos todas puede pueden tiene tienen tener hace hacer hacia hacian hizo algo alguien " +
  "solo sola tambien estan fueron sido sera seria haber habia hubo muy mismo misma mismos mismas segun aunque " +
  "mientras durante antes despues luego entonces tanto siempre nunca nada nadie ninguno ninguna cual cuales quien quienes " +
  "pensa ejemplo ejemplos caso casos dice decir dijo forma formas parte partes tipo tipos").split(" "));
const HINT_STOP_STEMS = new Set([...HINT_STOP].map((word) => word.slice(0, 5)));
const keyStems = (text) => new Set(text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !HINT_STOP.has(word))
  .map((word) => word.slice(0, 5)).filter((stem) => !HINT_STOP_STEMS.has(stem)));
for (const item of definitions) {
  const visible = keyStems(item.titulo);
  const others = new Set(item.respuestasIncorrectas.flatMap((text) => [...keyStems(text)]));
  const correct = keyStems(item.respuestaCorrecta);
  const leaked = [...keyStems(item.pista)].filter((stem) => correct.has(stem) && !others.has(stem) && !visible.has(stem));
  assert(!leaked.length, `[${item.id}] la pista repite palabras de la definicion correcta (${leaked.join(", ")}): ${item.pista}`);
}
console.log("pistas validadas");

// Glosario: cada palabra se usa en algun texto donde se muestra, y solo marca el sentido correcto.
const glossary = JSON.parse(fs.readFileSync(path.join(__dirname, "glossary.json"), "utf8"));
const glossedTexts = [
  ...questions.flatMap((item) => [item.situacion, item.pregunta, item.pista, item.explicacion]),
  ...definitions.flatMap((item) => [item.titulo, item.pregunta, item.pista, item.explicacion]),
  ...errors.flatMap((item) => [item.situacion, item.pista, item.explicacion]),
  ...[...questions, ...definitions, ...errors].flatMap((item) => [item.respuestaCorrecta, ...item.respuestasIncorrectas])
];
for (const entry of glossary) {
  assert(entry.definicion.length >= 20 && entry.definicion.length <= 160, `[glosario ${entry.id}] la definicion debe ser corta (20 a 160 caracteres)`);
  const regex = new RegExp(entry.source, "iu");
  assert(glossedTexts.some((text) => regex.test(text)), `[glosario ${entry.id}] no aparece en ningun texto del juego`);
}
const glossaryRegex = (id) => new RegExp(glossary.find((entry) => entry.id === id).source, "iu");
for (const [id, aliases] of Object.entries({ aaip: ["AAIP"], dnpdp: ["DNPDP"], rgpd: ["RGPD", "GDPR"] })) {
  assert(glossary.some((entry) => entry.id === id), `el glosario debe explicar la sigla ${id}`);
  for (const alias of aliases) {
    assert(glossaryRegex(id).test(`(${alias})`), `el glosario debe reconocer ${alias}`);
    assert(!glossaryRegex(id).test(`prefijo${alias}extra`), `${alias} debe reconocerse como una palabra completa`);
  }
}
assert(glossaryRegex("forma").test("Forma federal") && !glossaryRegex("forma").test("forma parte de"), "el glosario debe marcar «forma federal» pero no «forma parte de»");
assert(!glossaryRegex("bis").test("bisagra") && glossaryRegex("bis").test("art. 153 bis"), "el glosario debe marcar «bis» solo despues de un numero de articulo");
// Un tooltip no puede delatar la respuesta del desafio donde aparece: su definicion no puede compartir
// palabras clave con la respuesta correcta que no esten tambien en las otras opciones o en el texto visible.
for (const item of [...questions, ...definitions, ...errors]) {
  const visibleText = [item.titulo, item.situacion, item.pregunta, item.pista].filter(Boolean).join(" ");
  const visible = keyStems(visibleText);
  const others = new Set(item.respuestasIncorrectas.flatMap((text) => [...keyStems(text)]));
  const correct = keyStems(item.respuestaCorrecta);
  const options = [item.respuestaCorrecta, ...item.respuestasIncorrectas];
  for (const entry of glossary) {
    // Las siglas son ayudas de lectura solicitadas: su nombre completo puede coincidir con las opciones.
    if (entry.tipo === "sigla") continue;
    const regex = new RegExp(entry.source, "iu");
    // En las opciones, el juego solo marca palabras que aparecen en al menos dos de ellas.
    const shownInOptions = options.filter((text) => regex.test(text)).length >= 2;
    if (!regex.test(visibleText) && !shownInOptions) continue;
    const leaked = [...keyStems(entry.definicion)].filter((stem) => correct.has(stem) && !others.has(stem) && !visible.has(stem));
    assert(!leaked.length, `[${item.id}] el tooltip de «${entry.termino}» delata la respuesta (${leaked.join(", ")})`);
  }
}
console.log(`${glossary.length} palabras del glosario validadas`);

// Toda nota del libro con formato "Rotulo: explicacion" debe mostrar el rotulo en negrita.
const gameSource = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
const labelEndSource = gameSource.slice(gameSource.indexOf("function labelEnd"), gameSource.indexOf("\n}", gameSource.indexOf("function labelEnd")) + 2);
const labelEnd = new Function(`${labelEndSource}; return labelEnd;`)();
for (const [key, entry] of Object.entries(reference.entradas)) {
  for (const note of entry.notas) {
    if (note.includes(": ")) {
      assert(labelEnd(note) !== -1, `[${key}] la nota no muestra su rotulo en negrita: ${note.slice(0, 60)}`);
    }
  }
}
console.log("rotulos del libro validados");
