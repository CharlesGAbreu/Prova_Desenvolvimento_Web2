"use strict";

class Produto {
    constructor(id, nome, descricao, preco, categoria, imagem) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.preco = parseFloat(preco);
        this.categoria = categoria;
        this.imagem = imagem;
    }
}

class ItemCarrinho {
    constructor(produto, quantidade = 1) {
        this.produto = produto;
        this.quantidade = parseInt(quantidade);
    }

    obterSubtotal() {
        return this.produto.preco * this.quantidade;
    }

    aumentarQuantidade() {
        this.quantidade++;
    }

    diminuirQuantidade() {
        if (this.quantidade > 1) {
            this.quantidade--;
        }
    }
}

class Carrinho {
    constructor() {
        this.itens = [];
        this.tipoEntrega = "retirada";
    }

    adicionarProduto(produto, quantidade = 1) {
        const itemExistente = this.itens.find(item => item.produto.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade += parseInt(quantidade);
        } else {
            this.itens.push(new ItemCarrinho(produto, quantidade));
        }
    }

    removerItem(produtoId) {
        this.itens = this.itens.filter(item => item.produto.id !== produtoId);
    }

    alterarQuantidade(produtoId, quantidade) {
        const item = this.itens.find(item => item.produto.id === produtoId);
        if (item) {
            item.quantidade = parseInt(quantidade);
            if (item.quantidade <= 0) {
                this.removerItem(produtoId);
            }
        }
    }

    limpar() {
        this.itens = [];
    }

    calcularSubtotal() {
        return this.itens.reduce((total, item) => total + item.obterSubtotal(), 0);
    }

    calcularTaxaEntrega() {
        return this.tipoEntrega === "Frete" ? 2.50 : 0.00;
    }

    calcularTotal() {
        return this.calcularSubtotal() + this.calcularTaxaEntrega();
    }
}

class Pedido {
    constructor(cliente, itens, tipoEntrega, total) {
        this.id = Date.now();
        this.cliente = cliente;
        this.itens = itens.map(item => ({
            nome: item.produto.nome,
            preco: item.produto.preco,
            quantidade: item.quantidade,
            subtotal: item.obterSubtotal()
        }));
        this.tipoEntrega = tipoEntrega;
        this.total = total;
        this.data = new Date().toLocaleString("pt-BR");
        this.status = "Finalizado";
    }
}

class Gerenciador {
    constructor() {
        this.produtos = [];
        this.carrinho = new Carrinho();
        this.carregarDadosIniciais();
    }
    
    carregarDadosIniciais() {
        const produtosSalvos = localStorage.getItem("cardapio_restaurante");
        if (produtosSalvos) {
            const dados = JSON.parse(produtosSalvos);
            this.produtos = dados.map(p => new Produto(p.id, p.nome, p.descricao, p.preco, p.categoria, p.imagem));
        } else {
            
            this.produtos = [
                new Produto(1, "Fone Bluetooth Aura", "Fone Bluetooth Aura 67", 67.67, "Áudio", ""),
                new Produto(2, "Caixa de Som Portátil Pulse", "Caixa de Som Pulse.", 850.00, "Casa", ""),
                new Produto(3, "Smartwatch Fit Stop", "Smartwatch Paraguaio.", 25.00, "Vestível", ""),
                new Produto(4, "Webcam Full HD", "Webcam Full HD 10 pixels, 2 frames por minuto.", 18.50, "Casa", ""),
                new Produto(6, "Teclado Mecânico K9", "Teclado Mecânico K9", 349.90, "Casa", ""),
                new Produto(7, "Luminária LED Lumen", "Luminária LED Lumen.", 219.90, "Casa", ""),
                new Produto(8, "Powerbank", "Powerbank 20.000mAh.", 18.50, "Casa", ""),
                new Produto(9, "Fone com Fio Studio", "Fone com Fio Studio.", 99.90, "Acessório", ""),
            ];
            this.salvarProdutosStorage();
        }
    }

    salvarProdutosStorage() {
        localStorage.setItem("cardapio_restaurante", JSON.stringify(this.produtos));
    }

