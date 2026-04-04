import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editandoId = null;
let editandoMinistroId = null;
let escalasCache = {};

window.login = async function () {
  await signInWithEmailAndPassword(auth, email.value, senha.value);

  alert("Logado!");
  carregarMinistros();
  carregarEscalas();
};

const ministrosRef = collection(db, "ministros");
const escalasRef = collection(db, "escalas");

window.addMinistro = async function () {
  if (!ministro.value) return;

  if (editandoMinistroId) {
    await updateDoc(doc(db, "ministros", editandoMinistroId), {
      nome: ministro.value
    });
    alert("Ministro atualizado!");
    editandoMinistroId = null;
  } else {
    await addDoc(ministrosRef, { nome: ministro.value });
    alert("Ministro criado!");
  }

  ministro.value = "";
  carregarMinistros();
};

async function carregarMinistros() {
  const lista = document.getElementById("listaMinistros");
  lista.innerHTML = "";

  const snapshot = await getDocs(ministrosRef);

  snapshot.forEach(docSnap => {
    const nome = docSnap.data().nome;

    const div = document.createElement("div");

    div.innerHTML = `
      <label>
        <input type="checkbox" value="${nome}">
        ${nome}
      </label>
    `;

    const btnEditar = document.createElement("button");
    btnEditar.innerText = "✏️";
    btnEditar.onclick = () => editarMinistro(docSnap.id, nome);

    const btnExcluir = document.createElement("button");
    btnExcluir.innerText = "🗑️";
    btnExcluir.onclick = () => excluirMinistro(docSnap.id);

    div.appendChild(btnEditar);
    div.appendChild(btnExcluir);

    lista.appendChild(div);
  });
}

window.editarMinistro = function (id, nome) {
  ministro.value = nome;
  editandoMinistroId = id;
  window.scrollTo(0, 0);
};

window.excluirMinistro = async function (id) {
  if (!confirm("Excluir ministro?")) return;

  await deleteDoc(doc(db, "ministros", id));

  alert("Ministro excluído!");
  carregarMinistros();
};

window.salvarEscala = async function () {
  const selecionados = [...document.querySelectorAll("#listaMinistros input:checked")]
    .map(el => el.value);

  if (!data.value || selecionados.length === 0) {
    alert("Preencha a data e selecione ministros");
    return;
  }

  const dados = {
    data: data.value,
    missa: formatarHorario(missa.value),
    ministros: selecionados
  };

  if (editandoId) {
    await updateDoc(doc(db, "escalas", editandoId), dados);
    alert("Escala atualizada!");
    editandoId = null;
  } else {
    await addDoc(escalasRef, dados);
    alert("Escala criada!");
  }

  limpar();
  carregarEscalas();
};

function limpar() {
  data.value = "";
  missa.value = "07h";
  document.querySelectorAll("#listaMinistros input").forEach(el => el.checked = false);
}

async function carregarEscalas() {
  const div = document.getElementById("escalas");
  div.innerHTML = "";
  escalasCache = {};

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(docSnap => {
    const e = docSnap.data();
    escalasCache[docSnap.id] = e;

    const item = document.createElement("div");

    item.innerHTML = `
      <b>${e.data} - ${e.missa}</b><br>
      ${e.ministros.join(", ")}<br><br>
    `;

    const btnEditar = document.createElement("button");
    btnEditar.innerText = "✏️ Editar";
    btnEditar.onclick = () => editar(docSnap.id);

    const btnExcluir = document.createElement("button");
    btnExcluir.innerText = "🗑️ Excluir";
    btnExcluir.onclick = () => excluir(docSnap.id);

    item.appendChild(btnEditar);
    item.appendChild(btnExcluir);

    div.appendChild(item);
    div.appendChild(document.createElement("hr"));
  });
}

window.editar = function (id) {
  const e = escalasCache[id];

  editandoId = id;

  data.value = e.data;
  missa.value = e.missa;

  document.querySelectorAll("#listaMinistros input").forEach(el => {
    el.checked = e.ministros.includes(el.value);
  });

  window.scrollTo(0, 0);
};

window.excluir = async function (id) {
  if (!confirm("Excluir escala?")) return;

  await deleteDoc(doc(db, "escalas", id));

  alert("Escala excluída!");
  carregarEscalas();
};

carregarMinistros();
carregarEscalas();

function formatarHorario(valor) {
  valor = valor.replace(/[^\d:]/g, "");

  if (!valor) return "";

  let partes = valor.split(":");

  let hora = partes[0] || "0";
  let minuto = partes[1] || "0";

  hora = hora.padStart(2, "0");

  if (minuto.length === 1) {
    minuto = minuto + "0";
  }

  minuto = minuto.padEnd(2, "0");

  let h = parseInt(hora);
  let m = parseInt(minuto);

  if (h > 23) h = 23;
  if (m > 59) m = 59;

  hora = h.toString().padStart(2, "0");
  minuto = m.toString().padStart(2, "0");

  return `${hora}:${minuto}h`;
}

const campoMissa = document.getElementById("missa");

campoMissa.addEventListener("blur", () => {
  campoMissa.value = formatarHorario(campoMissa.value);
});

