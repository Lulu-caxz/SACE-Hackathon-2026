import React, { useState, useEffect } from 'react';
import { Search, Filter, GraduationCap, Calendar, LogOut, ArrowLeft, Download } from 'lucide-react';
import './selecao-escola.css';

const API_URL = 'http://localhost:3001';
const CORES = ['cor-azul-escuro', 'cor-azul-medio', 'cor-roxo', 'cor-rosa'];

interface Escola { id: number | string; nome?: string; name?: string; }
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

  // Estados Escolas
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(true);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [busca, setBusca] = useState('');

  // Estados Cardápios e Referências (100% Banco de Dados)
  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [carregandoCardapios, setCarregandoCardapios] = useState(false);
  
  // Detalhe do Cardápio Clicado
  const [cardapioSelecionado, setCardapioSelecionado] = useState<Cardapio | null>(null);
  const [subAbaDetalhe, setSubAbaDetalhe] = useState<'cardapio' | 'nutricional'>('cardapio');

  // ESTADOS DO MODAL DE REPROVAÇÃO
  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [textoMotivo, setTextoMotivo] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  // Busca Escolas
  useEffect(() => {
    async function carregarEscolas() {
      try {
        setCarregandoEscolas(true);
        const res = await fetch(`${API_URL}/escolas`);
        if (res.ok) setEscolas(await res.json());
      } catch (err) { console.error(err); } finally { setCarregandoEscolas(false); }
    }
    carregarEscolas();
  }, []);

  // Busca Cardápios e Referências Nutricionais do Banco
  useEffect(() => {
    if (abaAtiva === 'calendario') {
      async function carregarDados() {
        try {
          setCarregandoCardapios(true);
          const [resCard, resRef] = await Promise.all([
            fetch(`${API_URL}/cardapios`),
            fetch(`${API_URL}/referencias`)
          ]);
          if (resCard.ok) setCardapios(await resCard.json());
          if (resRef.ok) setReferencias(await resRef.json());
        } catch (err) { console.error(err); } finally { setCarregandoCardapios(false); }
      }
      carregarDados();
    }
  }, [abaAtiva]);

  // Ação: APROVAR CARDÁPIO
  const handleAprovar = async () => {
    if (!cardapioSelecionado) return;
    try {
      setAtualizandoStatus(true);
      const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: cardapioSelecionado.mes || 7,
          ano: cardapioSelecionado.ano || 2026,
          semana: cardapioSelecionado.semana || new Date().toISOString(),
          status: 'Aprovado'
        })
      });

      if (res.ok || res.status === 200) {
        const atualizado = { ...cardapioSelecionado, status: 'Aprovado' };
        setCardapioSelecionado(atualizado);
        setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
      }
    } catch (err) {
      console.error('Erro ao aprovar:', err);
      const atualizado = { ...cardapioSelecionado, status: 'Aprovado' };
      setCardapioSelecionado(atualizado);
      setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // Ação: CONFIRMAR REPROVAÇÃO NO MODAL
  const handleConfirmarReprovacao = async () => {
    if (!cardapioSelecionado) return;
    if (!textoMotivo.trim()) {
      alert('Por favor, escreva o motivo da reprovação.');
      return;
    }

    try {
      setAtualizandoStatus(true);
      const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: cardapioSelecionado.mes || 7,
          ano: cardapioSelecionado.ano || 2026,
          semana: cardapioSelecionado.semana || new Date().toISOString(),
          status: 'Reprovado',
          motivoReprovacao: textoMotivo
        })
      });

      const atualizado = { 
        ...cardapioSelecionado, 
        status: 'Reprovado', 
        motivoReprovacao: textoMotivo 
      };
      setCardapioSelecionado(atualizado);
      setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
      setModalReprovarAberto(false);
      setTextoMotivo('');
    } catch (err) {
      console.error('Erro ao reprovar:', err);
      const atualizado = { ...cardapioSelecionado, status: 'Reprovado', motivoReprovacao: textoMotivo };
      setCardapioSelecionado(atualizado);
      setCardapios(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
      setModalReprovarAberto(false);
    } finally {
      setAtualizandoStatus(false);
    }
  };

  // Formata o nome do Enum para exibição limpa (ex: INFANTIL_4_A_5 -> INFANTIL 4 A 5 ANOS)
  const formatarFaixaEtaria = (faixa: string) => {
    return faixa.replace(/_/g, ' ').replace('CRECHE', 'CRECHE ').replace('INFANTIL', 'INFANTIL ').replace('FUNDAMENTAL', 'FUNDAMENTAL ');
  };

  const escolasFiltradas = escolas.filter((escola) => (escola.nome || escola.name || '').toLowerCase().includes(busca.toLowerCase()));
  const getClasseStatus = (status: string = '') => {
    switch (status) {
      case 'Esperando': return 'card-esperando';
      case 'Reprovado': return 'card-reprovado';
      case 'Aprovado': default: return 'card-aprovado';
    }
  };

  if (escolaSelecionada) {
    return (
      <div className="container-sucesso">
        <div className="card-sucesso">
          <div className="icone-sucesso"><GraduationCap size={32} /></div>
          <h2>Acesso Confirmado</h2>
          <p>Você entrou em:<br /><strong>{escolaSelecionada.nome || escolaSelecionada.name}</strong></p>
          <button onClick={() => setEscolaSelecionada(null)} className="btn-voltar"><ArrowLeft size={18} /> Voltar para Seleção</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="cabecalho">
        <div className="cabecalho-texto">
          <h1>SECRETARIA</h1>
          <p>Nome do responsável</p>
        </div>
      </header>

      {abaAtiva === 'calendario' ? (
        cardapioSelecionado ? (
          <main className="detalhe-cardapio-area">
            {/* Topo: Voltar + Título */}
            <div className="detalhe-topo">
              <button onClick={() => setCardapioSelecionado(null)} className="btn-voltar-simples"><ArrowLeft size={20} /></button>
              <h2 className="detalhe-titulo">{cardapioSelecionado.titulo || `CARDÁPIO - MÊS ${cardapioSelecionado.mes}/${cardapioSelecionado.ano}`}</h2>
            </div>

            <button className="btn-download-pdf"><Download size={16} /> DOWNLOAD PDF</button>

            {/* --- ÁREA DOS BOTÕES DE APROVAÇÃO --- */}
            <div className="area-status-acao">
              {cardapioSelecionado.status === 'Aprovado' ? (
                <div className="badge-status-aprovado">APROVADO</div>
              ) : cardapioSelecionado.status === 'Reprovado' ? (
                <>
                  <div className="badge-status-reprovado">REPROVADO</div>
                  <p className="texto-motivo-exibicao">
                    {cardapioSelecionado.motivoReprovacao || "Durante a análise, foram identificadas inadequações na distribuição dos nutrientes e na composição de algumas refeições."}
                  </p>
                </>
              ) : (
                <div className="botoes-aprovar-reprovar">
                  <button onClick={handleAprovar} disabled={atualizandoStatus} className="btn-acao-verde">
                    {atualizandoStatus ? 'SALVANDO...' : 'APROVAR'}
                  </button>
                  <button onClick={() => setModalReprovarAberto(true)} disabled={atualizandoStatus} className="btn-acao-vermelho">
                    REPROVAR
                  </button>
                </div>
              )}
            </div>

            
            <div className="toggle-container">
              <button onClick={() => setSubAbaDetalhe('cardapio')} className={`btn-toggle ${subAbaDetalhe === 'cardapio' ? 'ativo' : 'inativo'}`}>CARDÁPIO</button>
              <button onClick={() => setSubAbaDetalhe('nutricional')} className={`btn-toggle ${subAbaDetalhe === 'nutricional' ? 'ativo' : 'inativo'}`}>VALOR NUTRI.</button>
            </div>

            {subAbaDetalhe === 'cardapio' ? (
              <>
                <div className="subtitulo-faixa">
                  <h3>DETALHAMENTO SEMANAL</h3>
                  <p>REFEIÇÕES POR DIA DA SEMANA</p>
                </div>
                <div className="lista-dias">
                  {cardapioSelecionado.dias && cardapioSelecionado.dias.length > 0 ? (
                    cardapioSelecionado.dias.map((itemDia: any) => (
                      <div key={itemDia.id} className="tabela-dia">
                        <div className="dia-topo"><span>{itemDia.dia}</span></div>
                        <div className="tabela-corpo">
                          {itemDia.refeicoes && itemDia.refeicoes.length > 0 ? (
                            itemDia.refeicoes.map((ref: any) => (
                              <div key={ref.id} className="linha-refeicao">
                                <div className="coluna-tipo">{ref.tipo}</div>
                                <div className="coluna-desc">
                                  {ref.descricao ? ref.descricao.split('\n\n').map((p: string, idx: number) => (
                                    <p key={idx} style={idx > 0 ? { marginTop: '8px', fontWeight: 600 } : {}}>{p}</p>
                                  )) : <p>Sem descrição.</p>}
                                </div>
                              </div>
                            ))
                          ) : <div className="linha-refeicao"><div className="coluna-desc" style={{ width: '100%', textAlign: 'center' }}>Sem refeições cadastradas.</div></div>}
                        </div>
                      </div>
                    ))
                  ) : <p className="msg-vazio">Nenhum dia cadastrado nesta semana.</p>}
                </div>
              </>
            ) : (
              /* --- ABA VALOR NUTRI 100% DINÂMICA DO BANCO --- */
              <div className="lista-dias">
                {referencias && referencias.length > 0 ? (
                  referencias.map((ref) => (
                    <div key={ref.id} style={{ marginBottom: '16px' }}>
                      <div className="subtitulo-faixa">
                        <h3>VALOR NUTRI. {formatarFaixaEtaria(ref.faixaEtaria)}</h3>
                        <p>{ref.dieta || 'DIETA GERAL'}</p>
                      </div>

                      {/* Tabela no formato de planilha exibindo as metas/valores do MySQL */}
                      <div className="tabela-planilha">
                        <div className="planilha-cabecalho">
                          <span>ALVO</span>
                          <span>KCAL</span>
                          <span>CHO (g)</span>
                          <span>PTN (g)</span>
                          <span>LIP (g)</span>
                          <span>NA (mg)</span>
                        </div>
                        <div className="planilha-linha" style={{ fontWeight: 600, backgroundColor: '#f0f9ff' }}>
                          <span className="planilha-dia">Mínimo</span>
                          <span>{ref.kcalAlvo}</span>
                          <span>{ref.choMin}</span>
                          <span>{ref.ptnMin}</span>
                          <span>{ref.lipMin}</span>
                          <span>0</span>
                        </div>
                        <div className="planilha-linha" style={{ fontWeight: 600 }}>
                          <span className="planilha-dia">Máximo</span>
                          <span>{ref.kcalAlvo}</span>
                          <span>{ref.choMax}</span>
                          <span>{ref.ptnMax}</span>
                          <span>{ref.lipMax}</span>
                          <span>{ref.sodioMaxMg}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="msg-vazio">Nenhuma referência encontrada no banco de dados. Cadastre via Postman em /referencias/criar.</p>
                )}
              </div>
            )}
          </main>
        ) : (
          <main className="lista-cardapios">
            {carregandoCardapios ? <p className="msg-vazio">Buscando cardápios...</p> : cardapios.length > 0 ? (
              cardapios.map((item: any) => (
                <div key={item.id} onClick={() => { setCardapioSelecionado(item); setSubAbaDetalhe('cardapio'); }} className={`card-item ${getClasseStatus(item.status || 'Esperando')}`}>
                  <h3 className="card-titulo">{item.titulo || `Cardápio Mês ${item.mes}/${item.ano}`}</h3>
                  <div className="card-rodape"><span>{item.dataEnvio || 'Registrado'}</span><span style={{ fontWeight: 600 }}>{item.status || 'Esperando'}</span></div>
                </div>
              ))
            ) : <p className="msg-vazio">Nenhum cardápio cadastrado no banco.</p>}
          </main>
        )
      ) : abaAtiva === 'sair' ? (
        <main className="tela-centralizada"><h2>Desconectado do sistema</h2></main>
      ) : (
        <>
          <div className="barra-busca-container">
            <div className="input-busca-wrapper">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} className="input-busca" placeholder="Buscar escola..." />
              <Search className="icone-busca" size={18} />
            </div>
            <button className="btn-filtro"><Filter size={18} /></button>
          </div>
          <main className="lista-escolas">
            {carregandoEscolas ? <p className="msg-vazio">Carregando escolas...</p> : escolasFiltradas.length > 0 ? (
              escolasFiltradas.map((escola, index) => (
                <button key={escola.id} onClick={() => setEscolaSelecionada(escola)} className={`btn-escola ${CORES[index % CORES.length]}`}>{escola.nome || escola.name || `Escola #${escola.id}`}</button>
              ))
            ) : <p className="msg-vazio">Nenhuma escola cadastrada.</p>}
          </main>
        </>
      )}

      {/* MODAL DE JUSTIFICATIVA */}
      {modalReprovarAberto && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-titulo">MOTIVO</h3>
            <textarea
              value={textoMotivo}
              onChange={(e) => setTextoMotivo(e.target.value)}
              placeholder="Escreva o motivo aqui..."
              className="modal-textarea"
            />
            <div className="modal-botoes">
              <button onClick={() => { setModalReprovarAberto(false); setTextoMotivo(''); }} className="btn-modal-cancelar">
                CANCELAR
              </button>
              <button onClick={handleConfirmarReprovacao} disabled={atualizandoStatus} className="btn-modal-reprovar">
                {atualizandoStatus ? 'SALVANDO...' : 'REPROVAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="nav-inferior">
        <button onClick={() => { setAbaAtiva('escolas'); setEscolaSelecionada(null); setCardapioSelecionado(null); }} className={`nav-item ${abaAtiva === 'escolas' ? 'ativo' : ''}`}>{abaAtiva === 'escolas' && <span className="indicador-ativo"></span>}<GraduationCap size={26} /></button>
        <button onClick={() => { setAbaAtiva('calendario'); setEscolaSelecionada(null); }} className={`nav-item ${abaAtiva === 'calendario' ? 'ativo' : ''}`}>{abaAtiva === 'calendario' && <span className="indicador-ativo"></span>}<div className="icone-calendario-wrapper"><Calendar size={24} /><span className="ponto-rosa"></span></div></button>
        <button onClick={() => { setAbaAtiva('sair'); setEscolaSelecionada(null); setCardapioSelecionado(null); }} className={`nav-item ${abaAtiva === 'sair' ? 'ativo' : ''}`}>{abaAtiva === 'sair' && <span className="indicador-ativo"></span>}<LogOut size={24} /></button>
      </nav>
    </div>
  );
}