    cadastrarProduto(nome, descricao, preco, categoria, imagem) {
        const novoId = this.produtos.length > 0 ? Math.max(...this.produtos.map(p => p.id)) + 1 : 1;
        const produto = new Produto(novoId, nome, descricao, preco, categoria, imagem);
        this.produtos.push(produto);
        this.salvarProdutosStorage();
    }

    editarProduto(id, nome, descricao, preco, categoria, imagem) {
        const index = this.produtos.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.produtos[index] = new Produto(parseInt(id), nome, descricao, preco, categoria, imagem);
            this.salvarProdutosStorage();
        }
    }

    removerProduto(id) {
        this.produtos = this.produtos.filter(p => p.id !== parseInt(id));
        this.carrinho.removerItem(parseInt(id));
        this.salvarProdutosStorage();
    }

    listarProdutos() {
        return this.produtos;
    }

    buscarProdutoPorId(id) {
        return this.produtos.find(p => p.id === parseInt(id));
    }
}

const sistema = new Gerenciador();

const gradeCardapio = document.querySelector("#grade-cardapio");
const carouselTrack = document.querySelector("#carousel-track");
const btnPrev = document.querySelector("#carousel-prev");
const btnNext = document.querySelector("#carousel-next");
const botoesFiltro = document.querySelectorAll(".filter-btn");
const listaItensCarrinho = document.querySelector("#lista-itens-carrinho");
const contadorCarrinho = document.querySelector("#contador-carrinho");
const subtotalValor = document.querySelector("#subtotal-valor");
const taxaValor = document.querySelector("#taxa-valor");
const totalValor = document.querySelector("#total-valor");
const radiosEntrega = document.querySelectorAll("input[name='tipoEntrega']");
const clienteNome = document.querySelector("#cliente-nome");
const btnFinalizar = document.querySelector("#btn-finalizar");
const btnLimparCarrinho = document.querySelector("#btn-limpar-carrinho");
const formProduto = document.querySelector("#form-produto");
const produtoIdInput = document.querySelector("#produto-id");
const produtoNomeInput = document.querySelector("#produto-nome");
const produtoDescricaoInput = document.querySelector("#produto-descricao");
const produtoPrecoInput = document.querySelector("#produto-preco");
const produtoCategoriaInput = document.querySelector("#produto-categoria");
const produtoImagemInput = document.querySelector("#produto-imagem");
const adminFormTitle = document.querySelector("#admin-form-title");
const btnCancelarEdicao = document.querySelector("#btn-cancelar-edicao");
const tabelaProdutosCorpo = document.querySelector("#tabela-produtos-corpo");
const toastFeedback = document.querySelector("#toast-feedback");
const botaoTema = document.querySelector("#botao-tema");

let filtroCategoriaAtual = "Todos";
let indiceSlideAtual = 0;

function mostrarToast(mensagem) {
    toastFeedback.textContent = mensagem;
    toastFeedback.classList.remove("hidden");
    setTimeout(() => {
        toastFeedback.classList.add("hidden");
    }, 3000);
}

