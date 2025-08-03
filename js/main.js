// Função para carregar o conteúdo da página inicial (cards)
function loadHome() {
  const conteudoDinamico = document.getElementById("conteudo-dinamico");
  const visaoInicial = document.getElementById("visao-inicial-template")
    .innerHTML;
  conteudoDinamico.innerHTML = visaoInicial;
  populateCards(); // Popula os cards novamente
}

// Função para popular os cards de aulas e listas
async function populateCards() {
  try {
    // Aulas
    const resAulas = await fetch("aulas/aulas.json");
    const aulas = await resAulas.json();
    const cardsContainer = document.getElementById("cards-container");
    if (cardsContainer) {
      cardsContainer.innerHTML = ""; // Limpa antes de popular
      aulas.forEach((aula) => {
        if (aula.ativo) {
          const card = document.createElement("a");
          card.className =
            "block bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer";
          card.setAttribute("onclick", `loadAula('${aula.arquivo}')`);
          card.innerHTML = `<h3 class="font-bold text-xl text-indigo-600 mb-2">${
            aula.titulo.split(":")[0]
          }</h3><p>${aula.descricao}</p>`;
          cardsContainer.appendChild(card);
        }
      });
    }

    // Listas
    const resListas = await fetch("listas/listas.json");
    const listas = await resListas.json();
    const listasContainer = document.getElementById("listas-container");
    if (listasContainer) {
      listasContainer.innerHTML = ""; // Limpa antes de popular
      listas.forEach((lista) => {
        const card = document.createElement("div");
        card.className =
          "bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer";
        card.innerHTML = `
          <h3 class="font-bold text-xl text-indigo-600 mb-2">${lista.titulo}</h3>
          <p class="text-slate-600">${lista.descricao}</p>
        `;
        card.onclick = () => loadListaDetalhe(lista.arquivo);
        listasContainer.appendChild(card);
      });
    }
  } catch (err) {
    console.error("Erro ao popular cards:", err);
  }
}

// Função para carregar a barra lateral
async function loadSidebar() {
  const sidebar = document.getElementById("sidebar-links");
  if (!sidebar) return;
  sidebar.innerHTML = ""; // Limpa a sidebar

  // Link de Início
  const homeLi = document.createElement("li");
  homeLi.innerHTML = `<a href="#" onclick="location.reload()" class="block font-bold hover:text-indigo-400 transition-colors"><i class="fas fa-home mr-2"></i>Início</a>`;
  sidebar.appendChild(homeLi);

  try {
    // Carrega Aulas
    const resAulas = await fetch("aulas/aulas.json");
    const aulas = await resAulas.json();
    if (aulas.length > 0) {
      const header = document.createElement("div");
      header.className =
        "mt-4 mb-2 px-2 py-1 bg-slate-700 text-slate-100 text-sm font-bold rounded";
      header.textContent = "Aulas";
      sidebar.appendChild(header);
    }
    aulas.forEach((aula) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="block ${
        aula.ativo
          ? "hover:text-indigo-400"
          : "text-slate-500 cursor-not-allowed"
      } transition-colors" ${
        aula.ativo ? `onclick="loadAula('${aula.arquivo}')"` : ""
      }>${aula.titulo}</a>`;
      sidebar.appendChild(li);
    });

    // Carrega Listas
    const resListas = await fetch("listas/listas.json");
    const listas = await resListas.json();
    if (listas.length > 0) {
      const headerListas = document.createElement("div");
      headerListas.className =
        "mt-6 mb-2 px-2 py-1 bg-indigo-600 text-white text-sm font-bold rounded";
      headerListas.textContent = "Listas de Exercícios";
      sidebar.appendChild(headerListas);
    }
    listas.forEach((lista) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="#" class="block hover:text-indigo-400 transition-colors"
          onclick="loadListaDetalhe('${lista.arquivo}')">${lista.titulo}</a>`;
      sidebar.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao carregar sidebar:", err);
  }
}

// Carrega o HTML de uma aula no container principal
function loadAula(file) {
  fetch(`aulas/${file}`)
    .then((r) => r.text())
    .then((html) => {
      const conteudo = document.getElementById("conteudo-dinamico");
      conteudo.innerHTML = html;
      window.scrollTo({ top: 0, behavior: "smooth" });
      closeSidebar();
    })
    .catch((err) => console.error("Erro ao carregar aula:", err));
}

// Carrega o detalhe de uma lista de exercícios
async function loadListaDetalhe(file) {
  try {
    const res = await fetch(`listas/${file}`);
    const data = await res.json();

    const conteudo = document.getElementById("conteudo-dinamico");
    conteudo.innerHTML = ""; // Limpa o conteúdo atual

    const section = document.createElement("section");
    section.className = "mb-16";
    section.innerHTML = `
      <header class="mb-12">
        <h2 class="text-4xl font-bold text-slate-900">${data.titulo}</h2>
        <p class="text-lg text-slate-600 mt-2">${data.descricao}</p>
      </header>
      <div id="questoes" class="space-y-6"></div>
    `;
    conteudo.appendChild(section);

    const questoesContainer = section.querySelector("#questoes");
    const metaRes = await fetch("listas/listas.json");
    const listasMeta = await metaRes.json();
    const meta = listasMeta.find((l) => l.arquivo === file);
    const disabled = !meta.mostrar_solucoes;

    data.questoes.forEach((q) => {
      const div = document.createElement("div");
      div.className = "bg-white border border-slate-200 rounded-lg";
      div.innerHTML = `
        <div class="p-5">
          <p class="font-semibold">${q.id}. ${q.enunciado}</p>
          <div class="mt-2 text-sm text-slate-600">
            <p><strong>Dica:</strong> ${q.dica}</p>
          </div>
        </div>
        <div class="border-t border-slate-200">
          <details class="group">
            <summary class="group-hover:bg-slate-100 p-3 font-semibold text-sm ${
              disabled ? "text-gray-400 cursor-not-allowed" : "text-indigo-700 cursor-pointer"
            }">
              <span>${disabled ? "Solução indisponível" : "Mostrar Solução"}</span>
            </summary>
            ${!disabled ? `<div class="p-4 bg-slate-800 text-white mono text-sm overflow-x-auto">
              <pre><code>${q.solucao}</code></pre>
            </div>` : ''}
          </details>
        </div>
      `;
      questoesContainer.appendChild(div);
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeSidebar();
  } catch (err) {
    console.error("Erro ao carregar lista detalhada:", err);
  }
}

// Lógica do menu mobile
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

function closeSidebar() {
    if (sidebar && !sidebar.classList.contains("-translate-x-full")) {
        sidebar.classList.add("-translate-x-full");
    }
}

menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("-translate-x-full");
});

document.addEventListener('click', (e) => {
    if (sidebar && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        closeSidebar();
    }
});


// Armazena o template da visão inicial para recarregá-lo
document.addEventListener("DOMContentLoaded", () => {
  const visaoInicial = document.getElementById("visao-inicial");
  const template = document.createElement("template");
  template.id = "visao-inicial-template";
  template.innerHTML = visaoInicial.innerHTML;
  document.body.appendChild(template);

  loadSidebar();
  populateCards();
});
