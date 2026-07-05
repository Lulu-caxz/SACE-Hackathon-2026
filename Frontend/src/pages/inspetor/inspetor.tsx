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

 
  const [usuario, setUsuario] = useState<any>(null);
  const [contagens, setContagens] = useState<ContagemHistorica[]>([]);
  const [cardapioReal, setCardapioReal] = useState<any>(null);
  const [salvandoBanco, setSalvandoBanco] = useState(false);

  
  const [sobraKg, setSobraKg] = useState<string>('0');
  const [pratosFeitos, setPratosFeitos] = useState<string>('0');

  const dataContagemAtual = new Date().toLocaleDateString('pt-BR');

  const [salas, setSalas] = useState<Sala[]>([
    { id: 1, nome: 'SALA 1', qtdAlunos: 30, qtdRestricao: 0, descRestricao: '' },
    { id: 2, nome: 'SALA 2', qtdAlunos: 45, qtdRestricao: 0, descRestricao: '' },
    { id: 3, nome: 'SALA 3', qtdAlunos: 10, qtdRestricao: 1, descRestricao: 'O aluno possui intolerância à lactose. Utilizar apenas alimentos e bebidas livres de lactose.' },
    { id: 4, nome: 'SALA 4', qtdAlunos: 35, qtdRestricao: 1, descRestricao: 'O aluno possui alergia a ovos e derivados. Evitar qualquer alimento que contenha esse ingrediente.' },
    { id: 5, nome: 'SALA 5*', qtdAlunos: 10, qtdRestricao: 0, descRestricao: '' },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [salaEmEdicao, setSalaEmEdicao] = useState<Sala | null>(null);


  const totalAlunosComendo = salas.reduce((acc, sala) => acc + (Number(sala.qtdAlunos) || 0), 0);
  const totalRestricoes = salas.reduce((acc, sala) => acc + (Number(sala.qtdRestricao) || 0), 0);
  const listaRestricoes = salas.filter(s => s.qtdRestricao > 0 && s.descRestricao.trim() !== '');


  useEffect(() => {
    if (totalAlunosComendo > 0 && pratosFeitos === '0') {
      setPratosFeitos(String(totalAlunosComendo));
    }
  }, [totalAlunosComendo]);


  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setUsuario(await res.json());
      } catch (err) { console.error("Erro ao carregar usuário logado:", err); }
    }
    loadUser();
  }, []);

 
  useEffect(() => {
    async function carregarDadosBanco() {
      try {
        const resDiarios = await fetch(`${API_URL}/diarios`);
        if (resDiarios.ok) setContagens(await resDiarios.json());

        const resCardapios = await fetch(`${API_URL}/cardapios`);
        if (resCardapios.ok) {
          const listaCardapios = await resCardapios.json();
          if (listaCardapios.length > 0) setCardapioReal(listaCardapios[0]);
        }
      } catch (err) { console.error("Erro ao carregar dados do back-end:", err); }
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
      if (existe) return prev.map(s => s.id === salaEmEdicao.id ? salaEmEdicao : s);
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
          pratosServidos: Number(pratosFeitos || salaEmEdicao.qtdAlunos),
          comidaFeitaKg: 0,
          sobraKg: Number(sobraKg || 0),
          observacoes: salaEmEdicao.qtdRestricao > 0 
            ? `[${salaEmEdicao.nome}] Restrições (${salaEmEdicao.qtdRestricao}): ${salaEmEdicao.descRestricao}`
            : `[${salaEmEdicao.nome}] Contagem padrão`
        })
      });

    
      const resDiarios = await fetch(`${API_URL}/diarios`);
      if (resDiarios.ok) setContagens(await resDiarios.json());
    } catch (err) {
      console.error("Erro ao salvar contagem no banco de dados:", err);
    } finally {
      setSalvandoBanco(false);
      setSalaEmEdicao(null);
    }
  };

  return (
    <div className="inspetora-container modo-desktop-expandido">
      
 
      <header className="cabecalho-inspetora">
        <div className="cabecalho-esquerda">
          {telaAtual === 'salas' && (
            <button onClick={() => setTelaAtual('lista')} className="btn-voltar-cabecalho so-no-mobile">
              <LogOut className="icone-girado" size={22} />
            </button>
          )}
          <div className="cabecalho-texto">
            <h1>INSPETOR(A)</h1>
            <p>{usuario ? usuario.nome : "Nome do responsável"}</p>
          </div>
        </div>
      </header>

     
      <div className="layout-split-desktop-inspetor">
        
        
        <aside className={`coluna-historico-contagens ${telaAtual === 'salas' ? 'esconder-no-mobile' : ''}`}>
          
          <button onClick={() => setTelaAtual('salas')} className="btn-registrar-contagem-topo">
            REGISTRAR CONTAGEM
          </button>

          <div className="lista-contagens">
            {contagens.length > 0 ? (
              contagens.map((item: any) => (
                <div key={item.id} className="card-contagem">
                  <h3 className="contagem-titulo">
                    Contagem - {new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </h3>
                  <div className="contagem-dados">
                    <div><span className="contagem-label">Als. Cont.</span><span className="contagem-val">{item.alunosPresentes || 0}</span></div>
                    <div><span className="contagem-label">Pts Serv.</span><span className="contagem-val">{item.pratosServidos || 0}</span></div>
                    <div><span className="contagem-label">Desperdício</span><span className="contagem-val">{item.sobraKg || 0}</span></div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px', fontSize: '0.85rem' }}>
                Nenhuma contagem registrada.
              </p>
            )}
          </div>
        </aside>

    
        <section className={`coluna-painel-salas ${telaAtual === 'lista' ? 'esconder-no-mobile' : ''}`}>
          
         
          <div className="topo-voltar so-no-mobile">
            <button onClick={() => setTelaAtual('lista')} className="btn-voltar-simples">
              <ArrowLeft size={20} />
            </button>
            <h2 className="titulo-data">CONTAGEM {dataContagemAtual}</h2>
          </div>

          <div className="caixa-painel-dia-desktop">
            <h2 className="titulo-painel-desktop so-no-desktop">
              CARDÁPIO - 06/07/2026 A 10/07/2026 {salvandoBanco && <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>(Gravando...)</span>}
            </h2>

           
            <div className="grid-tres-areas-salas">
              
            
              <div className="area-botoes-salas">
                <div className="grid-salas">
                  
                  
                  {salas.map((sala) => (
                    <div key={sala.id} onClick={() => handleEditarSala(sala)} className="card-sala">
                      <h4 className="sala-nome">{sala.nome}</h4>
                      <p className="sala-qtd">{sala.qtdAlunos} alunos</p>
                    </div>
                  ))}

                  <button onClick={handleNovaSala} className="card-sala-adicionar">
                    <Plus size={36} color="#ffffff" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

             
              <div className="area-mural-restricoes">
                <h4 className="titulo-secao-mural">RESTRIÇÕES</h4>
                <div className="lista-textos-restricao">
                  {listaRestricoes.length > 0 ? (
                    listaRestricoes.map((s) => (
                      <div key={s.id} className="bloco-texto-sala">
                        <strong style={{ display: 'block', color: '#0b5280', fontSize: '0.78rem', marginBottom: '2px' }}>
                          {s.nome.toUpperCase()}
                        </strong>
                        <p className="texto-restricao">{s.descRestricao}</p>
                      </div>
                    ))
                  ) : (
                    <p className="texto-restricao" style={{ opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                      Nenhuma restrição registrada para as salas selecionadas.
                    </p>
                  )}
                </div>
              </div>

             
              <div className="area-resumo-lateral">
                
              
                <div className="grid-resumo-inputs">
                  <div>
                    <span className="resumo-lbl">Total de Alunos</span>
                    <div className="caixa-resumo-cheia">{totalAlunosComendo}</div>
                  </div>
                  <div>
                    <span className="resumo-lbl">Alunos Com Restrição</span>
                    <div className="caixa-resumo-cheia">{totalRestricoes}</div>
                  </div>
                  <div>
                    <span className="resumo-lbl">Pratos Feitos</span>
                    <input 
                      type="number" 
                      value={pratosFeitos} 
                      onChange={(e) => setPratosFeitos(e.target.value)} 
                      className="input-resumo-vazada" 
                    />
                  </div>
                  <div>
                    <span className="resumo-lbl">Desperdício</span>
                    <input 
                      type="number" 
                      value={sobraKg} 
                      onChange={(e) => setSobraKg(e.target.value)} 
                      className="input-resumo-cheia" 
                    />
                  </div>
                </div>

           
                <div className="preview-cardapio-resumo">
                  <div className="subtitulo-preview-resumo">
                    <h4>CARDÁPIO CEI</h4>
                    <p>CRIANÇAS DE 6 A 12 MESES</p>
                  </div>

                  <div className="tabela-mini">
                    <div className="tabela-mini-topo">
                      <span>{cardapioReal?.dias?.[0]?.dia || "SEGUNDA-FEIRA"}</span>
                      <span>06/07/2026</span>
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
                        <>
                          <div className="linha-mini"><span className="col-tipo">DESJEJUM</span><span className="col-desc">Mamadeira com fórmula</span></div>
                          <div className="linha-mini"><span className="col-tipo">COLAÇÃO*</span><span className="col-desc">Fruta</span></div>
                          <div className="linha-mini"><span className="col-tipo">ALMOÇO</span><span className="col-desc">Arroz papa, Caldo de feijão e Frango desfiado</span></div>
                          <div className="linha-mini"><span className="col-tipo">LANCHE</span><span className="col-desc">Pão de queijo e Suco integral</span></div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

      </div>

      {modalAberto && salaEmEdicao && (
        <div className="modal-overlay">
          <div className="modal-card-sala-novo">
            <h3 className="modal-sala-titulo-centro">{salaEmEdicao.nome}</h3>

            <div className="grid-dois-inputs-modal">
              <div className="campo-grupo">
                <label>Quantidade de Alunos</label>
                <input
                  type="number"
                  value={salaEmEdicao.qtdAlunos || ''}
                  onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, qtdAlunos: Number(e.target.value) })}
                  placeholder="00"
                  className="input-sala-novo"
                />
              </div>

              <div className="campo-grupo">
                <label>Alunos com Restrição</label>
                <input
                  type="number"
                  value={salaEmEdicao.qtdRestricao || ''}
                  onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, qtdRestricao: Number(e.target.value) })}
                  placeholder="00"
                  className="input-sala-novo"
                />
              </div>
            </div>

            <div className="campo-grupo" style={{ marginTop: '12px' }}>
              <textarea
                value={salaEmEdicao.descRestricao}
                onChange={(e) => setSalaEmEdicao({ ...salaEmEdicao, descRestricao: e.target.value })}
                placeholder="Escreva quais as restrições..."
                className="textarea-restricao-novo"
              />
            </div>

            <div className="modal-botoes-lado-a-lado">
              <button onClick={() => setModalAberto(false)} className="btn-modal-cancelar-azul">
                CANCELAR
              </button>
              <button onClick={handleSalvarSala} disabled={salvandoBanco} className="btn-modal-registrar-verde">
                {salvandoBanco ? 'GRAVANDO...' : 'REGISTRAR'}
              </button>
            </div>
          </div>
        </div>
      )}

    
      <nav className="nav-inferior-inspetora so-no-mobile">
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