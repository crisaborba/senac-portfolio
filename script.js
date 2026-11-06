// ===== Configuração =====
const CHAVE = 'mensagens';
// TROQUE pelo e-mail que vai receber as mensagens (envio automático via FormSubmit)
const EMAIL_DESTINO = 'seuemail@exemplo.com';

// ===== Skills (renderizadas em badges) =====
const hardSkills = ['Python', 'Cybersecurity', 'Java', 'SQL', 'Redes e protocolos', 'Linux', 'Pentesting', 'Inglês', 'Manutenção de hardware', 'I.A', 'HTML', 'CSS'];
const softSkills = ['Trabalho em equipe', 'Liderança', 'Paciência', 'Persistência', 'Resolução de problemas', 'Vontade de aprender'];

function mostrarSkills(idElemento, lista) {
  const el = document.getElementById(idElemento);
  lista.forEach(function (s) {
    const span = document.createElement('span');
    span.className = 'badge-skill';
    span.textContent = s;
    el.appendChild(span);
  });
}
mostrarSkills('hardSkills', hardSkills);
mostrarSkills('softSkills', softSkills);

// ===== LocalStorage (JSON) =====
function lerMensagens() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch (e) {
    return [];
  }
}
function salvarMensagens(lista) {
  localStorage.setItem(CHAVE, JSON.stringify(lista));
}

// Primeiro acesso: se estiver vazio, injeta 20 registros de teste
function injetarDadosDeTeste() {
  if (lerMensagens().length > 0) return;
  const nomes = ['Ana Souza', 'Bruno Lima', 'Carla Dias', 'Diego Rocha', 'Eduarda Alves', 'Felipe Costa', 'Gabriela Nunes', 'Henrique Melo', 'Isabela Ramos', 'João Pereira',
                 'Karen Martins', 'Lucas Ferreira', 'Marina Gomes', 'Nicolas Barros', 'Olívia Teixeira', 'Pedro Araújo', 'Quézia Moraes', 'Rafael Cardoso', 'Sofia Ribeiro', 'Thiago Pinto'];
  const textos = ['Gostei muito do seu portfólio!', 'Você tem interesse em vagas de estágio?', 'Podemos conversar sobre segurança da informação?',
                  'Parabéns pelos projetos.', 'Gostaria de saber mais sobre o MyTecHub.', 'Vamos marcar uma entrevista?', 'Seu projeto de monitoramento é muito interessante.'];
  const lista = [];
  for (let i = 0; i < 20; i++) {
    const nomeSimples = nomes[i].split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    lista.push({
      id: i + 1,
      nome: nomes[i],
      email: nomeSimples + '@exemplo.com',
      mensagem: textos[i % textos.length],
      data: new Date(2026, 10, 1 + (i % 6), 9 + (i % 8), 0).toLocaleString('pt-BR')
    });
  }
  salvarMensagens(lista);
}
injetarDadosDeTeste();

// ===== CRUD =====
function criarMensagem(nome, email, mensagem) {
  const lista = lerMensagens();
  const maiorId = lista.reduce(function (m, x) { return x.id > m ? x.id : m; }, 0);
  lista.push({ id: maiorId + 1, nome: nome, email: email, mensagem: mensagem, data: new Date().toLocaleString('pt-BR') });
  salvarMensagens(lista);
}
function atualizarMensagem(id, nome, email, mensagem) {
  const lista = lerMensagens();
  const item = lista.find(function (x) { return x.id === id; });
  if (item) {
    item.nome = nome;
    item.email = email;
    item.mensagem = mensagem;
    salvarMensagens(lista);
  }
}
function deletarMensagem(id) {
  salvarMensagens(lerMensagens().filter(function (x) { return x.id !== id; }));
}

// ===== Formulário de contato (armazenamento local + envio automático) =====
const formContato = document.getElementById('formContato');
const avisoContato = document.getElementById('avisoContato');

