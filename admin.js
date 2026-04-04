import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ministrosRef = collection(db, "ministros");
const escalasRef = collection(db, "escalas");

// LOGIN
window.login = async function () {
  await signInWithEmailAndPassword(auth, email.value, senha.value);
  alert("Logado!");
  carregarMinistros();
  carregarEscalas();
};

// =======================
// MINISTROS
// =======================
window.addMinistro = async function () {
  if (!ministro.value) return;

  await addDoc(ministrosRef, {
    nome: ministro.value
  });

  ministro.value = "";
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

    // tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${m.nome}</td>`;
    lista.appendChild(tr);

    // checkbox
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" value="${m.nome}">
      ${m.nome}
    `;
    checkboxDiv.appendChild(label);
    checkboxDiv.appendChild(document.createElement("br"));
  });
}

// =======================
// ESCALAS
// =======================
window.salvarEscala = async function () {

  const selecionados = [...document.querySelectorAll("#checkboxMinistros input:checked")]
    .map(el => el.value);

  if (!data.value || selecionados.length === 0) {
    alert("Preencha tudo");
    return;
  }

  await addDoc(escalasRef, {
    data: data.value,
    missa: formatarHorario(missa.value),
    ministros: selecionados
  });

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

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(docSnap => {
    const e = docSnap.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${e.data}</td>
      <td>${e.missa}</td>
      <td>${e.ministros.join(", ")}</td>
    `;

    tabela.appendChild(tr);
  });
}

// =======================
// FORMATA HORÁRIO
// =======================
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

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

missa.addEventListener("blur", () => {
  missa.value = formatarHorario(missa.value);
});

// carregar ao abrir
carregarMinistros();
carregarEscalas();
