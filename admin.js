import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editandoId = null;
let escalasCache = {}; // guardar dados para evitar erro no botão

window.login = async function () {
  await signInWithEmailAndPassword(auth, email.value, senha.value);

  alert("Logado!");
  carregarMinistros();
  carregarEscalas();
};

const ministrosRef = collection(db, "ministros");
const escalasRef = collection(db, "escalas");

window.addMinistro = async function () {
  await addDoc(ministrosRef, {
    nome: ministro.value
  });

  ministro.value = "";
  carregarMinistros();
};

async function carregarMinistros() {
  listaMinistros.innerHTML = "";

  const snapshot = await getDocs(ministrosRef);

  snapshot.forEach(docSnap => {
    listaMinistros.innerHTML += `
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

  const dados = {
    data: data.value,
    missa: missa.value,
    ministros: selecionados
  };

  if (!dados.data || selecionados.length === 0) {
    alert("Preencha a data e selecione ministros");
    return;
  }

  if (editandoId) {
    await updateDoc(doc(db, "escalas", editandoId), dados);
    alert("Escala atualizada!");
    editandoId = null;
  } else {
    await addDoc(escalasRef, dados);
    alert("Escala criada!");
  }

  limparFormulario();
  carregarEscalas();
};

function limparFormulario() {
  data.value = "";
  missa.value = "07h";
  document.querySelectorAll("#listaMinistros input").forEach(el => el.checked = false);
}

async function carregarEscalas() {
  escalas.innerHTML = "";
  escalasCache = {};

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(docSnap => {
    const e = docSnap.data();
    escalasCache[docSnap.id] = e;

    escalas.innerHTML += `
      <div>
        <b>${e.data} - ${e.missa}</b><br>
        ${e.ministros.join(", ")}<br><br>

        <button onclick="editar('${docSnap.id}')">✏️ Editar</button>
        <button onclick="excluir('${docSnap.id}')">🗑️ Excluir</button>

      </div><hr>
    `;
  });
}

window.editar = function (id) {
  const e = escalasCache[id];

  if (!e) {
    alert("Erro ao carregar dados");
    return;
  }

  editandoId = id;

  data.value = e.data;
  missa.value = e.missa;

  document.querySelectorAll("#listaMinistros input").forEach(el => {
    el.checked = e.ministros.includes(el.value);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.excluir = async function (id) {
  if (!confirm("Deseja excluir esta escala?")) return;

  await deleteDoc(doc(db, "escalas", id));

  alert("Escala excluída!");
  carregarEscalas();
};

// inicialização (opcional se quiser carregar direto)
carregarMinistros();
carregarEscalas();
