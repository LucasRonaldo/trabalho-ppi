import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const host = "0.0.0.0";
const porta = process.env.PORT || 3000;


const equipes = [];
const jogadores = [];
let nextEquipeId = 1;
let nextJogadorId = 1;


app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: "ChaveSuperSecreta_CampeonatoLoL_2025",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

function verificaUserLogado(req, res, next) {
    if (req.session.dadosLogin?.logado) return next();
    return res.redirect('/login');
}

function renderBasePage(title, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
<style>

body {
font-family: 'Poppins', sans-serif;
background: #010a13; 
color: #f0e6d2; 
min-height: 100vh;
}
.container {
padding-top: 30px;
padding-bottom: 30px;
}
.card {
border-radius: 12px;
box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
background-color: #091428; 
color: #f0e6d2; 
border: 1px solid #c89b3c; 
}
.form-control, .form-select {
background-color: #091428;
border: 1px solid #c89b3c;
color: #f0e6d2;
}

.form-control:focus, .form-select:focus {
background-color: #091428;
border-color: #ffd700;
box-shadow: 0 0 0 0.25rem rgba(200, 155, 60, 0.5);
color: #f0e6d2;
}

.table {
--bs-table-bg: #091428; 
--bs-table-striped-bg: #05101f;
--bs-table-color: #f0e6d2;
--bs-table-border-color: #1a2a47;
}

.table tbody td {
color: #f0e6d2; 
}
.table thead th {
color: #c89b3c;
border-bottom: 2px solid #c89b3c;
}
.btn-lol-primary {
background-color: #c89b3c; 
border-color: #c89b3c;
color: #010a13 !important; 
font-weight: 700;
transition: all 0.2s;
}
.btn-lol-primary:hover {
background-color: #ffd700;
border-color: #ffd700;
transform: translateY(-2px);
}
.btn-primary, .btn-success, .btn-secondary, .btn-info {
background-color: #c89b3c; 
border-color: #c89b3c;
color: #010a13 !important;
font-weight: 600;
}
.btn-primary:hover, .btn-success:hover, .btn-secondary:hover, .btn-info:hover {
background-color: #ffd700;
border-color: #ffd700;
}
.btn-danger {
background-color: #a80000;
border-color: #a80000;
color: white !important;
}
.btn-danger:hover {
background-color: #d10000;
border-color: #d10000;
}
h1, h2, h3 {
color: #c89b3c; 
}

.text-secondary {
color: #f0e6d2 !important;
}

.text-muted, .fst-italic {
color: #99a2b5 !important; 
}
</style>
</head>
<body class="bg-dark"> 
<div class="container py-4">
${bodyHtml}
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

app.get('/', verificaUserLogado, (req, res) => {
    const ultimoAcesso = req.cookies?.ultimoAcesso;
    const agora = new Date();

    // CORREÇÃO: Força o uso do fuso horário de São Paulo (GMT-3) para o cookie e exibição
    const dataFormatada = agora.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    res.cookie('ultimoAcesso', dataFormatada, { maxAge: 1000 * 60 * 60 * 24 * 30 });

    const body = `
<div class="container">
<div class="card shadow p-4 mx-auto mt-5" style="max-width: 700px;">
<h1 class="text-center mb-2" style="font-weight: 700;">Painel do Campeonato LoL</h1>
<p class="text-center text-light">Último acesso: ${ultimoAcesso || 'Primeiro acesso'}</p>

<div class="row row-cols-1 row-cols-md-2 g-3 mt-3">

<div class="col">
<a href="/equipes/novo" class="btn btn-lol-primary w-100 py-3">
<i class="fas fa-users me-2"></i> Cadastro de Equipe
</a>
</div>

<div class="col">
<a href="/jogadores/novo" class="btn btn-lol-primary w-100 py-3">
<i class="fas fa-user-plus me-2"></i> Cadastro de Jogador
</a>
</div>

<div class="col">
<a href="/equipes/listar" class="btn btn-secondary w-100 py-3">
<i class="fas fa-list-ul me-2"></i> Listar Equipes
</a>
</div>

<div class="col">
<a href="/jogadores/listar" class="btn btn-info w-100 py-3">
<i class="fas fa-users-cog me-2"></i> Listar Jogadores
</a>
</div>

</div>

<a href="/logout" class="btn btn-danger w-100 mt-4 py-3">
<i class="fas fa-sign-out-alt me-2"></i> Sair
</a>
</div>
</div>
`;

    res.send(renderBasePage('Menu', body));
});


app.get('/login', (req, res) => {

    const body = `<div class="d-flex justify-content-center align-items-center" 
style="min-height: 100vh;">

<div class="card p-4 shadow" style="width: 380px;">
<h2 class="text-center mb-4" style="font-weight: bold;">Acesso ao Sistema</h2>

<form method="POST" action="/login">
<div class="mb-3">
<label class="form-label text-light">Usuário</label>
<input class="form-control form-control-lg" name="usuario" required>
</div>

<div class="mb-3">
<label class="form-label text-light">Senha</label>
<input type="password" class="form-control form-control-lg" name="senha" required>
</div>

<button class="btn btn-lol-primary w-100 btn-lg mt-2">
<i class="fas fa-sign-in-alt me-2"></i> Entrar
</button>
</form>
</div>

</div>
`;
    res.send(renderBasePage('Login', body));
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === 'admin' && senha === '12345') {
        req.session.dadosLogin = { nome: 'Admin', logado: true };

        return res.redirect('/');
    }
    res.send(renderBasePage('Login - Erro', `<div class="alert alert-danger">Usuário ou senha inválidos.</div><a href="/login" class="btn btn-secondary">Voltar</a>`));
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});


