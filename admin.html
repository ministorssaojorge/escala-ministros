// 🔥 BANCO TEMPORÁRIO (memória)
let ministros = [];
let escalas = [];

// =============================
// 🔐 LOGIN (simples)
window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  if (email === "admin" && senha === "123") {
    alert("Login OK");
  } else {
    alert("Login inválido");
  }
};

// =============================
// ➕ ADICIONAR MINISTRO
window.addMinistro = function () {
  const nome = document.getElementById("ministro").value;
  const telefone = document.getElementById("telefone").value;

  if (!nome) {
    alert("Digite o nome");
    return;
  }

  ministros.push({ nome, telefone });

  // 🔥 ORDENA AUTOMATICAMENTE
  ministros.sort((a, b) => a.nome.localeCompare(b.nome));

  renderMinistros();
  renderCheckboxMinistros();

  // limpar campos
  document.getElementById("ministro").value = "";
  document.getElementById("telefone").value = "";
};

// =============================
// 📋 LISTAR MINISTROS
function renderMinistros() {
  const lista = document.getElementById("listaMinistros");
  lista.innerHTML = "";

  ministros
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((m, i) => {
      lista.innerHTML += `
        <tr>
          <td>${m.nome}</td>
          <td>${m.telefone}</td>
          <td>
            <button class="acao-btn delete" onclick="deletarMinistro(${i})">Excluir</button>
          </td>
        </tr>
      `;
    });
}

// =============================
// ❌ DELETAR
window.deletarMinistro = function (index) {
  ministros.splice(index, 1);

  renderMinistros();
  renderCheckboxMinistros();
};

// =============================
// ☑️ CHECKBOX DOS MINISTROS
function renderCheckboxMinistros() {
  const div = document.getElementById("checkboxMinistros");
  div.innerHTML = "";

  ministros
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach((m) => {
      div.innerHTML += `
        <label>
          <input type="checkbox" value="${m.nome}">
          ${m.nome}
        </label><br>
      `;
    });
}

// =============================
// 💾 SALVAR ESCALA
window.salvarEscala = function () {
  const data = document.getElementById("data").value;
  const missa = document.getElementById("missa").value;

  const checkboxes = document.querySelectorAll("#checkboxMinistros input:checked");

  let selecionados = [];

  checkboxes.forEach(cb => {
    selecionados.push(cb.value);
  });

  // 🔥 ORDENA NOMES NA ESCALA
  selecionados.sort((a, b) => a.localeCompare(b));

  const escala = {
    data,
    missa,
    ministros: selecionados
  };

  escalas.push(escala);

  renderEscalas();
  atualizarCalendario();
};

// =============================
// 📊 TABELA DE ESCALAS
function renderEscalas() {
  const tabela = document.getElementById("escalas");
  tabela.innerHTML = "";

  escalas.forEach((e, i) => {
    tabela.innerHTML += `
      <tr>
        <td>${e.data}</td>
        <td>${e.missa}</td>
        <td>${e.ministros.join(", ")}</td>
        <td>
          <button class="acao-btn delete" onclick="deletarEscala(${i})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

// =============================
// ❌ DELETAR ESCALA
window.deletarEscala = function (index) {
  escalas.splice(index, 1);

  renderEscalas();
  atualizarCalendario();
};

// =============================
// 📅 CALENDÁRIO
let calendar;

document.addEventListener("DOMContentLoaded", function () {
  let calendarEl = document.getElementById("calendario");

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    locale: "pt-br",
    events: []
  });

  calendar.render();
});

// =============================
// 🔄 ATUALIZAR CALENDÁRIO
function atualizarCalendario() {
  calendar.removeAllEvents();

  escalas.forEach(e => {
    calendar.addEvent({
      title: e.missa + " - " + e.ministros.join(", "),
      start: e.data
    });
  });
}
