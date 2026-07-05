import { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, LogOut, ArrowLeft, Download } from 'lucide-react';
import './secretaria.css';

const API_URL = 'http://localhost:3001';
const CORES = ['cor-azul-escuro', 'cor-azul-medio', 'cor-roxo', 'cor-rosa'];

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


const DADOS_GRAFICO_DESPERDICIO = [
  { dia: 'Seg.', valor: 100, label: '100%' },
  { dia: 'Ter.', valor: 50, label: '50%' },
  { dia: 'Qua.', valor: 26, label: '26%' },
  { dia: 'Qui.', valor: 42, label: '42%' },
  { dia: 'Sex.', valor: 67, label: '67%' },
];

const DADOS_GRAFICO_ALUNOS = [
  { dia: 'Seg.', valor: 482, max: 500, label: '482' },
  { dia: 'Ter.', valor: 243, max: 500, label: '243' },
  { dia: 'Qua.', valor: 182, max: 500, label: '182' },
  { dia: 'Qui.', valor: 203, max: 500, label: '203' },
  { dia: 'Sex.', valor: 359, max: 500, label: '359' },
];

const DADOS_ESTOQUE = [
  { item: 'Arroz', total: '145 kg', diario: '12 kg', dias: '12 dias', min: '50 kg', status: 'verde' },
  { item: 'Feijão', total: '52 kg', diario: '5 kg', dias: '11 dias', min: '50 kg', status: 'verde' },
  { item: 'Leite', total: '18 cx.', diario: '4 cx.', dias: '4 dias', min: '15 cx.', status: 'amarelo' },
  { item: 'Macarrão', total: '58 kg', diario: '6 kg', dias: '9 dias', min: '30 kg', status: 'verde' },
  { item: 'Banana', total: '24 kg', diario: '8 kg', dias: '3 dias', min: '20 kg', status: 'amarelo' },
  { item: 'Óleo', total: '3 L', diario: '2 L', dias: '1 dia', min: '10 L', status: 'vermelho' },
];

