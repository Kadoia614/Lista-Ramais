
if (localStorage.getItem("logado") !== "true") {
  window.location.href = "login.html";
}

let registros = [];
let editIndex = null;

const tabela = document.getElementById("tabela");
const form = document.getElementById("formContainer");
const busca = document.getElementById("busca");

// API FAKE COM FILTRO (como backend)

const fetchData = async (filtro = "") => {
  const response = {
    ramais: [
      { nome: "João Silva", setor: "TI", ramal: "1234" },
      { nome: "Maria Oliveira", setor: "RH", ramal: "5678" },
      { nome: "Carlos Santos", setor: "Financeiro", ramal: "9012" },
      { nome: "Ana Costa", setor: "Cultura", ramal: "3456" },
      { nome: "Pedro Lima", setor: "Governo", ramal: "7890" }
    ]
  };

  let data = response.ramais;

  // Se existir filtro, simula: GET /ramais?search=...
  if (filtro) {
    data = data.filter(pessoa =>
      pessoa.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      pessoa.setor.toLowerCase().includes(filtro.toLowerCase()) ||
      pessoa.ramal.includes(filtro)
    );
  }

  return data;
};

// Carregar dados iniciais

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetchData();
  registros = data;
  localStorage.setItem("registros", JSON.stringify(data));
  render();
});


// Renderizar tabela

function render() {
  tabela.innerHTML = "";

  registros.forEach((pessoa, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${pessoa.nome}</td>
        <td>${pessoa.setor}</td>
        <td>${pessoa.ramal}</td>
        <td>
          <button class="btn-edit" onclick="editar(${index})">Editar</button>
          <button class="btn-delete" onclick="deletar(${index})">Excluir</button>
          <button class="btn-view" onclick="ver(${index})">Ver</button>
        </td>
      </tr>
    `;
  });
}

// FILTRO (simulando requisição)

busca.addEventListener("input", async (e) => {
  const valor = e.target.value;
  const dataFiltrada = await fetchData(valor);
  registros = dataFiltrada;
  render();
});

// Novo funcionário

document.getElementById("btnNovo").onclick = () => {
  form.classList.remove("hidden");
  editIndex = null;

  nome.value = "";
  setor.value = "";
  ramal.value = "";
};


// Cancelar
document.getElementById("cancelar").onclick = () => {
  form.classList.add("hidden");
};

// Salvar

document.getElementById("salvar").onclick = () => {
  const nome = document.getElementById("nome").value;
  const setor = document.getElementById("setor").value;
  const ramal = document.getElementById("ramal").value;

  const dados = { nome, setor, ramal };

  if (editIndex === null) {
    registros.push(dados);
  } else {
    registros[editIndex] = dados;
  }

  localStorage.setItem("registros", JSON.stringify(registros));
  form.classList.add("hidden");
  render();
};

// Editar

function editar(index) {
  const p = registros[index];

  nome.value = p.nome;
  setor.value = p.setor;
  ramal.value = p.ramal;

  editIndex = index;
  form.classList.remove("hidden");
}

// Excluir

function deletar(index) {
  if (confirm("Deseja realmente excluir este funcionário?")) {
    registros.splice(index, 1);
    localStorage.setItem("registros", JSON.stringify(registros));
    render();
  }
}

// Ver

function ver(index) {
  const p = registros[index];
  alert(`Nome: ${p.nome}\nSetor: ${p.setor}\nRamal: ${p.ramal}`);
}