function formatarMoeda(valor) {
    return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function renderizarTudo() {
    renderizarCarousel();
    renderizarCardapio();
    renderizarCarrinho();
    renderizarTabelaAdmin();
}

function renderizarCarousel() {
    if (!carouselTrack) return;
    const produtos = sistema.listarProdutos();
    carouselTrack.innerHTML = produtos.map(p => `
        <div class="carousel-slide">
            <img src="${p.imagem}" alt="${p.nome}">
            <div class="carousel-info">
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
                <span class="carousel-price">${formatarMoeda(p.preco)}</span>
                <button class="btn-primary" onclick="adicionarAoCarrinho(${p.id})">Adicionar ao Carrinho</button>
            </div>
        </div>
    `).join("");
    atualizarSlide();
}

function atualizarSlide() {
    const slides = carouselTrack.querySelectorAll(".carousel-slide");
    if (slides.length === 0) return;
    if (indiceSlideAtual >= slides.length) indiceSlideAtual = 0;
    if (indiceSlideAtual < 0) indiceSlideAtual = slides.length - 1;
    carouselTrack.style.transform = `translateX(-${indiceSlideAtual * 100}%)`;
}

if (btnNext) {
    btnNext.addEventListener("click", () => {
        indiceSlideAtual++;
        atualizarSlide();
    });
}

if (btnPrev) {
    btnPrev.addEventListener("click", () => {
        indiceSlideAtual--;
        atualizarSlide();
    });
}

function renderizarCardapio() {
    if (!gradeCardapio) return;
    const produtos = sistema.listarProdutos();
    const filtrados = filtroCategoriaAtual === "Todos" 
        ? produtos 
        : produtos.filter(p => p.categoria === filtroCategoriaAtual);

    gradeCardapio.innerHTML = filtrados.length > 0 ? filtrados.map(p => `
        <article class="card">
            <img src="${p.imagem}" alt="${p.nome}">
            <div class="card-body">
                <h3>${p.nome}</h3>
                <p>${p.descricao}</p>
            </div>
            <div class="card-footer">
                <span class="card-price">${formatarMoeda(p.preco)}</span>
                <button class="btn-primary" onclick="adicionarAoCarrinho(${p.id})">Comprar</button>
            </div>
        </article>
    `).join("") : "<p>Nenhum produto encontrado nesta categoria.</p>";
}
if (termoPesquisa) {
    filtrados = filtrados.filter(i => 
        i.titulo.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
        i.descricao.toLowerCase().includes(termoPesquisa.toLowerCase())
    );}
window.adicionarAoCarrinho = function(id) {
    const produto = sistema.buscarProdutoPorId(id);
    if (produto) {
        sistema.carrinho.adicionarProduto(produto, 1);
        renderizarCarrinho();
        mostrarToast(`${produto.nome} adicionado ao carrinho!`);
    }
};
pesquisa.addEventListener("input", (e) => {
    termoPesquisa = e.target.value.trim();
    visiveis = ITENS_POR_PAGINA;
    renderizar();
});

function renderizarCarrinho() {
    if (!listaItensCarrinho) return;
    const itens = sistema.carrinho.itens;
    
    contadorCarrinho.textContent = itens.reduce((acc, item) => acc + item.quantidade, 0);

    if (itens.length === 0) {
        listaItensCarrinho.innerHTML = `<p class="empty-cart">Seu carrinho está vazio.</p>`;
        btnFinalizar.disabled = true;
    } else {
        listaItensCarrinho.innerHTML = itens.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.produto.nome}</h4>
                    <p>${formatarMoeda(item.produto.preco)} un.</p>
                </div>
                <div class="cart-item-actions">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="alterarQtd(${item.produto.id}, ${item.quantidade - 1})">-</button>
                        <span class="qty-value">${item.quantidade}</span>
                        <button class="qty-btn" onclick="alterarQtd(${item.produto.id}, ${item.quantidade + 1})">+</button>
                    </div>
                    <span>${formatarMoeda(item.obterSubtotal())}</span>
                    <button class="btn-icon-danger" onclick="removerItemCarrinho(${item.produto.id})" title="Remover">🗑️</button>
                </div>
            </div>
        `).join("");
        btnFinalizar.disabled = false;
    }

    subtotalValor.textContent = formatarMoeda(sistema.carrinho.calcularSubtotal());
    taxaValor.textContent = formatarMoeda(sistema.carrinho.calcularTaxaEntrega());
    totalValor.textContent = formatarMoeda(sistema.carrinho.calcularTotal());
}

window.alterarQtd = function(id, novaQtd) {
    sistema.carrinho.alterarQuantidade(id, novaQtd);
    renderizarCarrinho();
};

window.removerItemCarrinho = function(id) {
    if (confirm("Deseja realmente remover este item do carrinho?")) {
        sistema.carrinho.removerItem(id);
        renderizarCarrinho();
        mostrarToast("Item removido do carrinho.");
    }
};

if (btnLimparCarrinho) {
    btnLimparCarrinho.addEventListener("click", () => {
        if (sistema.carrinho.itens.length > 0 && confirm("Deseja esvaziar o carrinho?")) {
            sistema.carrinho.limpar();
            renderizarCarrinho();
            mostrarToast("Carrinho limpo.");
        }
    });
}

radiosEntrega.forEach(radio => {
    radio.addEventListener("change", (e) => {
        sistema.carrinho.tipoEntrega = e.target.value;
        renderizarCarrinho();
    });
});

if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        const nome = clienteNome.value.trim();
        if (!nome) {
            alert("Por favor, preencha o nome do cliente antes de finalizar o pedido.");
            clienteNome.focus();
            return;
        }

        const novoPedido = new Pedido(
            nome, 
            sistema.carrinho.itens, 
            sistema.carrinho.tipoEntrega, 
            sistema.carrinho.calcularTotal()
        );

        console.log("Pedido Finalizado Gerado:", novoPedido);
        mostrarToast(`Pedido de ${novoPedido.cliente} finalizado! Total: ${formatarMoeda(novoPedido.total)}`);
        
        sistema.carrinho.limpar();
        clienteNome.value = "";
        renderizarCarrinho();
    });
}

function renderizarTabelaAdmin() {
    if (!tabelaProdutosCorpo) return;
    const produtos = sistema.listarProdutos();
    tabelaProdutosCorpo.innerHTML = produtos.map(p => `
        <tr>
            <td><img src="${p.imagem}" alt="${p.nome}"></td>
            <td><strong>${p.nome}</strong><br><small>${p.descricao}</small></td>
            <td>${p.categoria}</td>
            <td>${formatarMoeda(p.preco)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-edit" onclick="prepararEdicao(${p.id})">Editar</button>
                    <button class="btn-delete" onclick="excluirProduto(${p.id})">Excluir</button>
                </div>
            </td>
        </tr>
    `).join("");
}

if (formProduto) {
    formProduto.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = produtoIdInput.value;
        const nome = produtoNomeInput.value.trim();
        const descricao = produtoDescricaoInput.value.trim();
        const preco = parseFloat(produtoPrecoInput.value);
        const categoria = produtoCategoriaInput.value;
        const imagem = produtoImagemInput.value.trim();

        if (id) {
            sistema.editarProduto(id, nome, descricao, preco, categoria, imagem);
            mostrarToast("Produto atualizado!");
        } else {
            sistema.cadastrarProduto(nome, descricao, preco, categoria, imagem);
            mostrarToast("Produto cadastrado!");
        }

        resetarFormularioAdmin();
        renderizarTudo();
    });
}

window.prepararEdicao = function(id) {
    const produto = sistema.buscarProdutoPorId(id);
    if (produto) {
        produtoIdInput.value = produto.id;
        produtoNomeInput.value = produto.nome;
        produtoDescricaoInput.value = produto.descricao;
        produtoPrecoInput.value = produto.preco;
        produtoCategoriaInput.value = produto.categoria;
        produtoImagemInput.value = produto.imagem;
        
        adminFormTitle.textContent = "Editar Produto";
        btnSalvarProduto.textContent = "Atualizar Produto";
        btnCancelarEdicao.classList.remove("escondido");
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
};

const btnSalvarProduto = document.querySelector("#btn-salvar-produto");

if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener("click", () => {
        resetarFormularioAdmin();
    });
}

function resetarFormularioAdmin() {
    formProduto.reset();
    produtoIdInput.value = "";
    adminFormTitle.textContent = "Cadastrar Novo Produto";
    btnSalvarProduto.textContent = "Salvar Produto";
    btnCancelarEdicao.classList.add("escondido");
}

window.excluirProduto = function(id) {
    if (confirm("Deseja realmente remover este produto do cardápio?")) {
        sistema.removerProduto(id);
        renderizarTudo();
        mostrarToast("Produto removido do cardápio.");
    }
};

botoesFiltro.forEach(btn => {
    btn.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        filtroCategoriaAtual = btn.dataset.filter;
        renderizarCardapio();
    });
});

if (botaoTema) {
    botaoTema.addEventListener("click", () => {
        const isDark = document.body.getAttribute("data-theme") === "dark";
        if (isDark) {
            document.body.removeAttribute("data-theme");
            botaoTema.textContent = "🌙 Escuro";
        } else {
            document.body.setAttribute("data-theme", "dark");
            botaoTema.textContent = "☀️ Claro";
        }
    });
}

renderizarTudo();