formContato.addEventListener('submit', function (e) {
  e.preventDefault();
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const mensagem = document.getElementById('mensagem').value.trim();

  if (!nome || !email || !mensagem || !formContato.checkValidity()) {
    avisoContato.innerHTML = '<div class="alert alert-warning">Preencha todos os campos com dados válidos.</div>';
    return;
  }

  criarMensagem(nome, email, mensagem); // salva no LocalStorage
  renderizarLista();

  // Automação de envio por e-mail (FormSubmit)
  fetch('https://formsubmit.co/ajax/' + EMAIL_DESTINO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ name: nome, email: email, message: mensagem, _subject: 'Nova mensagem do portfólio' })
  }).then(function (r) {
    if (!r.ok) throw new Error('falha');
    avisoContato.innerHTML = '<div class="alert alert-success">Mensagem enviada e salva!</div>';
  }).catch(function () {
    avisoContato.innerHTML = '<div class="alert alert-warning">Mensagem salva localmente, mas o envio por e-mail falhou.</div>';
  });

  formContato.reset();
});

// ===== Painel administrativo =====
const painel = document.getElementById('admin');
const formAdmin = document.getElementById('formAdmin');

function escapar(texto) {
  const d = document.createElement('div');
  d.textContent = texto;
  return d.innerHTML;
}

function renderizarLista() {
  const lista = lerMensagens();
  document.getElementById('totalMensagens').textContent = 'Total de mensagens: ' + lista.length;
  const corpo = document.getElementById('listaMensagens');
  if (lista.length === 0) {
    corpo.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma mensagem.</td></tr>';
    return;
  }
  corpo.innerHTML = lista.map(function (m) {
    return '<tr>' +
      '<td>' + m.id + '</td>' +
      '<td>' + escapar(m.nome) + '</td>' +
      '<td>' + escapar(m.email) + '</td>' +
      '<td class="msg-cell">' + escapar(m.mensagem) + '</td>' +
      '<td>' + escapar(m.data) + '</td>' +
      '<td class="text-nowrap">' +
        '<button class="btn btn-warning btn-sm me-1" data-acao="editar" data-id="' + m.id + '">Editar</button>' +
        '<button class="btn btn-danger btn-sm" data-acao="deletar" data-id="' + m.id + '">Excluir</button>' +
      '</td></tr>';
  }).join('');
}

function limparFormAdmin() {
  formAdmin.reset();
  document.getElementById('adminId').value = '';
  document.getElementById('tituloAdmin').textContent = 'Nova mensagem';
  document.getElementById('botaoSalvar').textContent = 'Criar';
}

// Clique no nome abre/fecha o painel
document.getElementById('logoAdmin').addEventListener('click', function () {
  painel.classList.toggle('d-none');
  if (!painel.classList.contains('d-none')) {
    renderizarLista();
    painel.scrollIntoView();
  }
});
document.getElementById('fecharAdmin').addEventListener('click', function () {
  painel.classList.add('d-none');
});
document.getElementById('cancelarEdicao').addEventListener('click', limparFormAdmin);

// Criar / Atualizar
formAdmin.addEventListener('submit', function (e) {
  e.preventDefault();
  const id = document.getElementById('adminId').value;
  const nome = document.getElementById('adminNome').value.trim();
  const email = document.getElementById('adminEmail').value.trim();
  const mensagem = document.getElementById('adminMensagem').value.trim();
  if (!nome || !email || !mensagem || !formAdmin.checkValidity()) {
    alert('Preencha todos os campos com dados válidos.');
    return;
  }
  if (id) {
    atualizarMensagem(Number(id), nome, email, mensagem);
  } else {
    criarMensagem(nome, email, mensagem);
  }
  limparFormAdmin();
  renderizarLista();
});

// Editar / Excluir (botões da tabela)
document.getElementById('listaMensagens').addEventListener('click', function (e) {
  const botao = e.target.closest('button');
  if (!botao) return;
  const id = Number(botao.dataset.id);
  if (botao.dataset.acao === 'deletar') {
    if (confirm('Excluir esta mensagem?')) {
      deletarMensagem(id);
      renderizarLista();
    }
  } else if (botao.dataset.acao === 'editar') {
    const m = lerMensagens().find(function (x) { return x.id === id; });
    if (!m) return;
    document.getElementById('adminId').value = m.id;
    document.getElementById('adminNome').value = m.nome;
    document.getElementById('adminEmail').value = m.email;
    document.getElementById('adminMensagem').value = m.mensagem;
    document.getElementById('tituloAdmin').textContent = 'Editando mensagem #' + m.id;
    document.getElementById('botaoSalvar').textContent = 'Atualizar';
    formAdmin.scrollIntoView();
  }
});

renderizarLista();
