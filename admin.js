import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editandoId = null;
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
  await addDoc(ministrosRef, { nome: ministro.value });
  ministro.value = "";
  carregarMinistros();
};

async function carregarMinistros() {
  const lista = document.getElementById("listaMinistros");
  lista.innerHTML = "";

  const snapshot = await getDocs(ministrosRef);

  snapshot.forEach(docSnap => {
    lista.innerHTML += `
      <label>
        <input type="checkbox" value="${docSnap.data().nome}">
        ${docSnap.data().nome}
      </label><br>
    `;
  });
}

window.salvarEscala = async function () {
  const selecionados = [...document.querySelectorAll("#listaMinistros input:checked")]
    .map(el => el.value);

  if (!data.value || selecionados.length === 0) {
    alert("Preencha a data e selecione ministros");
    return;
  }

  const dados = {
    data: data.value,
    missa: missa.value,
    ministros: selecionados
  };

  if (editandoId) {
    await updateDoc(doc(db, "escalas", editandoId), dados);
    alert("Atualizado!");
    editandoId = null;
  } else {
    await addDoc(escalasRef, dados);
    alert("Criado!");
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

  if (!e) return;

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

  alert("Excluído!");
  carregarEscalas();
};

carregarMinistros();
carregarEscalas();