export default function SelecaoEscola() {
  const [abaAtiva, setAbaAtiva] = useState<'escolas' | 'calendario' | 'sair'>('escolas');
  const [usuario, setUsuario] = useState<any>(null);

  
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(true);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [busca, setBusca] = useState('');


  const [cardapios, setCardapios] = useState<Cardapio[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [carregandoCardapios, setCarregandoCardapios] = useState(false);
  
  
  const [cardapioSelecionado, setCardapioSelecionado] = useState<Cardapio | null>(null);
  const [subAbaDetalhe, setSubAbaDetalhe] = useState<'cardapio' | 'nutricional'>('cardapio');


  const [modalReprovarAberto, setModalReprovarAberto] = useState(false);
  const [textoMotivo, setTextoMotivo] = useState('');
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  
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



  useEffect(() => {
    async function loadUser() {
        const token = localStorage.getItem("token");

        if (!token) return;

        const resposta = await fetch("http://localhost:3001/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (resposta.ok) {
            const data = await resposta.json();
            setUsuario(data);
        }
    }

    loadUser();
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

  // Reprovar Cardápio
  const handleConfirmarReprovacao = async () => {
    if (!cardapioSelecionado || !textoMotivo.trim()) return;
    try {
      setAtualizandoStatus(true);
      const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
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
    <div className="app-container">
      <header className="cabecalho">
        <div className="cabecalho-texto">
          <h1>SECRETARIA</h1>
          <p>{usuario ? `${usuario.nome}` : "Carregando..."}</p>
        </div>
      </header>

      
      {escolaSelecionada ? (
        
       
        <main className="detalhe-escola-area">
          <div className="detalhe-topo">
            <button onClick={() => setEscolaSelecionada(null)} className="btn-voltar-simples">
              <ArrowLeft size={20} />
            </button>
            <h2 className="detalhe-titulo">
              {escolaSelecionada.nome || escolaSelecionada.name || 'CIEFI PROF.ª ADOLFINA LEONO...'}
            </h2>
          </div>

          <div className="badge-sace">
            INDICE SACE - {escolaSelecionada.indiceSace || '93'}/100
          </div>

        
          <div className="escola-info-grid">
            <div className="escola-info-item">
              <span className="escola-info-label">Bairro</span>
              <span className="escola-info-valor">{escolaSelecionada.bairro || 'SUMARÉ'}</span>
            </div>
            <div className="escola-info-item">
              <span className="escola-info-label">Endereço</span>
              <span className="escola-info-valor">{escolaSelecionada.endereco || 'AV. SIQUEIRA CAMPOS, 1257'}</span>
            </div>
            <div className="escola-info-item col-span-2">
              <span className="escola-info-label">Email</span>
              <span className="escola-info-valor font-bold text-blue-800">{escolaSelecionada.email || 'EMEFADOLFINACARAGUATATUBA@GMAIL.COM'}</span>
            </div>
            <div className="escola-info-item col-span-2">
              <span className="escola-info-label">Telefone</span>
              <span className="escola-info-valor">{escolaSelecionada.telefone || '3881-2521 / 3882-5195'}</span>
            </div>
            <div className="escola-info-item">
              <span className="escola-info-label">Diretor(a)</span>
              <span className="escola-info-valor">{escolaSelecionada.diretor || 'JESSICA'}</span>
            </div>
            <div className="escola-info-item">
              <span className="escola-info-label">Supervisor(a)</span>
              <span className="escola-info-valor">{escolaSelecionada.supervisor || 'DIEGO ROBERTO DOS SANTOS'}</span>
            </div>
          </div>

     
          <div className="data-seletor-bar">
            <span>QUARTA-FEIRA 05/07/2026</span>
            <Calendar size={18} />
          </div>

          
          <div className="stats-diario-grid">
            <div className="stat-box">
              <span className="stat-label">Alunos Contados</span>
              <span className="stat-num font-extrabold text-blue-900">439</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Pratos Servidos</span>
              <span className="stat-num font-extrabold text-blue-900">419</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Desperdício</span>
              <span className="stat-num font-extrabold text-red-600">20</span>
            </div>
          </div>

          {/* Gráfico 1: Desperdício */}
          <div className="secao-grafico">
            <h3 className="subtitulo-secao">GRÁFICO DE DESPERDÍCIO</h3>
            <div className="grafico-barras">
              {DADOS_GRAFICO_DESPERDICIO.map((item, idx) => (
                <div key={idx} className="linha-grafico">
                  <span className="label-dia">{item.dia}</span>
                  <div className="barra-fundo">
                    <div className="barra-preenchida" style={{ width: `${item.valor}%` }}>
                      <span className="barra-texto">{item.label}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

         
          <div className="secao-grafico">
            <h3 className="subtitulo-secao">GRÁFICO DE ALUNOS CONTADOS</h3>
            <div className="grafico-barras">
              {DADOS_GRAFICO_ALUNOS.map((item, idx) => {
                const porc = (item.valor / item.max) * 100;
                return (
                  <div key={idx} className="linha-grafico">
                    <span className="label-dia">{item.dia}</span>
                    <div className="barra-fundo">
                      <div className="barra-preenchida" style={{ width: `${porc}%` }}>
                        <span className="barra-texto">{item.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        
          <div className="secao-grafico mb-6">
            <h3 className="subtitulo-secao">ESTOQUE</h3>
            <div className="tabela-estoque-box">
              {DADOS_ESTOQUE.map((est, idx) => (
                <div key={idx} className="linha-estoque">
                  <span className="estoque-item font-bold">{est.item}</span>
                  <span>{est.total}</span>
                  <span>{est.diario}</span>
                  <span>{est.dias}</span>
                  <span>{est.min}</span>
                  <div className="coluna-status-alerta">
                    <div className={`status-quadrado status-${est.status}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

      ) : abaAtiva === 'calendario' ? (
        
        
        cardapioSelecionado ? (
          <main className="detalhe-cardapio-area">
            <div className="detalhe-topo">
              <button onClick={() => setCardapioSelecionado(null)} className="btn-voltar-simples"><ArrowLeft size={20} /></button>
              <h2 className="detalhe-titulo">{cardapioSelecionado.titulo || `CARDÁPIO - MÊS ${cardapioSelecionado.mes}/${cardapioSelecionado.ano}`}</h2>
            </div>
            <button className="btn-download-pdf"><Download size={16} /> DOWNLOAD PDF</button>

            <div className="area-status-acao">
              {cardapioSelecionado.status === 'Aprovado' ? (
                <div className="badge-status-aprovado">APROVADO</div>
              ) : cardapioSelecionado.status === 'Reprovado' ? (
                <>
                  <div className="badge-status-reprovado">REPROVADO</div>
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
              <div className="lista-dias">
                {cardapioSelecionado.dias && cardapioSelecionado.dias.map((itemDia: any) => (
                  <div key={itemDia.id} className="tabela-dia">
                    <div className="dia-topo"><span>{itemDia.dia}</span></div>
                    <div className="tabela-corpo">
                      {itemDia.refeicoes ? itemDia.refeicoes.map((ref: any) => (
                        <div key={ref.id} className="linha-refeicao"><div className="coluna-tipo">{ref.tipo}</div><div className="coluna-desc">{ref.descricao}</div></div>
                      )) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="lista-dias">
                {referencias.map((ref) => (
                  <div key={ref.id} className="tabela-planilha mb-4">
                    <div className="planilha-cabecalho"><span>ALVO</span><span>KCAL</span><span>CHO</span><span>PTN</span><span>LIP</span></div>
                    <div className="planilha-linha"><span>Máximo</span><span>{ref.kcalAlvo}</span><span>{ref.choMax}</span><span>{ref.ptnMax}</span><span>{ref.lipMax}</span></div>
                  </div>
                ))}
              </div>
            )}
          </main>
        ) : (
          <main className="lista-cardapios">
            {carregandoCardapios ? <p className="msg-vazio">Buscando cardápios...</p> : cardapios.map((item: any) => (
              <div key={item.id} onClick={() => { setCardapioSelecionado(item); setSubAbaDetalhe('cardapio'); }} className={`card-item ${getClasseStatus(item.status)}`}>
                <h3 className="card-titulo">{item.titulo || `Cardápio Mês ${item.mes}/${item.ano}`}</h3>
                <div className="card-rodape"><span>{item.dataEnvio || 'Registrado'}</span><span style={{ fontWeight: 600 }}>{item.status || 'Esperando'}</span></div>
              </div>
            ))}
          </main>
        )

      ) : abaAtiva === 'sair' ? (
        <main className="tela-centralizada"><h2>Desconectado do sistema</h2></main>
      ) : (
        
        /* TELA LISTA DAS ESCOLAS */
        <>
          <div className="barra-busca-container">
            <div className="input-busca-wrapper">
              <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)} className="input-busca" placeholder="Buscar escola..." />
              <Search className="icone-busca" size={18} />
            </div>
          </div>
          <main className="lista-escolas">
            {carregandoEscolas ? <p className="msg-vazio">Carregando escolas...</p> : escolasFiltradas.map((escola, index) => (
              <button key={escola.id} onClick={() => setEscolaSelecionada(escola)} className={`btn-escola ${CORES[index % CORES.length]}`}>
                {escola.nome || escola.name || `Escola #${escola.id}`}
              </button>
            ))}
          </main>
        </>
      )}

      {/* MODAL JUSTIFICATIVA */}
      {modalReprovarAberto && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-titulo">MOTIVO</h3>
            <textarea value={textoMotivo} onChange={(e) => setTextoMotivo(e.target.value)} placeholder="Escreva o motivo..." className="modal-textarea" />
            <div className="modal-botoes">
              <button onClick={() => setModalReprovarAberto(false)} className="btn-modal-cancelar">CANCELAR</button>
              <button onClick={handleConfirmarReprovacao} className="btn-modal-reprovar">REPROVAR</button>
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