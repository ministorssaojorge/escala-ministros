import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

window.login = async function () {
  await signInWithEmailAndPassword(
    auth,
    email.value,
    senha.value
  );

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

  snapshot.forEach(doc => {
    listaMinistros.innerHTML += `
      <label>
        <input type="checkbox" value="${doc.data().nome}">
        ${doc.data().nome}
      </label><br>
    `;
  });
}

window.salvarEscala = async function () {
  const selecionados = [...document.querySelectorAll("input:checked")]
    .map(el => el.value);

  await addDoc(escalasRef, {
    data: data.value,
    missa: missa.value,
    ministros: selecionados
  });

  carregarEscalas();
};

async function carregarEscalas() {
  escalas.innerHTML = "";

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(doc => {
    const e = doc.data();

    escalas.innerHTML += `
      <div>
        <b>${e.data} - ${e.missa}</b><br>
        ${e.ministros.join(", ")}
      </div><hr>
    `;
  });
}
