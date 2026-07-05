import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, LogOut, ArrowLeft, Download } from 'lucide-react';
import './secretaria.css';

const API_URL = 'http://localhost:3001';
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

  // Modais de Ação
  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [textoMotivo, setTextoMotivo] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

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
  useEffect(() => {
    if (!escolaSelecionada) return;
    async function puxarDashboardReal() {
      try {
        setCarregandoDashboard(true);
        const res = await fetch(`${API_URL}/escolas/${escolaSelecionada?.id}/dashboard`);
        if (res.ok) {
          const dados = await res.json();
          setDashboardEscola(dados);
        }
      } catch (err) {
        console.error("Erro ao puxar dashboard real da escola:", err);
      } finally {
        setCarregandoDashboard(false);
      }
    }
    puxarDashboardReal();
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
      }
    } catch (err) { console.error(err); } finally { setAtualizandoStatus(false); }
  };

  const handleConfirmarReprovacao = async () => {
    if (!cardapioSelecionado || !textoMotivo.trim()) return;
    try {
      setAtualizandoStatus(true);
      await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reprovado', motivoReprovacao: textoMotivo })
      });
      const atualizado = { ...cardapioSelecionado, status: 'Reprovado', motivoReprovacao: textoMotivo };
      setCardapioSelecionado(atualizado);
      setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
      setModalReprovarAberto(false);
      setTextoMotivo('');
    } catch (err) { console.error(err); } finally { setAtualizandoStatus(false); }
  };

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

        <div className="cabecalho-acoes">
          <button onClick={() => { setAbaAtiva('escolas'); }} className={`btn-topo-nav ${abaAtiva === 'escolas' ? 'ativo' : ''}`}>
            <GraduationCap size={26} />
            {abaAtiva === 'escolas' && <span className="traco-ativo"></span>}
          </button>
          <button onClick={() => { setAbaAtiva('calendario'); }} className={`btn-topo-nav ${abaAtiva === 'calendario' ? 'ativo' : ''}`}>
            <div className="wrapper-cal">
              <Calendar size={24} />
              <span className="ponto-rosa"></span>
            </div>
            {abaAtiva === 'calendario' && <span className="traco-ativo"></span>}
          </button>
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
                    
                    {/* SUB-COLUNA 1: Estatísticas do Banco de Dados */}
                    <div className="sub-coluna-escola">
                      <div className="data-seletor-bar"><span>RESUMO GERAL DO BANCO</span><Calendar size={18} /></div>

                      <div className="stats-diario-grid">
                        <div className="stat-box"><span className="stat-label">Alunos Contados</span><span className="stat-num font-extrabold text-blue-900">{dashboardEscola.totais.alunosContados}</span></div>
                        <div className="stat-box"><span className="stat-label">Pratos Servidos</span><span className="stat-num font-extrabold text-blue-900">{dashboardEscola.totais.pratosServidos}</span></div>
                        <div className="stat-box"><span className="stat-label">Desperdício (Kg)</span><span className="stat-num font-extrabold text-red-600">{dashboardEscola.totais.desperdicioKg}kg</span></div>
                      </div>

                      <div className="secao-grafico">
                        <h3 className="subtitulo-secao">GRÁFICO DE DESPERDÍCIO GRAVADO</h3>
                        <div className="grafico-barras">
                          {dashboardEscola.graficoDesperdicio.map((item, idx) => (
                            <div key={idx} className="linha-grafico"><span className="label-dia">{item.dia}</span><div className="barra-fundo"><div className="barra-preenchida" style={{ width: `${Math.max(10, item.valor)}%` }}><span className="barra-texto">{item.label}</span></div></div></div>
                          ))}
                        </div>
                      </div>

                      <div className="secao-grafico">
                        <h3 className="subtitulo-secao">GRÁFICO DE ALUNOS CONTADOS</h3>
                        <div className="grafico-barras">
                          {dashboardEscola.graficoAlunos.map((item, idx) => {
                            const porc = item.max > 0 ? (item.valor / item.max) * 100 : 0;
                            return (
                              <div key={idx} className="linha-grafico"><span className="label-dia">{item.dia}</span><div className="barra-fundo"><div className="barra-preenchida" style={{ width: `${Math.max(10, porc)}%` }}><span className="barra-texto">{item.valor}</span></div></div></div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SUB-COLUNA 2: ESTOQUE REAL PUXADO DA TABELA DO MYSQL */}
                    <div className="sub-coluna-escola so-no-desktop">
                      <h3 className="subtitulo-secao">ESTOQUE DO BANCO DE DADOS</h3>
                      <div className="estoque-lista-desktop">
                        {dashboardEscola.itensEstoque.length > 0 ? (
                          dashboardEscola.itensEstoque.map((item: any) => {
                            const emAlerta = item.quantidade <= 10;
                            return (
                              <div key={item.id} className="pill-estoque-simples">
                                <span>{item.produto?.nome || 'Item cadastrado'} {item.lote ? `(Lote: ${item.lote})` : ''}</span>
                                <span className={`pill-qtd ${emAlerta ? 'pill-vermelho' : 'pill-verde'}`}>
                                  {item.quantidade} {item.unidade ? item.unidade.toUpperCase() : 'KG'}
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          <p style={{ color: '#64748b', fontSize: '0.8rem', padding: '12px' }}>
                            Nenhum item em estoque cadastrado no MySQL para esta escola ainda.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* SUB-COLUNA 3: AVISO AUTOMÁTICO DE REPOSIÇÃO */}
                    <div className="sub-coluna-escola so-no-desktop">
                      <h3 className="subtitulo-secao">PEDIDOS DE REPOSIÇÃO AUTOMÁTICOS</h3>
                      <div className="caixa-pedido-estoque">
                        <p style={{ fontWeight: 700, marginBottom: '12px' }}>Itens com baixo estoque no banco:</p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {dashboardEscola.itensEstoque.filter((i: any) => i.quantidade <= 15).length > 0 ? (
                            dashboardEscola.itensEstoque
                              .filter((i: any) => i.quantidade <= 15)
                              .map((itemBaixo: any) => (
                                <li key={itemBaixo.id} style={{ color: '#ef4444', fontWeight: 600 }}>
                                  • {itemBaixo.produto?.nome} – Estoque crítico ({itemBaixo.quantidade} {itemBaixo.unidade})
                                </li>
                              ))
                          ) : (
                            <li style={{ color: '#22c55e', fontWeight: 600 }}>• Todos os itens estão com níveis seguros no banco.</li>
                          )}
                        </ul>
                        <p style={{ marginTop: '20px', lineHeight: '1.4', color: '#475569' }}>
                          Essa lista é gerada automaticamente pelo sistema verificando a quantidade gravada no MySQL.
                        </p>
                      </div>
                    </div>

                    {/* TABELA ESTOQUE MOBILE TRADICIONAL REAL */}
                    <div className="secao-grafico mb-6 so-no-mobile">
                      <h3 className="subtitulo-secao">ESTOQUE DO BANCO</h3>
                      <div className="tabela-estoque-box">
                        {dashboardEscola.itensEstoque.length > 0 ? (
                          dashboardEscola.itensEstoque.map((est: any, idx: number) => (
                            <div key={idx} className="linha-estoque">
                              <span className="estoque-item font-bold">{est.produto?.nome || 'Item'}</span>
                              <span>{est.quantidade} {est.unidade}</span>
                              <span>Lote: {est.lote || 'N/A'}</span>
                              <span>{est.validade ? new Date(est.validade).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</span>
                              <div className="coluna-status-alerta"><div className={`status-quadrado ${est.quantidade <= 10 ? 'status-vermelho' : 'status-verde'}`}></div></div>
                            </div>
                          ))
                        ) : (
                          <p style={{ padding: '12px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                            Nenhum estoque registrado no banco.
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
            <span className="ponto-rosa"></span>
          </div>
        </button>
        <button onClick={() => { setAbaAtiva('sair'); setEscolaSelecionada(null); setCardapioSelecionado(null); }} className={`nav-item ${abaAtiva === 'sair' ? 'ativo' : ''}`}>
          {abaAtiva === 'sair' && <span className="indicador-ativo"></span>}
          <LogOut size={24} />
        </button>
      </nav>

    </div>
  );
}