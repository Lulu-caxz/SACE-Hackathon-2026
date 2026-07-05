import React, { useState } from 'react';
import { GraduationCap, LogOut, ArrowLeft, Plus } from 'lucide-react';
import './inspetor.css';

interface ContagemHistorica {
  id: number;
  data: string;
  alunosContados: number;
  pratosServidos: number;
  desperdicio: number;
}

interface Sala {
  id: number;
  nome: string;
  qtdAlunos: number;
  qtdRestricao: number;
  descRestricao: string;
}

const CONTAGENS_MOCK: ContagemHistorica[] = [
  { id: 1, data: '05/07/2026', alunosContados: 439, pratosServidos: 419, desperdicio: 20 },
  { id: 2, data: '05/07/2026', alunosContados: 439, pratosServidos: 419, desperdicio: 20 },
  { id: 3, data: '05/07/2026', alunosContados: 439, pratosServidos: 419, desperdicio: 20 },
  { id: 4, data: '05/07/2026', alunosContados: 439, pratosServidos: 419, desperdicio: 20 },
];

export default function InspetoraHome() {
  const [telaAtual, setTelaAtual] = useState<'lista' | 'salas'>('lista');
  const [abaNav, setAbaNav] = useState<'escola' | 'sair'>('escola');

  const [contagens] = useState<ContagemHistorica[]>(CONTAGENS_MOCK);
  const dataContagemAtual = '06/07/2026';


  const [salas, setSalas] = useState<Sala[]>([
    { id: 1, nome: 'SALA 1', qtdAlunos: 30, qtdRestricao: 0, descRestricao: '' },
    { id: 2, nome: 'SALA 2', qtdAlunos: 45, qtdRestricao: 0, descRestricao: '' },
    { id: 3, nome: 'SALA 3', qtdAlunos: 10, qtdRestricao: 1, descRestricao: 'O aluno possui intolerância à lactose. Utilizar apenas alimentos e bebidas livres de lactose.' },
    { id: 4, nome: 'SALA 4', qtdAlunos: 35, qtdRestricao: 1, descRestricao: 'O aluno possui alergia a ovos e derivados. Evitar qualquer alimento que contenha esse ingrediente.' },
    { id: 5, nome: 'SALA 5', qtdAlunos: 10, qtdRestricao: 0, descRestricao: '' },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [salaEmEdicao, setSalaEmEdicao] = useState<Sala | null>(null);


  const totalAlunosComendo = salas.reduce((acc, sala) => acc + (Number(sala.qtdAlunos) || 0), 0);
  const totalRestricoes = salas.reduce((acc, sala) => acc + (Number(sala.qtdRestricao) || 0), 0);

 
  const listaRestricoes = salas.filter(s => s.qtdRestricao > 0 && s.descRestricao.trim() !== '');

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

  const handleSalvarSala = () => {
    if (!salaEmEdicao) return;
    setSalas(prev => {
      const existe = prev.some(s => s.id === salaEmEdicao.id);
      if (existe) {
        return prev.map(s => s.id === salaEmEdicao.id ? salaEmEdicao : s);
      }
      return [...prev, salaEmEdicao];
    });
    setModalAberto(false);
    setSalaEmEdicao(null);
  };

  return (
    <div className="inspetora-container">
      
      <header className="cabecalho-inspetora">
        <h1>INSPETOR(A)</h1>
        <p>Nome do responsável</p>
      </header>

      {telaAtual === 'lista' ? (
        
     
        <main className="area-conteudo">
          <div className="lista-contagens">
            {contagens.map((item) => (
              <div key={item.id} className="card-contagem">
                <h3 className="contagem-titulo">Contagem - {item.data}</h3>
                <div className="contagem-dados">
                  <div><span className="contagem-label">Als. Cont.</span><span className="contagem-val">{item.alunosContados}</span></div>
                  <div><span className="contagem-label">Pts Serv.</span><span className="contagem-val">{item.pratosServidos}</span></div>
                  <div><span className="contagem-label">Desperdício</span><span className="contagem-val">{item.desperdicio}</span></div>
                </div>
              </div>
            ))}
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
              <h2 className="titulo-data">CONTAGEM {dataContagemAtual}</h2>
            </div>

            
            <div className="grid-salas">
              {salas.map((sala) => (
                <div key={sala.id} onClick={() => handleEditarSala(sala)} className="card-sala">
                  <h4 className="sala-nome">{sala.nome}</h4>
                  <p className="sala-qtd">{sala.qtdAlunos} alunos</p>
                  <p className="sala-qtd-restricao">{sala.qtdRestricao} restrição{Number(sala.qtdRestricao) !== 1 ? 'es' : ''}</p>
                </div>
              ))}

              <button onClick={handleNovaSala} className="card-sala-adicionar">
                <Plus size={36} color="#ffffff" strokeWidth={2.5} />
              </button>
            </div>

            <div className="linha-divisoria-azul"></div>

            {/* Mural de Restrições */}
            <div className="area-restricoes-mural">
              <h3 className="titulo-mural-restricao">CONTAGEM {dataContagemAtual}</h3>
              
              <div className="lista-textos-restricao">
                {listaRestricoes.length > 0 ? (
                  listaRestricoes.map((s, idx) => (
                    <p key={s.id} className={idx === 1 ? 'texto-restricao sublinhado' : 'texto-restricao'}>
                      {s.descRestricao}
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
                <h4>CARDÁPIO CEI</h4>
                <p>CRIANÇAS DE 6 A 12 MESES</p>
              </div>

              <div className="tabela-mini">
                <div className="tabela-mini-topo">
                  <span>SEGUNDA-FEIRA</span>
                  <span>06/07/2026</span>
                </div>
                <div className="tabela-mini-corpo">
                  <div className="linha-mini"><span className="col-tipo">DESJEJUM</span><span className="col-desc">Mamadeira com fórmula</span></div>
                  <div className="linha-mini"><span className="col-tipo">COLAÇÃO*</span><span className="col-desc">Fruta</span></div>
                  <div className="linha-mini"><span className="col-tipo">ALMOÇO</span><span className="col-desc">Arroz papa, Caldo de feijão, Frango desfiado, e Legumes<br/><br/>Sobremesa: Fruta</span></div>
                </div>
              </div>
            </div>

            <div className="modal-botoes-sala">
              <button onClick={() => setModalAberto(false)} className="btn-cancelar-azul">CANCELAR</button>
              <button onClick={handleSalvarSala} className="btn-adicionar-verde">ADICIONAR</button>
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