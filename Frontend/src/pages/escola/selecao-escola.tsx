import React, { useState, useEffect } from 'react';
import { Search, Filter, GraduationCap, Calendar, LogOut, ArrowLeft } from 'lucide-react';
import './selecao-escola.css';


const API_URL = 'http://localhost:3001';


const CORES = ['cor-azul-escuro', 'cor-azul-medio', 'cor-roxo', 'cor-rosa'];

interface Escola {
  id: number | string;
  nome?: string;
  name?: string; 
}

export default function SelecaoEscola() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState(false);

  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState('escolas');

  
  useEffect(() => {
    async function carregarEscolas() {
      try {
        setCarregando(true);
        setErroApi(false);

        const resposta = await fetch(`${API_URL}/escolas`);
        if (!resposta.ok) throw new Error('Falha na resposta do servidor');

        const dados: Escola[] = await resposta.json();
        setEscolas(dados);
      } catch (erro) {
        console.error('Erro ao buscar escolas no backend:', erro);
        setErroApi(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarEscolas();
  }, []);

  
  const escolasFiltradas = escolas.filter((escola) => {
    const nomeEscola = escola.nome || escola.name || '';
    return nomeEscola.toLowerCase().includes(busca.toLowerCase());
  });

  
  if (escolaSelecionada) {
    const nomeExibicao = escolaSelecionada.nome || escolaSelecionada.name || 'Escola Selecionada';

    return (
      <div className="container-sucesso">
        <div className="card-sucesso">
          <div className="icone-sucesso">
            <GraduationCap size={32} />
          </div>
          <h2>Acesso Confirmado</h2>
          <p>
            Você entrou em:<br />
            <strong>{nomeExibicao}</strong>
          </p>
          <button
            onClick={() => setEscolaSelecionada(null)}
            className="btn-voltar"
          >
            <ArrowLeft size={18} />
            Voltar para Seleção
          </button>
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
        <main className="tela-centralizada">
          <h2>calendario</h2>
        </main>
      ) : abaAtiva === 'sair' ? (
        <main className="tela-centralizada">
          <h2>sair</h2>
        </main>
      ) : (
        <>
        
          <div className="barra-busca-container">
            <div className="input-busca-wrapper">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="input-busca"
                placeholder="Buscar escola..."
              />
              <Search className="icone-busca" size={18} />
            </div>
            <button className="btn-filtro">
              <Filter size={18} />
            </button>
          </div>

        
          <main className="lista-escolas">
            {carregando ? (
              <p className="msg-vazio">Conectando ao servidor e carregando escolas...</p>
            ) : erroApi ? (
              <p className="msg-vazio" style={{ color: '#ef4444' }}>
                Erro ao conectar no backend ({API_URL}). Verifique se o servidor está rodando e se o CORS está liberado!
              </p>
            ) : escolasFiltradas.length > 0 ? (
              escolasFiltradas.map((escola, index) => {
                const classeCor = CORES[index % CORES.length];
                const nomeExibicao = escola.nome || escola.name || `Escola #${escola.id}`;

                return (
                  <button
                    key={escola.id}
                    onClick={() => setEscolaSelecionada(escola)}
                    className={`btn-escola ${classeCor}`}
                  >
                    {nomeExibicao}
                  </button>
                );
              })
            ) : (
              <p className="msg-vazio">Nenhuma escola encontrada no sistema.</p>
            )}
          </main>
        </>
      )}

  
      <nav className="nav-inferior">
        <button
          onClick={() => { setAbaAtiva('escolas'); setEscolaSelecionada(null); }}
          className={`nav-item ${abaAtiva === 'escolas' ? 'ativo' : ''}`}
        >
          {abaAtiva === 'escolas' && <span className="indicador-ativo"></span>}
          <GraduationCap size={26} />
        </button>

        <button
          onClick={() => { setAbaAtiva('calendario'); setEscolaSelecionada(null); }}
          className={`nav-item ${abaAtiva === 'calendario' ? 'ativo' : ''}`}
        >
          {abaAtiva === 'calendario' && <span className="indicador-ativo"></span>}
          <Calendar size={24} />
        </button>

        <button
          onClick={() => { setAbaAtiva('sair'); setEscolaSelecionada(null); }}
          className={`nav-item ${abaAtiva === 'sair' ? 'ativo' : ''}`}
        >
          {abaAtiva === 'sair' && <span className="indicador-ativo"></span>}
          <LogOut size={24} />
        </button>
      </nav>
    </div>
  );
}