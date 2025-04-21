function init() {
    carregarPresentes();

    document.getElementById('btnReservar').addEventListener('click', btnReservar_click);
}

function renderizarSelecionadosPreview(presentes, selectedIds) {
    const previewDiv = document.getElementById('selecionados-preview');
    if (!previewDiv) return;
    if (!selectedIds || selectedIds.length === 0) {
        previewDiv.innerHTML = '';
        return;
    }
    // Filtra os presentes selecionados
    const selecionados = presentes.filter(p => selectedIds.includes(p.id));
    if (selecionados.length === 0) {
        previewDiv.innerHTML = '';
        return;
    }
    let html = '<div style="margin:18px 0 8px 0;font-weight:500;">Você escolheu os seguintes itens:</div>';
    html += '<ul style="margin:0 0 8px 18px;padding:0;">';
    selecionados.forEach(p => {
        html += `<li style='margin:0 0 4px 0;padding:0;list-style:disc inside;font-size:1em;'>${p.nome}</li>`;
    });
    html += '</ul>';
    previewDiv.innerHTML = html;
}

init();

async function carregarPresentes() {
    const resp = await fetch('api/listar_presentes.php');
    const presentes = await resp.json();
    console.log(presentes);
    const ul = document.getElementById('lista-presentes');
    ul.innerHTML = '';
    ul.className = 'presentes-grid';
    window.selectedIds = window.selectedIds || [];
    renderizarSelecionadosPreview(presentes, window.selectedIds);
    presentes.forEach(presente => {
        const indisponivel = (typeof presente.disponivel !== 'undefined' && presente.disponivel <= 0);
        const reservado = !!presente.reservado;
        const selected = window.selectedIds.includes(presente.id);
        const classes = ['presente-item'];
        if (reservado) classes.push('reservado');
        if (indisponivel) classes.push('indisponivel');
        if (selected) classes.push('selected');

        const div = document.createElement('div');
        div.className = classes.join(' ');
        div.classList.add('presente-item-wrapper');

        let imgSrc = presente.imagem && presente.imagem.length > 0 ? presente.imagem : 'https://via.placeholder.com/100x100?text=Presente';
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = presente.nome;
        div.appendChild(img);

        if (selected) {
            const check = document.createElement('span');
            check.innerHTML = '&#10003;';
            check.classList.add('checkmark-style', 'checkmark');
            div.appendChild(check);
        }

        const nome = document.createElement('div');
        nome.textContent = presente.nome + (reservado ? ' (Reservado)' : (indisponivel ? ' (Indisponível)' : ''));
        nome.style.marginTop = '8px';
        div.appendChild(nome);

        // Add badge for available amount
        if (!reservado && !indisponivel) {
            const badge = document.createElement('div');
            badge.className = 'badge-disponivel';
            badge.textContent = "Disponível: " + presente.disponivel;
            div.appendChild(badge);
        }

        if (!reservado && !indisponivel) {
            div.addEventListener('click', () => {
                const idx = window.selectedIds.indexOf(presente.id);
                if (idx > -1) {
                    window.selectedIds.splice(idx, 1);
                } else {
                    window.selectedIds.push(presente.id);
                }
                carregarPresentes();
            });
        }
        ul.appendChild(div);
    });
    // Atualiza preview ao final (caso seleção mude por clique)
    renderizarSelecionadosPreview(presentes, window.selectedIds);
}


async function btnReservar_click(e) {
    const selecionados = (window.selectedIds || []);
    const mensagemDiv = document.getElementById('mensagem');
    if (selecionados.length === 0) {
        mensagemDiv.textContent = 'Selecione pelo menos um presente.';
        return;
    }
    mensagemDiv.textContent = 'Enviando seleção...';
    try {
        const resp = await fetch('api/escolher.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ presentes: selecionados })
        });
        const resultado = await resp.json();
        mensagemDiv.textContent = resultado.mensagem;
        window.selectedIds = [];
        await carregarPresentes();
        renderizarSelecionadosPreview([], []);
        // Rolar para o topo após atualizar o DOM
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } catch (error) {
        mensagemDiv.textContent = 'Erro ao enviar seleção.';
    }
}
