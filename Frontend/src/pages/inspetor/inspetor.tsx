import React, { useState, useEffect } from 'react';
import { GraduationCap, LogOut, ArrowLeft, Plus } from 'lucide-react';
import './inspetor.css';

const API_URL = 'http://localhost:3001';

interface ContagemHistorica {
  id: string | number;
  data: string;
  alunosPresentes: number;
  pratosServidos: number;
  sobraKg?: number;
  observacoes?: string;
}

interface Sala {
  id: number;
  nome: string;
  qtdAlunos: number;
  qtdRestricao: number;
  descRestricao: string;
}

export default function InspetoraHome() {
  const [telaAtual, setTelaAtual] = useState<'lista' | 'salas'>('lista');
  const [abaNav, setAbaNav] = useState<'escola' | 'sair'>('escola');

  // Estados com dados reais da API
  const [usuario, setUsuario] = useState<any>(null);
  const [contagens, setContagens] = useState<ContagemHistorica[]>([]);
  const [cardapioReal, setCardapioReal] = useState<any>(null);
  const [salvandoBanco, setSalvandoBanco] = useState(false);

  const dataContagemAtual = new Date().toLocaleDateString('pt-BR');

  
  const [salas, setSalas] = useState<Sala[]>([
    { id: 1, nome: 'SALA 1', qtdAlunos: 30, qtdRestricao: 0, descRestricao: '' },
    { id: 2, nome: 'SALA 2', qtdAlunos: 45, qtdRestricao: 0, descRestricao: '' },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [salaEmEdicao, setSalaEmEdicao] = useState<Sala | null>(null);

  
  const totalAlunosComendo = salas.reduce((acc, sala) => acc + (Number(sala.qtdAlunos) || 0), 0);
  const totalRestricoes = salas.reduce((acc, sala) => acc + (Number(sala.qtdRestricao) || 0), 0);
  const listaRestricoes = salas.filter(s => s.qtdRestricao > 0 && s.descRestricao.trim() !== '');

  
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUsuario(await res.json());
        }
      } catch (err) {
        console.error("Erro ao carregar usuário logado:", err);
      }
    }
    loadUser();
  }, []);

  
  useEffect(() => {
    async function carregarDadosBanco() {
      try {
        
        const resDiarios = await fetch(`${API_URL}/diarios`);
        if (resDiarios.ok) {
          const dados = await resDiarios.json();
          setContagens(dados);
        }

   
        const resCardapios = await fetch(`${API_URL}/cardapios`);
        if (resCardapios.ok) {
          const listaCardapios = await resCardapios.json();
          if (listaCardapios.length > 0) {
            setCardapioReal(listaCardapios[0]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados do back-end:", err);
      }
    }
    carregarDadosBanco();
  }, [telaAtual]);

  const handleNovaSala = () => {
    const novoNum = salas.length + 1;
    setSalaEmEdicao({
      id: Date.now(),
      nome: `SALA ${novoNum}`,
      qtdAlunos: 0,
      qtdRestricao: 0,
      descRestricao: ''
    });
    setModalAberto(true);
  };

  const handleEditarSala = (sala: Sala) => {
    setSalaEmEdicao({ ...sala });
    setModalAberto(true);
  };

  
  const handleSalvarSala = async () => {
    if (!salaEmEdicao) return;

    
    setSalas(prev => {
      const existe = prev.some(s => s.id === salaEmEdicao.id);
      if (existe) {
        return prev.map(s => s.id === salaEmEdicao.id ? salaEmEdicao : s);
      }
      return [...prev, salaEmEdicao];
    });

    setModalAberto(false);

    try {
      setSalvandoBanco(true);
      const diaId = cardapioReal?.dias?.[0]?.id;

     
      await fetch(`${API_URL}/diarios/criar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardapioDiaId: diaId || null,
          inspetoraId: usuario?.id || null,
          data: new Date().toISOString(),
          alunosPresentes: Number(salaEmEdicao.qtdAlunos),
          pratosServidos: Number(salaEmEdicao.qtdAlunos),
          comidaFeitaKg: 0,
          sobraKg: 0,
          observacoes: salaEmEdicao.qtdRestricao > 0 
            ? `[${salaEmEdicao.nome}] Restrições (${salaEmEdicao.qtdRestricao}): ${salaEmEdicao.descRestricao}`
            : `[${salaEmEdicao.nome}] Contagem padrão (Sem restrições)`
        })
      });
    } catch (err) {
      console.error("Erro ao salvar contagem no banco de dados:", err);
    } finally {
      setSalvandoBanco(false);
      setSalaEmEdicao(null);
    }
  };

  return (
    <div className="inspetora-container">
     
      <header className="cabecalho-inspetora">
        <h1>INSPETOR(A)</h1>
        <p>{usuario ? usuario.nome : "Carregando perfil..."}</p>
      </header>

      {telaAtual === 'lista' ? (
        
        
        <main className="area-conteudo">
          <div className="lista-contagens">
            {contagens.length > 0 ? (
              contagens.map((item: any) => (
                <div key={item.id} className="card-contagem">
                  <h3 className="contagem-titulo">
                    Contagem - {new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </h3>
                  <div className="contagem-dados">
                    <div>
                      <span className="contagem-label">Als. Cont.</span>
                      <span className="contagem-val">{item.alunosPresentes || 0}</span>
                    </div>
                    <div>
                      <span className="contagem-label">Pts Serv.</span>
                      <span className="contagem-val">{item.pratosServidos || 0}</span>
                    </div>
                    <div>
                      <span className="contagem-label">Sobra (Kg)</span>
                      <span className="contagem-val">{item.sobraKg || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: '30px', fontSize: '0.9rem' }}>
                Nenhuma contagem registrada no banco de dados ainda.
              </p>
            )}
          </div>

          <button onClick={() => setTelaAtual('salas')} className="btn-registrar-contagem">
            REGISTRAR CONTAGEM
          </button>
        </main>

      ) : (

      
        <main className="area-conteudo flex-col justify-between">
          <div>
            <div className="topo-voltar">
              <button onClick={() => setTelaAtual('lista')} className="btn-voltar-simples">
                <ArrowLeft size={20} />
              </button>
              <h2 className="titulo-data">
                CONTAGEM {dataContagemAtual} {salvandoBanco && <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>(Gravando...)</span>}
              </h2>
            </div>

            {/* Grid de Salas */}
            <div className="grid-salas">
              {salas.map((sala) => (
                <div key={sala.id} onClick={() => handleEditarSala(sala)} className="card-sala">
                  <h4 className="sala-nome">{sala.nome}</h4>
                  <p className="sala-qtd">{sala.qtdAlunos} alunos</p>
                  <p className="sala-qtd-restricao" style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                    {sala.qtdRestricao} restriço{Number(sala.qtdRestricao) !== 1 ? 'es' : ''}
                  </p>
                </div>
              ))}

              <button onClick={handleNovaSala} className="card-sala-adicionar">
                <Plus size={36} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>

            <div className="linha-divisoria-azul"></div>

           
            <div className="area-restricoes-mural">
              <h3 className="titulo-mural-restricao">CONTAGEM {dataContagemAtual}</h3>
              
              <div className="lista-textos-restricao">
                {listaRestricoes.length > 0 ? (
                  listaRestricoes.map((s, idx) => (
                    <p key={s.id} className={idx === 1 ? 'texto-restricao sublinhado' : 'texto-restricao'}>
                      <strong>{s.nome}:</strong> {s.descRestricao}
                    </p>
                  ))
                ) : (
                  <p className="texto-restricao" style={{ opacity: 0.6 }}>Nenhuma restrição registrada para as salas de hoje.</p>
                )}
              </div>
            </div>
          </div>

          
          <div className="rodape-totais-duplo">
            <div className="bloco-total">
              <span className="total-label">Total de Alunos</span>
              <span className="total-numero">{totalAlunosComendo}</span>
            </div>
            <div className="bloco-total">
              <span className="total-label">Alunos Com Restrição</span>
              <span className="total-numero">{totalRestricoes}</span>
            </div>
          </div>
        </main>
      )}

      
      {modalAberto && salaEmEdicao && (
        <div className="modal-overlay">
          <div className="modal-card-sala">
            <h3 className="modal-sala-titulo">{salaEmEdicao.nome}</h3>

            <div className="campo-grupo">
              <label>Quantidade de Alunos</label>
              <input
                type="number"
                value={salaEmEdicao.qtdAlunos || ''}
                onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, qtdAlunos: Number(e.target.value) })}
                placeholder="00"
                className="input-sala"
              />
            </div>

            <div className="campo-grupo">
              <label>Alunos com Restrição</label>
              <input
                type="number"
                value={salaEmEdicao.qtdRestricao || ''}
                onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, qtdRestricao: Number(e.target.value) })}
                placeholder="00"
                className="input-sala"
              />
            </div>

            {Number(salaEmEdicao.qtdRestricao) > 0 && (
              <div className="campo-grupo animacao-aparecer">
                <textarea
                  value={salaEmEdicao.descRestricao}
                  onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, descRestricao: e.target.value })}
                  placeholder="Escreva quais as restrições..."
                  className="textarea-restricao"
                />
              </div>
            )}

          
            <div className="preview-cardapio-box">
              <div className="subtitulo-preview">
                <h4>{cardapioReal ? cardapioReal.titulo || "CARDÁPIO DO DIA" : "CARDÁPIO ESCOLAR"}</h4>
                <p>REFEIÇÕES CADASTRADAS NO SISTEMA</p>
              </div>

              <div className="tabela-mini">
                <div className="tabela-mini-topo">
                  <span>{cardapioReal?.dias?.[0]?.dia || "DIA ATUAL"}</span>
                  <span>{dataContagemAtual}</span>
                </div>
                <div className="tabela-mini-corpo">
                  {cardapioReal && cardapioReal.dias && cardapioReal.dias[0]?.refeicoes ? (
                    cardapioReal.dias[0].refeicoes.map((ref: any) => (
                      <div key={ref.id} className="linha-mini">
                        <span className="col-tipo">{ref.tipo}</span>
                        <span className="col-desc">{ref.descricao}</span>
                      </div>
                    ))
                  ) : (
                    <div className="linha-mini">
                      <span className="col-desc" style={{ width: '100%', textAlign: 'center', padding: '12px' }}>
                        Nenhuma refeição cadastrada para este dia.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-botoes-sala">
              <button onClick={() => setModalAberto(false)} className="btn-cancelar-azul">
                CANCELAR
              </button>
              <button onClick={handleSalvarSala} disabled={salvandoBanco} className="btn-adicionar-verde">
                {salvandoBanco ? 'SALVANDO...' : 'ADICIONAR'}
              </button>
            </div>
          </div>
        </div>
      )}

    
      <nav className="nav-inferior-inspetora">
        <button onClick={() => setAbaNav('escola')} className={`nav-item ${abaNav === 'escola' ? 'ativo' : ''}`}>
          {abaNav === 'escola' && <span className="barra-ativa"></span>}
          <GraduationCap size={28} />
        </button>

        <button onClick={() => setAbaNav('sair')} className={`nav-item ${abaNav === 'sair' ? 'ativo' : ''}`}>
          {abaNav === 'sair' && <span className="barra-ativa"></span>}
          <LogOut size={28} />
        </button>
      </nav>
    </div>
  );
}