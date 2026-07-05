import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, LogOut, ArrowLeft, Download } from 'lucide-react';
import './secretaria.css';
import { api } from "../../services/api";

const API_URL = api.defaults.baseURL!;
const CORES_ESCOLAS = ['cor-vermelho', 'cor-azul-medio', 'cor-azul-escuro', 'cor-azul-medio', 'cor-azul-escuro'];

interface Escola {
  id: number | string;
  nome?: string;
  name?: string;
  bairro?: string;
  endereco?: string;
  email?: string;
  telefone?: string;
  diretor?: string;
  supervisor?: string;
  indiceSace?: number;
}

interface Cardapio {
  id: number | string;
  titulo?: string;
  dataEnvio?: string;
  status?: string;
  semana?: string;
  mes?: number;
  ano?: number;
  motivoReprovacao?: string;
  dias?: any[];
}

interface Referencia {
  id: string;
  faixaEtaria: string;
  dieta: string;
  kcalAlvo: number;
  choMin: number;
  choMax: number;
  ptnMin: number;
  ptnMax: number;
  lipMin: number;
  lipMax: number;
  sodioMaxMg: number;
}

export default function SelecaoEscola() {
  const [abaAtiva, setAbaAtiva] = useState<'escolas' | 'calendario' | 'sair'>('escolas');
  const [usuario, setUsuario] = useState<any>(null);


  const [produtoAberto, setProdutoAberto] = useState<string | null>(null);

  // Estados Escolas
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(true);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [busca, setBusca] = useState('');

  // Estados DINÂMICOS DO BANCO DE DADOS (Sem dados inventados!)
  const [carregandoDashboard, setCarregandoDashboard] = useState(false);
  const [dashboardEscola, setDashboardEscola] = useState<{
    totais: { alunosContados: number; pratosServidos: number; desperdicioKg: number };
    graficoAlunos: { dia: string; valor: number; max: number }[];
    graficoDesperdicio: { dia: string; valor: number; label: string }[];
    itensEstoque: any[];
  }>({
    totais: { alunosContados: 0, pratosServidos: 0, desperdicioKg: 0 },
    graficoAlunos: [
      { dia: 'Seg.', valor: 0, max: 500 }, { dia: 'Ter.', valor: 0, max: 500 },
      { dia: 'Qua.', valor: 0, max: 500 }, { dia: 'Qui.', valor: 0, max: 500 }, { dia: 'Sex.', valor: 0, max: 500 }
    ],
    graficoDesperdicio: [
      { dia: 'Seg.', valor: 0, label: '0kg' }, { dia: 'Ter.', valor: 0, label: '0kg' },
      { dia: 'Qua.', valor: 0, label: '0kg' }, { dia: 'Qui.', valor: 0, label: '0kg' }, { dia: 'Sex.', valor: 0, label: '0kg' }
    ],
    itensEstoque: []
  });

  // Estados Cardápios
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [carregandoCardapios, setCarregandoCardapios] = useState(false);
  const [cardapioSelecionado, setCardapioSelecionado] = useState<Cardapio | null>(null);

  // Toggle Interno Cardápio vs Valor Nutri
  const [subAbaDetalhe, setSubAbaDetalhe] = useState<'cardapio' | 'nutricional'>('cardapio');

  // Modais de Ação (Cardápio)
  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [textoMotivo, setTextoMotivo] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  // ================== ESTOQUE — Nova Entrada de Lote ==================
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]);
  const [formEntrada, setFormEntrada] = useState({
    produtoId: '', lote: '', quantidade: '', unidade: 'kg', validade: ''
  });

  // ================== ESTOQUE — Ajuste de Lote (delta) ==================
  const [modalAjusteLoteAberto, setModalAjusteLoteAberto] = useState(false);
  const [itemParaAjuste, setItemParaAjuste] = useState<any>(null);
  const [deltaAjuste, setDeltaAjuste] = useState('');
  const [motivoAjusteLote, setMotivoAjusteLote] = useState('');
  const [salvandoEstoque, setSalvandoEstoque] = useState(false);

  // Carregar Escolas
  useEffect(() => {
    async function carregarEscolas() {
      try {
        setCarregandoEscolas(true);
        const res = await fetch(`${API_URL}/escolas`);
        if (res.ok) {
          const dados = await res.json();
          setEscolas(dados);
          if (window.innerWidth > 768 && dados.length > 0 && !escolaSelecionada) {
            setEscolaSelecionada(dados[0]);
          }
        }
      } catch (err) { console.error(err); } finally { setCarregandoEscolas(false); }
    }
    carregarEscolas();
  }, []);

  // CARREGAR DADOS REAIS DO BANCO QUANDO A ESCOLA É SELECIONADA
  const carregarDashboardEscola = async () => {
    if (!escolaSelecionada) return;
    try {
      setCarregandoDashboard(true);
      const res = await fetch(`${API_URL}/escolas/${escolaSelecionada.id}/dashboard`);
      if (res.ok) {
        const dados = await res.json();
        setDashboardEscola(dados);
      }
    } catch (err) {
      console.error("Erro ao puxar dashboard real da escola:", err);
    } finally {
      setCarregandoDashboard(false);
    }
  };

  useEffect(() => {
    carregarDashboardEscola();
  }, [escolaSelecionada]);

  // Carregar Usuário Autenticado
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const resposta = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resposta.ok) setUsuario(await resposta.json());
      } catch (err) { console.error(err); }
    }
    loadUser();
  }, []);

  // Carregar Cardápios e Referências
  useEffect(() => {
    if (abaAtiva === 'calendario') {
      async function carregarDados() {
        try {
          setCarregandoCardapios(true);
          const [resCard, resRef] = await Promise.all([
            fetch(`${API_URL}/cardapios`),
            fetch(`${API_URL}/referencias`)
          ]);
          if (resCard.ok) {
            const dadosCardapios = await resCard.json();
            setCardapios(dadosCardapios);
            if (window.innerWidth > 768 && dadosCardapios.length > 0 && !cardapioSelecionado) {
              setCardapioSelecionado(dadosCardapios[0]);
            }
          }
          if (resRef.ok) setReferencias(await resRef.json());
        } catch (err) { console.error(err); } finally { setCarregandoCardapios(false); }
      }
      carregarDados();
    }
  }, [abaAtiva]);

  const handleAprovar = async () => {
    if (!cardapioSelecionado) return;

    try {
      setAtualizandoStatus(true);
      const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Aprovado' })
      });

      if (res.ok) {
        const atualizado = { ...cardapioSelecionado, status: 'Aprovado' };
        setCardapioSelecionado(atualizado);
        setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
      } else {
        const erroMsg = await res.text();
        console.error("Erro retornado pelo servidor ao aprovar:", erroMsg);
        alert("Não foi possível aprovar o cardápio no banco de dados. Verifique o terminal do Back-end!");
      }
    } catch (err) {
      console.error("Erro de conexão ao aprovar:", err);
      alert("Erro ao conectar com o servidor para aprovar o cardápio.");
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // REPROVAR CARDÁPIO
  const handleConfirmarReprovacao = async () => {
    if (!cardapioSelecionado || !textoMotivo.trim()) {
      alert("Escreva o motivo da reprovação!");
      return;
    }

    try {
      setAtualizandoStatus(true);
      const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reprovado', motivoReprovacao: textoMotivo })
      });

      if (res.ok) {
        const atualizado = { ...cardapioSelecionado, status: 'Reprovado', motivoReprovacao: textoMotivo };
        setCardapioSelecionado(atualizado);
        setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
        setModalReprovarAberto(false);
        setTextoMotivo('');
      } else {
        const erroMsg = await res.text();
        console.error("Erro retornado pelo servidor ao reprovar:", erroMsg);
        alert("Não foi possível reprovar o cardápio no banco de dados.");
      }
    } catch (err) {
      console.error("Erro de conexão ao reprovar:", err);
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // ================== ESTOQUE — Handlers ==================

  const abrirModalEntrada = async (produtoIdPreSelecionado?: string) => {
    if (listaProdutos.length === 0) {
      try {
        const res = await fetch(`${API_URL}/produto`);
        if (res.ok) setListaProdutos(await res.json());
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    }
    setFormEntrada({
      produtoId: produtoIdPreSelecionado ?? '',
      lote: '',
      quantidade: '',
      unidade: 'kg',
      validade: ''
    });
    setModalEntradaAberto(true);
  };

  const handleSalvarEntrada = async () => {
    const { produtoId, lote, quantidade, unidade, validade } = formEntrada;

    if (!produtoId || !lote || !quantidade || !validade) {
      alert("Preencha produto, lote, quantidade e validade.");
      return;
    }

    try {
      setSalvandoEstoque(true);
      const res = await fetch(`${API_URL}/estoqueController/entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escolaId: escolaSelecionada?.id,
          produtoId,
          lote,
          quantidade: Number(quantidade),
          unidade,
          validade
        })
      });

      if (res.ok) {
        setModalEntradaAberto(false);
        await carregarDashboardEscola();
      } else {
        const erroMsg = await res.text();
        console.error("Erro ao registrar entrada de estoque:", erroMsg);
        alert("Não foi possível registrar a entrada de estoque.");
      }
    } catch (err) {
      console.error("Erro de conexão ao registrar entrada:", err);
      alert("Erro ao conectar com o servidor para registrar a entrada.");
    } finally {
      setSalvandoEstoque(false);
    }
  };

  const abrirModalAjusteLote = (item: any) => {
    setItemParaAjuste(item);
    setDeltaAjuste('');
    setMotivoAjusteLote('');
    setModalAjusteLoteAberto(true);
  };

  const handleSalvarAjusteLote = async () => {
    if (!itemParaAjuste || !deltaAjuste.trim()) {
      alert("Informe a quantidade a retirar (ex: -5) ou adicionar (ex: 10).");
      return;
    }

    const delta = Number(deltaAjuste);
    if (Number.isNaN(delta) || delta === 0) {
      alert("Informe um número válido, diferente de zero.");
      return;
    }

    const novaQuantidade = (itemParaAjuste.quantidade ?? 0) + delta;

    if (novaQuantidade < 0) {
      alert("Essa retirada deixaria o lote com quantidade negativa.");
      return;
    }

    try {
      setSalvandoEstoque(true);
      const res = await fetch(`${API_URL}/estoqueController/ajuste`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estoqueId: itemParaAjuste.estoqueId,
          itemId: itemParaAjuste.id,
          novaQuantidade,
          motivo: motivoAjusteLote.trim() || (delta > 0 ? "Adição manual" : "Retirada manual")
        })
      });

      if (res.ok) {
        setModalAjusteLoteAberto(false);
        await carregarDashboardEscola();
      } else {
        const erroMsg = await res.text();
        console.error("Erro ao ajustar lote:", erroMsg);
        alert("Não foi possível ajustar o lote.");
      }
    } catch (err) {
      console.error("Erro de conexão ao ajustar lote:", err);
      alert("Erro ao conectar com o servidor para ajustar o lote.");
    } finally {
      setSalvandoEstoque(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // Produtos já usados por esta escola (vem do dashboard já carregado, sem fetch extra)
  const produtosDaEscolaUnicos = Array.from(
    new Map(
      (Array.isArray(dashboardEscola?.itensEstoque) ? dashboardEscola.itensEstoque : [])
        .map((item: any) => item?.produto)
        .filter((p: any) => p?.id)
        .map((p: any) => [p.id, p])
    ).values()
  );

  const idsProdutosDaEscola = new Set(produtosDaEscolaUnicos.map((p: any) => p.id));
  const outrosProdutosCatalogo = listaProdutos.filter((p: any) => !idsProdutosDaEscola.has(p.id));

  // Agrupa os lotes (itensEstoque, formato "flat" vindo do backend — um
  // item por lote) por produto, só para a visão desktop, que mostra o
  // total por produto e a lista de lotes dentro do accordion.
  const itensEstoquePorProduto = React.useMemo(() => {
    const lista = Array.isArray(dashboardEscola?.itensEstoque) ? dashboardEscola.itensEstoque : [];
    const mapa = new Map<string, { produto: any; total: number; lotes: any[] }>();

    for (const item of lista) {
      const chave = item?.produto?.id ?? item?.produto?.nome ?? 'sem-produto';

      if (!mapa.has(chave)) {
        mapa.set(chave, { produto: item?.produto, total: 0, lotes: [] });
      }

      const grupo = mapa.get(chave)!;
      grupo.total += item?.quantidade ?? 0;
      grupo.lotes.push(item);
    }

    return Array.from(mapa.values());
  }, [dashboardEscola?.itensEstoque]);

  const escolasFiltradas = escolas.filter((escola) => (escola.nome || escola.name || '').toLowerCase().includes(busca.toLowerCase()));

  const getClasseStatus = (status: string = '') => {
    switch (status) {
      case 'Esperando': return 'card-esperando';
      case 'Reprovado': return 'card-reprovado';
      case 'Aprovado': default: return 'card-aprovado';
    }
  };

  return (
    <div className={`app-container ${abaAtiva !== 'sair' ? 'modo-desktop-expandido' : ''}`}>

      {/* CABEÇALHO */}
      <header className="cabecalho">
        <div className="cabecalho-esquerda">
          {((abaAtiva === 'escolas' && escolaSelecionada) || (abaAtiva === 'calendario' && cardapioSelecionado)) ? (
            <button onClick={() => { setEscolaSelecionada(null); setCardapioSelecionado(null); }} className="btn-voltar-cabecalho so-no-mobile">
              <LogOut className="icone-girado" size={22} />
            </button>
          ) : null}
          <div className="cabecalho-texto">
            <h1>SECRETARIA</h1>
            <p>{usuario ? usuario.nome : "Nome do responsável"}</p>
          </div>
        </div>
      </header>

      {/* =========================================================================
          ABA 1: ESCOLAS CONECTADA AO BANCO DE DADOS
      ========================================================================= */}
      {abaAtiva === 'escolas' && (
        <div className="layout-split-desktop">

          <aside className={`coluna-lista-escolas ${escolaSelecionada ? 'esconder-no-mobile' : ''}`}>
            <div className="barra-busca-container">
              <div className="input-busca-wrapper">
                <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} className="input-busca" placeholder="Buscar escola..." />
                <Search className="icone-busca" size={18} />
              </div>
            </div>

            <div className="lista-escolas">
              {carregandoEscolas ? (
                <p className="msg-vazio">Carregando escolas...</p>
              ) : escolasFiltradas.map((escola, index) => {
                const ativo = escolaSelecionada?.id === escola.id;
                const corClasse = CORES_ESCOLAS[index % CORES_ESCOLAS.length];
                return (
                  <button key={escola.id} onClick={() => setEscolaSelecionada(escola)} className={`btn-escola ${corClasse} ${ativo ? 'selecionada' : ''}`}>
                    {escola.nome || escola.name || `Escola #${escola.id}`}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* COLUNA DIREITA: DADOS REAIS DO MYSQL */}
          <section className={`coluna-detalhe-escola ${!escolaSelecionada ? 'esconder-no-mobile' : ''}`}>
            {escolaSelecionada ? (
              carregandoDashboard ? (
                <div className="painel-vazio-msg">Puxando dados reais do banco de dados...</div>
              ) : (
                <>
                  {/* TOPO MOBILE */}
                  <div className="detalhe-topo so-no-mobile">
                    <button onClick={() => setEscolaSelecionada(null)} className="btn-voltar-simples">
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="detalhe-titulo">{escolaSelecionada.nome || escolaSelecionada.name}</h2>
                  </div>

                  {/* TOPO DESKTOP */}
                  <header className="header-escola-desktop so-no-desktop">
                    <h2 className="titulo-escola-grandao">{escolaSelecionada.nome || escolaSelecionada.name}</h2>
                    <div className="grid-info-escola-desktop">
                      <div><span className="info-lbl">Bairro</span><span className="info-val">{escolaSelecionada.bairro || 'Não informado'}</span></div>
                      <div><span className="info-lbl">Endereço</span><span className="info-val">{escolaSelecionada.endereco || 'Não informado'}</span></div>
                      <div><span className="info-lbl">Email</span><span className="info-val font-bold text-blue-800">{escolaSelecionada.email || 'Não informado'}</span></div>
                      <div><span className="info-lbl">Telefone</span><span className="info-val">{escolaSelecionada.telefone || 'Não informado'}</span></div>
                      <div><span className="info-lbl">Diretor(a)</span><span className="info-val">{escolaSelecionada.diretor || 'Não informado'}</span></div>
                      <div><span className="info-lbl">Supervisor(a)</span><span className="info-val">{escolaSelecionada.supervisor || 'Não informado'}</span></div>
                    </div>
                  </header>

                  <div className="badge-sace so-no-mobile">INDICE SACE - {escolaSelecionada.indiceSace || 'Sem nota'}/100</div>

                  <div className="grid-tres-colunas-escola">

                    {/* SUB-COLUNA 1 */}
                    <div className="sub-coluna-escola">
                      <div className="data-seletor-bar">
                        <span>RESUMO GERAL DO BANCO</span>
                        <Calendar size={18} />
                      </div>

                      <div className="stats-diario-grid">
                        <div className="stat-box">
                          <span className="stat-label">Alunos Contados</span>
                          <span className="stat-num">{dashboardEscola?.totais?.alunosContados ?? 0}</span>
                        </div>

                        <div className="stat-box">
                          <span className="stat-label">Pratos Servidos</span>
                          <span className="stat-num">{dashboardEscola?.totais?.pratosServidos ?? 0}</span>
                        </div>

                        <div className="stat-box">
                          <span className="stat-label">Desperdício (Kg)</span>
                          <span className="stat-num">{dashboardEscola?.totais?.desperdicioKg ?? 0}kg</span>
                        </div>
                      </div>

                      {/* GRÁFICO DESPERDÍCIO (REAL DO BANCO) */}
                      <div className="secao-grafico">
                        <h3 className="subtitulo-secao">GRÁFICO DE DESPERDÍCIO GRAVADO</h3>

                        <div className="grafico-barras">
                          {(dashboardEscola?.graficoDesperdicio ?? []).map((item: any, idx: number) => {
                            const max = Math.max(
                              1,
                              ...(dashboardEscola?.graficoDesperdicio ?? []).map((i: any) => i.valor || 0)
                            );

                            const porcentagem = ((item.valor || 0) / max) * 100;

                            return (
                              <div key={idx} className="linha-grafico">
                                <span className="label-dia">{item.dia}</span>

                                <div className="barra-fundo">
                                  <div
                                    className="barra-preenchida"
                                    style={{ width: `${porcentagem}%` }}
                                  >
                                    <span className="barra-texto">
                                      {item.valor ?? 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* GRÁFICO ALUNOS (REAL DO BANCO) */}
                      <div className="secao-grafico">
                        <h3 className="subtitulo-secao">GRÁFICO DE ALUNOS CONTADOS</h3>

                        <div className="grafico-barras">
                          {(dashboardEscola?.graficoAlunos ?? []).map((item: any, idx: number) => {
                            const max = Math.max(
                              1,
                              ...(dashboardEscola?.graficoAlunos ?? []).map((i: any) => i.valor || 0)
                            );

                            const porcentagem = ((item.valor || 0) / max) * 100;

                            return (
                              <div key={idx} className="linha-grafico">
                                <span className="label-dia">{item.dia}</span>

                                <div className="barra-fundo">
                                  <div
                                    className="barra-preenchida"
                                    style={{ width: `${porcentagem}%` }}
                                  >
                                    <span className="barra-texto">
                                      {item.valor ?? 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SUB-COLUNA 2 — ESTOQUE (AGORA FUNCIONAL) */}
                    <div className="sub-coluna-escola so-no-desktop">
                      <div className="cabecalho-estoque-com-botao">
                        <h3 className="subtitulo-secao">ESTOQUE DO BANCO DE DADOS</h3>
                        <button onClick={() => abrirModalEntrada()} className="btn-nova-entrada">
                          + NOVA ENTRADA
                        </button>
                      </div>

                      <div className="estoque-lista-desktop">
                        {itensEstoquePorProduto.map((produto: any) => (
                          <div key={produto?.produto?.id ?? Math.random()} className="produto-bloco">

                            <div
                              className="produto-header"
                              onClick={() =>
                                setProdutoAberto(
                                  produtoAberto === produto?.produto?.id
                                    ? null
                                    : produto?.produto?.id
                                )
                              }
                            >
                              <span>{produto?.produto?.nome ?? "Produto"}</span>
                              <span>{produto?.total ?? 0} KG</span>
                            </div>

                            {produtoAberto === produto?.produto?.id && (
                              <div className="lotes-container">

                                {(Array.isArray(produto?.lotes)
                                  ? produto.lotes
                                  : []
                                ).map((lote: any) => (
                                  <div
                                    key={lote?.id ?? Math.random()}
                                    className="linha-lote linha-lote-clicavel"
                                    onClick={() => abrirModalAjusteLote(lote)}
                                    title="Clique para ajustar a quantidade deste lote"
                                  >
                                    <span>Lote: {lote?.lote ?? "N/A"}</span>
                                    <span>{lote?.quantidade ?? 0}</span>
                                    <span>
                                      {lote?.validade
                                        ? new Date(lote.validade).toLocaleDateString("pt-BR")
                                        : "Sem validade"}
                                    </span>
                                  </div>
                                ))}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirModalEntrada(produto?.produto?.id);
                                  }}
                                  className="btn-add-lote"
                                >
                                  + Adicionar lote
                                </button>

                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SUB-COLUNA 3 */}
                    <div className="sub-coluna-escola so-no-desktop">
                      <h3 className="subtitulo-secao">PEDIDOS DE REPOSIÇÃO AUTOMÁTICOS</h3>

                      <div className="caixa-pedido-estoque">
                        <p style={{ fontWeight: 700, marginBottom: '12px' }}>
                          Itens com baixo estoque:
                        </p>

                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(dashboardEscola?.itensEstoque ?? []).filter((i: any) => (i.quantidade ?? 0) <= 15).length > 0 ? (
                            dashboardEscola.itensEstoque
                              .filter((i: any) => (i.quantidade ?? 0) <= 15)
                              .map((item: any) => (
                                <li key={item.id} style={{ color: '#ef4444', fontWeight: 600 }}>
                                  • {item.produto?.nome} – crítico ({item.quantidade} {item.unidade})
                                </li>
                              ))
                          ) : (
                            <li style={{ color: '#22c55e', fontWeight: 600 }}>
                              • Estoque dentro do nível seguro
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    {/* MOBILE TABLE */}
                    <div className="secao-grafico mb-6 so-no-mobile">
                      <div className="cabecalho-estoque-com-botao">
                        <h3 className="subtitulo-secao">ESTOQUE DO BANCO</h3>
                        <button onClick={() => abrirModalEntrada()} className="btn-nova-entrada">
                          + NOVA ENTRADA
                        </button>
                      </div>

                      <div className="tabela-estoque-box">
                        {(dashboardEscola?.itensEstoque ?? []).length > 0 ? (
                          dashboardEscola.itensEstoque.map((est: any) => (
                            <div
                              key={est.id}
                              className="linha-estoque linha-estoque-clicavel"
                              onClick={() => abrirModalAjusteLote(est)}
                            >
                              <span>{est.produto?.nome}</span>
                              <span>{est.quantidade} {est.unidade}</span>
                              <span>{est.lote || 'N/A'}</span>
                              <span>
                                {est.validade
                                  ? new Date(est.validade).toLocaleDateString('pt-BR')
                                  : 'N/A'}
                              </span>

                              <div className={`status-quadrado ${est.quantidade <= 10 ? 'status-vermelho' : 'status-verde'}`} />
                            </div>
                          ))
                        ) : (
                          <p style={{ padding: '12px', fontSize: '0.75rem' }}>
                            Nenhum estoque no banco
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </>
              )
            ) : (
              <div className="painel-vazio-msg">Selecione uma escola na lista à esquerda para ver os dados reais do banco.</div>
            )}
          </section>

        </div>
      )}

      {/* =========================================================================
          ABA 2: CALENDÁRIO / CARDÁPIOS
      ========================================================================= */}
      {abaAtiva === 'calendario' && (
        <div className="layout-split-desktop">

          <aside className={`coluna-lista-cardapios ${cardapioSelecionado ? 'esconder-no-mobile' : ''}`}>
            {carregandoCardapios ? (
              <p className="msg-vazio">Buscando cardápios...</p>
            ) : cardapios.map((item: any) => {
              const ativo = cardapioSelecionado?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { setCardapioSelecionado(item); setSubAbaDetalhe('cardapio'); }}
                  className={`card-item ${getClasseStatus(item.status)} ${ativo ? 'selecionado' : ''}`}
                >
                  <h3 className="card-titulo">{item.titulo || `Cardápio - Mês ${item.mes}/${item.ano}`}</h3>
                  <div className="card-rodape">
                    <span>{item.dataEnvio || '08:01:47 - 05/07/2026'}</span>
                    <span style={{ fontWeight: 700 }}>{item.status || 'Esperando'}</span>
                  </div>

                  {item.status === 'Reprovado' && (
                    <div className="caixa-motivo-lateral">
                      {item.motivoReprovacao || "Durante a análise, foram identificadas inadequações na distribuição dos nutrientes."}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          <section className={`coluna-detalhe-cardapio ${!cardapioSelecionado ? 'esconder-no-mobile' : ''}`}>
            {cardapioSelecionado ? (
              <>
                <div className="painel-cabecalho-linha">
                  <div className="painel-titulo-box">
                    <button onClick={() => setCardapioSelecionado(null)} className="btn-voltar-simples so-no-mobile">
                      <ArrowLeft size={22} color="#0b5280" />
                    </button>
                    <h2 className="titulo-painel-cardapio">
                      {cardapioSelecionado.titulo ? cardapioSelecionado.titulo.toUpperCase() : `CARDÁPIO - 06/07/2026 A 10/07/2026`}
                    </h2>
                  </div>

                  <div className="botoes-acao-desktop so-no-desktop">
                    <button className="btn-download-pdf"><Download size={18} /> DOWNLOAD PDF</button>
                    {cardapioSelecionado.status === 'Aprovado' ? (
                      <div className="badge-topo-aprovado">APROVADO</div>
                    ) : cardapioSelecionado.status === 'Reprovado' ? (
                      <div className="badge-topo-reprovado">REPROVADO</div>
                    ) : (
                      <>
                        <button onClick={handleAprovar} disabled={atualizandoStatus} className="btn-topo-aprovar">APROVAR</button>
                        <button onClick={() => setModalReprovarAberto(true)} disabled={atualizandoStatus} className="btn-topo-reprovar">REPROVAR</button>
                      </>
                    )}
                  </div>
                </div>

                <button className="btn-download-pdf-mobile so-no-mobile">
                  <Download size={18} /> DOWNLOAD PDF
                </button>

                <div className="area-status-mobile so-no-mobile">
                  {cardapioSelecionado.status === 'Aprovado' ? (
                    <div className="badge-status-full-verde">APROVADO</div>
                  ) : cardapioSelecionado.status === 'Reprovado' ? (
                    <>
                      <div className="badge-status-full-vermelho">REPROVADO</div>
                      <p className="texto-motivo-exibicao">{cardapioSelecionado.motivoReprovacao || "Identificadas inadequações nutricionais."}</p>
                    </>
                  ) : (
                    <div className="botoes-aprovar-reprovar">
                      <button onClick={handleAprovar} disabled={atualizandoStatus} className="btn-acao-verde">APROVAR</button>
                      <button onClick={() => setModalReprovarAberto(true)} disabled={atualizandoStatus} className="btn-acao-vermelho">REPROVAR</button>
                    </div>
                  )}
                </div>

                <div className="toggle-container">
                  <button onClick={() => setSubAbaDetalhe('cardapio')} className={`btn-toggle ${subAbaDetalhe === 'cardapio' ? 'ativo' : 'inativo'}`}>CARDÁPIO</button>
                  <button onClick={() => setSubAbaDetalhe('nutricional')} className={`btn-toggle ${subAbaDetalhe === 'nutricional' ? 'ativo' : 'inativo'}`}>VALOR NUTRI.</button>
                </div>

                {subAbaDetalhe === 'cardapio' ? (
                  <div className="conteudo-aba">
                    <div className="subtitulo-secao-centro"><h3>CARDÁPIO CEI</h3><p>CRIANÇAS DE 6 A 12 MESES</p></div>
                    <div className="grade-tabelas-dias">
                      {cardapioSelecionado.dias && cardapioSelecionado.dias.length > 0 ? (
                        cardapioSelecionado.dias.map((itemDia: any) => (
                          <div key={itemDia.id} className="tabela-dia-box">
                            <div className="dia-box-topo"><span>{itemDia.dia}</span><span>06/07/2026</span></div>
                            <div className="dia-box-corpo">
                              {itemDia.refeicoes?.map((ref: any) => (
                                <div key={ref.id} className="linha-ref-desktop"><div className="col-ref-tipo">{ref.tipo}</div><div className="col-ref-desc">{ref.descricao}</div></div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="tabela-dia-box"><div className="dia-box-topo"><span>SEGUNDA-FEIRA</span><span>06/07/2026</span></div><div className="dia-box-corpo"><div className="linha-ref-desktop"><div className="col-ref-tipo">ALMOÇO</div><div className="col-ref-desc">Arroz papa, Caldo de feijão e Frango</div></div></div></div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="conteudo-aba">
                    <div className="subtitulo-secao-centro"><h3>VALOR NUTRI. CEI</h3><p>CRIANÇAS DE 6 A 12 MESES</p></div>
                    <div className="tabela-nutri-arredondada">
                      <div className="nutri-cabecalho"><span></span><span>KCAL</span><span>CHO (g)</span><span>PTN (g)</span><span>LIP (g)</span><span>NA (mg)</span></div>
                      <div className="nutri-linha"><strong>Seg.</strong><span>524,08</span><span>87,58</span><span>21,82</span><span>9,88</span><span>469,99</span></div>
                      <div className="nutri-linha"><strong>Ter.</strong><span>524,08</span><span>87,58</span><span>21,82</span><span>9,88</span><span>469,99</span></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="painel-vazio-msg">Selecione um cardápio na lista à esquerda.</div>
            )}
          </section>

        </div>
      )}

      {abaAtiva === 'sair' && (
        <main className="tela-centralizada"><h2>Desconectado do sistema</h2></main>
      )}

      {/* MODAL — REPROVAR CARDÁPIO */}
      {modalReprovarAberto && (
        <div className="modal-overlay">
          <div className="modal-card-motivo">
            <h3 className="modal-motivo-titulo">MOTIVO</h3>
            <textarea value={textoMotivo} onChange={(e) => setTextoMotivo(e.target.value)} placeholder="Escreva o motivo aqui..." className="modal-motivo-textarea" />
            <div className="modal-motivo-botoes">
              <button onClick={() => setModalReprovarAberto(false)} className="btn-cancelar-escuro">CANCELAR</button>
              <button onClick={handleConfirmarReprovacao} className="btn-reprovar-vermelho">REPROVAR</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — NOVA ENTRADA DE ESTOQUE */}
      {modalEntradaAberto && (
        <div className="modal-overlay">
          <div className="modal-card-motivo">
            <h3 className="modal-motivo-titulo" style={{ color: '#0b5280' }}>NOVA ENTRADA DE ESTOQUE</h3>

            <select
              value={formEntrada.produtoId}
              onChange={(e) => setFormEntrada({ ...formEntrada, produtoId: e.target.value })}
              className="input-modal-estoque"
            >
              <option value="">Selecione o produto</option>

              {produtosDaEscolaUnicos.length > 0 && (
                <optgroup label="Produtos já usados nesta escola">
                  {produtosDaEscolaUnicos.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </optgroup>
              )}

              {outrosProdutosCatalogo.length > 0 && (
                <optgroup label="Outros produtos do catálogo">
                  {outrosProdutosCatalogo.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </optgroup>
              )}
            </select>

            <input
              type="text"
              placeholder="Lote (ex: 029331)"
              value={formEntrada.lote}
              onChange={(e) => setFormEntrada({ ...formEntrada, lote: e.target.value })}
              className="input-modal-estoque"
            />

            <input
              type="number"
              placeholder="Quantidade"
              value={formEntrada.quantidade}
              onChange={(e) => setFormEntrada({ ...formEntrada, quantidade: e.target.value })}
              className="input-modal-estoque"
            />

            <select
              value={formEntrada.unidade}
              onChange={(e) => setFormEntrada({ ...formEntrada, unidade: e.target.value })}
              className="input-modal-estoque"
            >
              <option value="kg">kg</option>
              <option value="l">l</option>
              <option value="cxs">cxs.</option>
              <option value="un">un.</option>
            </select>

            <input
              type="date"
              value={formEntrada.validade}
              onChange={(e) => setFormEntrada({ ...formEntrada, validade: e.target.value })}
              className="input-modal-estoque"
            />

            <div className="modal-motivo-botoes">
              <button onClick={() => setModalEntradaAberto(false)} className="btn-cancelar-escuro">CANCELAR</button>
              <button onClick={handleSalvarEntrada} disabled={salvandoEstoque} className="btn-topo-aprovar">
                {salvandoEstoque ? "SALVANDO..." : "SALVAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — AJUSTE DE LOTE (RETIRAR/ADICIONAR) */}
      {modalAjusteLoteAberto && itemParaAjuste && (
        <div className="modal-overlay">
          <div className="modal-card-motivo">
            <h3 className="modal-motivo-titulo" style={{ color: '#0b5280' }}>
              AJUSTAR LOTE {itemParaAjuste.lote}
            </h3>
            <p style={{ marginBottom: 12, fontSize: '0.8rem', color: '#64748b' }}>
              Quantidade atual: <strong>{itemParaAjuste.quantidade}</strong> {itemParaAjuste.unidade || ''}
            </p>

            <input
              type="number"
              placeholder="Ex: -5 para retirar, 10 para adicionar"
              value={deltaAjuste}
              onChange={(e) => setDeltaAjuste(e.target.value)}
              className="input-modal-estoque"
            />

            <input
              type="text"
              placeholder="Motivo (opcional)"
              value={motivoAjusteLote}
              onChange={(e) => setMotivoAjusteLote(e.target.value)}
              className="input-modal-estoque"
            />

            <div className="modal-motivo-botoes">
              <button onClick={() => setModalAjusteLoteAberto(false)} className="btn-cancelar-escuro">CANCELAR</button>
              <button onClick={handleSalvarAjusteLote} disabled={salvandoEstoque} className="btn-topo-aprovar">
                {salvandoEstoque ? "SALVANDO..." : "CONFIRMAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RODAPÉ NO MOBILE */}
      <nav className="nav-inferior">
        <button onClick={() => { setAbaAtiva('escolas'); setEscolaSelecionada(null); setCardapioSelecionado(null); }} className={`nav-item ${abaAtiva === 'escolas' ? 'ativo' : ''}`}>
          {abaAtiva === 'escolas' && <span className="indicador-ativo"></span>}
          <GraduationCap size={26} />
        </button>
        <button onClick={() => { setAbaAtiva('calendario'); setEscolaSelecionada(null); }} className={`nav-item ${abaAtiva === 'calendario' ? 'ativo' : ''}`}>
          {abaAtiva === 'calendario' && <span className="indicador-ativo"></span>}
          <div className="icone-calendario-wrapper">
            <Calendar size={24} />

          </div>
        </button>
        <button onClick={handleLogout} className={`nav-item ${abaAtiva === 'sair' ? 'ativo' : ''}`}>
          {abaAtiva === 'sair' && <span className="indicador-ativo"></span>}
          <LogOut size={24} />
        </button>
      </nav>

    </div>
  );
}