app.get('/equipes/novo', verificaUserLogado, (req, res) => {
    const body = `
<div class="card p-4" style="max-width:720px;margin:0 auto;">
<h3 class="mb-4">Cadastro de Equipe</h3>
<form method="POST" action="/equipes">
<div class="mb-3">
<label class="form-label">Nome da equipe</label>
<input name="nome" class="form-control" required>
</div>
<div class="mb-3">
<label class="form-label">Nome do capitão</label>
<input name="capitao" class="form-control" required>
</div>
<div class="mb-3">
<label class="form-label">Telefone / WhatsApp</label>
<input name="contato" class="form-control" required>
</div>
<div class="mt-4">
<button class="btn btn-lol-primary"><i class="fas fa-plus-circle me-2"></i>Cadastrar Equipe</button>
<a class="btn btn-secondary ms-2" href="/"><i class="fas fa-arrow-left me-2"></i>Voltar</a>
</div>
</form>
</div>`;
    res.send(renderBasePage('Cadastro de Equipe', body));
});

app.post('/equipes', verificaUserLogado, (req, res) => {
    const { nome, capitao, contato } = req.body;

    if (!nome?.trim() || !capitao?.trim() || !contato?.trim()) {
        return res.send(renderBasePage('Erro - Cadastro Equipe', `<div class="alert alert-danger">Todos os campos são obrigatórios.</div><a class="btn btn-secondary" href="/equipes/novo">Voltar</a>`));
    }


    equipes.push({ id: nextEquipeId++, nome: nome.trim(), capitao: capitao.trim(), contato: contato.trim() });
    res.redirect('/equipes/listar');
});


app.get('/equipes/listar', verificaUserLogado, (req, res) => {
    let html = `
<div class="card p-4">
<h3 class="mb-4">Equipes Cadastradas</h3>
<div class="table-responsive">
<table class="table table-striped table-hover mt-3">
<thead><tr><th>#</th><th>Nome</th><th>Capitão</th><th>Contato</th><th>Jogadores</th></tr></thead>
<tbody>`;

    for (const e of equipes) {
        const countPlayers = jogadores.filter(j => j.equipeId === e.id).length;

        const playerStatusClass = countPlayers === 5 ? 'text-success fw-bold' : 'text-warning';
        html += `<tr>
<td>${e.id}</td>
<td><i class="fas fa-users me-2"></i>${e.nome}</td>
<td>${e.capitao}</td>
<td>${e.contato}</td>
<td class="${playerStatusClass}">${countPlayers}/5</td>
</tr>`;
    }

    html += `</tbody></table>
</div>
<div class="d-flex justify-content-start gap-3 mt-4">
<a class="btn btn-lol-primary" href="/equipes/novo"><i class="fas fa-plus me-2"></i>Cadastrar nova equipe</a>
<a class="btn btn-secondary" href="/"><i class="fas fa-arrow-left me-2"></i>Voltar ao menu</a>
</div>
</div>`;

    res.send(renderBasePage('Lista de Equipes', html));
});


