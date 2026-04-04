import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editandoId = null;

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

  if (editandoId) {
    await updateDoc(doc(db, "escalas", editandoId), dados);
    editandoId = null;
    alert("Escala atualizada!");
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

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(docSnap => {
    const e = docSnap.data();

    escalas.innerHTML += `
      <div>
        <b>${e.data} - ${e.missa}</b><br>
        ${e.ministros.join(", ")}<br><br>

        <button onclick="editar('${docSnap.id}', '${e.data}', '${e.missa}', ${JSON.stringify(e.ministros)})">
          ✏️ Editar
        </button>

      </div><hr>
    `;
  });
}

window.editar = function (id, dataVal, missaVal, ministrosVal) {
  editandoId = id;

  data.value = dataVal;
  missa.value = missaVal;

  document.querySelectorAll("#listaMinistros input").forEach(el => {
    el.checked = ministrosVal.includes(el.value);
  });

  window.scrollTo(0, 0);
};
