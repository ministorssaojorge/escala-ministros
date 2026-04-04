import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ministrosRef = collection(db, "ministros");
const escalasRef = collection(db, "escalas");

window.addMinistro = async function () {
  const nome = document.getElementById("ministro").value;
  await addDoc(ministrosRef, { nome });
  carregarMinistros();
};

async function carregarMinistros() {
  const lista = document.getElementById("listaMinistros");
  lista.innerHTML = "";

  const snapshot = await getDocs(ministrosRef);

  snapshot.forEach(doc => {
    lista.innerHTML += `
      <label>
        <input type="checkbox" value="${doc.data().nome}">
        ${doc.data().nome}
      </label><br>
    `;
  });
}

window.salvarEscala = async function () {
  const selecionados = [...document.querySelectorAll("input[type=checkbox]:checked")]
    .map(el => el.value);

  await addDoc(escalasRef, {
    data: document.getElementById("data").value,
    missa: document.getElementById("missa").value,
    ministros: selecionados
  });

  carregarEscalas();
};

async function carregarEscalas() {
  const div = document.getElementById("escalas");
  div.innerHTML = "";

  const snapshot = await getDocs(escalasRef);

  snapshot.forEach(doc => {
    const e = doc.data();

    div.innerHTML += `
      <div>
        <b>${e.data} - ${e.missa}</b><br>
        ${e.ministros.join(", ")}
      </div><hr>
    `;
  });
}

carregarMinistros();
carregarEscalas();