app.get('/jogadores/novo', verificaUserLogado, (req, res) => {

    if (equipes.length === 0) {
        return res.send(renderBasePage('Cadastrar Jogador', `<div class="alert alert-warning">Não existem equipes cadastradas. Cadastre uma equipe antes de adicionar jogadores.</div><a class="btn btn-lol-primary" href="/equipes/novo">Cadastrar Equipe</a> <a class="btn btn-secondary ms-2" href="/">Voltar</a>`));
    }

    let options = '';
    for (const e of equipes) {
        options += `<option value="${e.id}">${e.nome}</option>`;
    }

    const body = `
<div class="card p-4" style="max-width:720px;margin:0 auto;">
<h3 class="mb-4">Cadastro de Jogador</h3>
<form method="POST" action="/jogadores">
<div class="mb-3">
<label class="form-label">Nome do jogador</label>
<input name="nome" class="form-control" required>
</div>
<div class="mb-3">
<label class="form-label">Nickname (in-game)</label>
<input name="nick" class="form-control" required>
</div>
<div class="mb-3">
<label class="form-label">Função</label>
<select name="funcao" class="form-select" required>
<option value="">Selecione...</option>
<option>Top</option>
<option>Jungle</option>
<option>Mid</option>
<option>Atirador</option>
<option>Suporte</option>
</select>
</div>
<div class="mb-3">
<label class="form-label">Elo</label>
<select name="elo" class="form-select" required>
<option value="">Selecione...</option>
<option>Ferro</option>
<option>Bronze</option>
<option>Prata</option>
<option>Ouro</option>
<option>Platina</option>
<option>Diamante</option>
<option>Master</option>
<option>Grandmaster</option>
<option>Challenger</option>
</select>
</div>
<div class="mb-3">
<label class="form-label">Gênero</label>
<select name="genero" class="form-select" required>
<option value="">Selecione...</option>
<option>Masculino</option>
<option>Feminino</option>
</select>
</div>

<div class="mb-3">
<label class="form-label">Equipe</label>
<select name="equipeId" class="form-select" required>
<option value="">Selecione uma equipe...</option>
${options}
</select>
</div>

<div class="mt-4">
<button class="btn btn-lol-primary"><i class="fas fa-user-plus me-2"></i>Cadastrar Jogador</button>
<a class="btn btn-secondary ms-2" href="/"><i class="fas fa-arrow-left me-2"></i>Voltar</a>
</div>
</form>
</div>`;

    res.send(renderBasePage('Cadastro de Jogador', body));
});

app.post('/jogadores', verificaUserLogado, (req, res) => {
    const { nome, nick, funcao, elo, genero, equipeId } = req.body;


    if (!nome?.trim() || !nick?.trim() || !funcao || !elo || !genero || !equipeId) {
        return res.send(renderBasePage('Erro - Cadastro Jogador', `<div class="alert alert-danger">Todos os campos são obrigatórios.</div><a class="btn btn-secondary" href="/jogadores/novo">Voltar</a>`));
    }

    const equipe = equipes.find(e => e.id === Number(equipeId));
    if (!equipe) {
        return res.send(renderBasePage('Erro - Cadastro Jogador', `<div class="alert alert-danger">Equipe selecionada inválida.</div><a class="btn btn-secondary" href="/jogadores/novo">Voltar</a>`));
    }


    const qtd = jogadores.filter(j => j.equipeId === Number(equipeId)).length;
    if (qtd >= 5) {
        return res.send(renderBasePage('Erro - Cadastro Jogador', `<div class="alert alert-danger">A equipe "${equipe.nome}" já possui 5 jogadores cadastrados.</div><a class="btn btn-secondary" href="/jogadores/listar">Ver jogadores</a>`));
    }


    jogadores.push({ id: nextJogadorId++, nome: nome.trim(), nick: nick.trim(), funcao, elo, genero, equipeId: Number(equipeId) });
    res.redirect('/jogadores/listar');
});


app.get('/jogadores/listar', verificaUserLogado, (req, res) => {
    if (equipes.length === 0) {
        return res.send(renderBasePage('Jogadores', `<div class="alert alert-info">Nenhuma equipe cadastrada.</div><a class="btn btn-lol-primary" href="/equipes/novo">Cadastrar Equipe</a>`));
    }

    let html = '<div class="card p-4">';
    html += '<h3 class="mb-4">Jogadores por Equipe</h3>';

    for (const e of equipes) {
        html += `<div class="mt-4">
<h4 class="pb-2 border-bottom border-warning-subtle">
<span class="badge me-2 btn-lol-primary">${e.nome}</span> 
<small class="text-secondary">(Capitão: ${e.capitao})</small>
</h4>`;

        const lista = jogadores.filter(j => j.equipeId === e.id);
        if (lista.length === 0) {

            html += '<p class="text-muted fst-italic">Nenhum jogador cadastrado nesta equipe.</p>';
        } else {

            html += '<div class="table-responsive"><table class="table table-sm table-striped mt-2"><thead><tr><th>#</th><th>Nome</th><th>Nick</th><th>Função</th><th>Elo</th><th>Gênero</th></tr></thead><tbody>';
            for (const j of lista) {
                html += `<tr><td>${j.id}</td><td>${j.nome}</td><td>${j.nick}</td><td>${j.funcao}</td><td>${j.elo}</td><td>${j.genero}</td></tr>`;
            }
            html += '</tbody></table></div>';
        }
        html += '</div>';
    }

    html += '<div class="mt-4 d-flex justify-content-start gap-3"><a class="btn btn-lol-primary" href="/jogadores/novo"><i class="fas fa-user-plus me-2"></i>Cadastrar Jogador</a> <a class="btn btn-secondary" href="/"><i class="fas fa-arrow-left me-2"></i>Voltar</a></div>';
    html += '</div>';

    res.send(renderBasePage('Lista de Jogadores', html));
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});