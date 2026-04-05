import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editandoMinistroId = null;
let editandoId = null;
let escalasCache = {};
let calendar;

const ministrosRef = collection(db, "ministros");
const escalasRef = collection(db, "escalas");

window.login = async function () {
  await signInWithEmailAndPassword(auth, email.value, senha.value);
  alert("Logado!");
  carregarMinistros();
  carregarEscalas();
};

// =========================
// MINISTROS
// =========================
window.addMinistro = async function () {
  if (!ministro.value) return;

  const dados = {
    nome: ministro.value,
    telefone: telefone.value
  };

  if (editandoMinistroId) {
    await updateDoc(doc(db, "ministros", editandoMinistroId), dados);
    editandoMinistroId = null;
    alert("Atualizado!");
  } else {
    await addDoc(ministrosRef, dados);
    alert("Criado!");
  }

  ministro.value = "";
  telefone.value = "";

  carregarMinistros();
};

async function carregarMinistros() {
  const lista = document.getElementById("listaMinistros");
  const checkboxDiv = document.getElementById("checkboxMinistros");

  lista.innerHTML = "";
  checkboxDiv.innerHTML = "";

  const snapshot = await getDocs(ministrosRef);

  snapshot.forEach(docSnap => {
    const m = docSnap.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m.nome}</td>
      <td>${m.telefone || "-"}</td>
      <td>
        <button class="acao-btn edit" onclick="editarMinistro('${docSnap.id}', '${m.nome}', '${m.telefone}')">✏️</button>
        <button class="acao-btn delete" onclick="excluirMinistro('${docSnap.id}')">🗑️</button>
      </td>
    `;
    lista.appendChild(tr);

    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${m.nome}">
      ${m.nome}
    `;
    checkboxDiv.appendChild(label);
    checkboxDiv.appendChild(document.createElement("br"));
  });
}

window.editarMinistro = function (id, nome, telefoneVal) {
  ministro.value = nome;
  telefone.value = telefoneVal;
  editandoMinistroId = id;
};

window.excluirMinistro = async function (id) {
  if (!confirm("Excluir?")) return;
  await deleteDoc(doc(db, "ministros", id));
  carregarMinistros();
};

// =========================
// CALENDÁRIO
// =========================
function iniciarCalendario() {
  const el = document.getElementById("calendario");

  calendar = new FullCalendar.Calendar(el, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    height: 650,

    eventContent: function(arg) {
      return {
        html: `<div style="white-space: normal; font-size:12px;">
          ${arg.event.title}
        </div>`
      };
    },

    eventClick: function(info) {
      alert(
        "📅 Data: " + formatarDataBR(info.event.startStr.split("T")[0]) + "\n\n" +
        "⏰ Missa: " + info.event.extendedProps.missa + "\n\n" +
        "👥 Ministros:\n" + info.event.extendedProps.ministros.join("\n")
      );
    }
  });

  calendar.render();
}

// =========================
// ESCALAS
// =========================
window.salvarEscala = async function () {

  const selecionados = [...document.querySelectorAll("#checkboxMinistros input:checked")]
  .map(el => el.value)
  .sort((a, b) => a.localeCompare(b));
  
  if (!data.value || selecionados.length === 0) {
    alert("Preencha tudo");
    return;
  }

  const dados = {
    data: data.value,
    missa: formatarHorario(missa.value),
    ministros: selecionados
  };

  if (editandoId) {
    await updateDoc(doc(db, "escalas", editandoId), dados);
    editandoId = null;
  } else {
    await addDoc(escalasRef, dados);
  }

  limpar();
  carregarEscalas();
};

function limpar() {
  data.value = "";
  missa.value = "";
  document.querySelectorAll("#checkboxMinistros input").forEach(el => el.checked = false);
}

async function carregarEscalas() {
  const tabela = document.getElementById("escalas");
  tabela.innerHTML = "";
  escalasCache = {};

  const snapshot = await getDocs(escalasRef);

  if (!calendar) iniciarCalendario();
  calendar.removeAllEvents();

  snapshot.forEach(docSnap => {
    const e = docSnap.data();
    escalasCache[docSnap.id] = e;

    // tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatarDataBR(e.data)}</td>
      <td>${e.missa}</td>
      <td>${e.ministros.join(", ")}</td>
      <td>
        <button class="acao-btn edit" onclick="editarEscala('${docSnap.id}')">✏️</button>
        <button class="acao-btn delete" onclick="excluirEscala('${docSnap.id}')">🗑️</button>
      </td>
    `;
    tabela.appendChild(tr);

    // 📅 calendário (CORRIGIDO)
    let cor = "#3788d8"; // padrão

if (e.missa.includes("07")) cor = "#2196F3";      // azul
if (e.missa.includes("19")) cor = "#4CAF50";      // verde

calendar.addEvent({
  title: `${e.missa} - ${e.ministros.join(", ")}`,
  start: e.data + "T00:00:00",
  backgroundColor: cor,
  borderColor: cor,
  extendedProps: {
    missa: e.missa,
    ministros: e.ministros
  }
});
  });
}

window.editarEscala = function (id) {
  const e = escalasCache[id];

  editandoId = id;
  data.value = e.data;
  missa.value = e.missa;

  document.querySelectorAll("#checkboxMinistros input").forEach(el => {
    el.checked = e.ministros.includes(el.value);
  });
};

window.excluirEscala = async function (id) {
  if (!confirm("Excluir escala?")) return;
  await deleteDoc(doc(db, "escalas", id));
  carregarEscalas();
};

// =========================
// FORMATAÇÕES
// =========================
function formatarHorario(valor) {
  valor = valor.replace(/[^\d:]/g, "");
  if (!valor) return "";

  let partes = valor.split(":");

  let hora = partes[0] || "0";
  let minuto = partes[1] || "0";

  hora = hora.padStart(2, "0");
  minuto = minuto.padEnd(2, "0");

  let h = Math.min(parseInt(hora), 23);
  let m = Math.min(parseInt(minuto), 59);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}h`;
}

function formatarDataBR(dataISO) {
  const partes = dataISO.split("-");
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

missa.addEventListener("blur", () => {
  missa.value = formatarHorario(missa.value);
});

// iniciar
carregarMinistros();
carregarEscalas();
