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

interface Cardapio {
  id: number | string;
  titulo?: string;
  dataEnvio?: string;
  status?: 'Esperando' | 'Aprovado' | 'Reprovado' | string;
  semana?: string;
  mes?: string;
  ano?: number;
}

// Dados iniciais do calendário idênticos ao design da foto
const CARDAPIOS_MOCK: Cardapio[] = [
  { id: 1, titulo: 'Cardápio - 06/07/2026 a 10/07/2026', dataEnvio: '08:01:47 - 05/07/2026', status: 'Esperando' },
  { id: 2, titulo: 'Cardápio - 29/06/2026 a 02/07/2026', dataEnvio: '10:01:47 - 28/06/2026', status: 'Aprovado' },
  { id: 3, titulo: 'Cardápio - 29/06/2026 a 02/07/2026', dataEnvio: '10:01:47 - 28/06/2026', status: 'Aprovado' },
  { id: 4, titulo: 'Cardápio - 29/06/2026 a 02/07/2026', dataEnvio: '08:01:47 - 28/06/2026', status: 'Reprovado' },
  { id: 5, titulo: 'Cardápio - 29/06/2026 a 02/07/2026', dataEnvio: '10:01:47 - 28/06/2026', status: 'Aprovado' },
];

export default function SelecaoEscola() {
  // Controle da Aba Ativa na barra de baixo ('escolas' | 'calendario' | 'sair')
  const [abaAtiva, setAbaAtiva] = useState<'escolas' | 'calendario' | 'sair'>('escolas');

  // Estados das Escolas
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [carregandoEscolas, setCarregandoEscolas] = useState(true);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);
  const [busca, setBusca] = useState('');

  // Estados dos Cardápios
  const [cardapios, setCardapios] = useState<Cardapio[]>(CARDAPIOS_MOCK);
  const [carregandoCardapios, setCarregandoCardapios] = useState(false);

  // 1. Busca as Escolas do Banco
  useEffect(() => {
    async function carregarEscolas() {
      try {
        setCarregandoEscolas(true);
        const res = await fetch(`${API_URL}/escolas`);
        if (res.ok) setEscolas(await res.json());
      } catch (err) {
        console.error('Erro ao buscar escolas:', err);
      } finally {
        setCarregandoEscolas(false);
      }
    }
    carregarEscolas();
  }, []);

  // 2. Busca os Cardápios do Banco quando clica na aba Calendário (CORRIGIDO AQUI!)
  useEffect(() => {
    if (abaAtiva === 'calendario') {
      async function carregarCardapios() {
        try {
          setCarregandoCardapios(true);
          const res = await fetch(`${API_URL}/cardapios`);
          if (res.ok) {
            const dados = await res.json();
            if (dados && dados.length > 0) setCardapios(dados);
          }
        } catch (err) {
          console.log('Mantendo mock de cardápios (Back indisponível)');
        } finally {
          setCarregandoCardapios(false);
        }
      }
      carregarCardapios();
    }
  }, [abaAtiva]);

  const escolasFiltradas = escolas.filter((escola) => {
    const nome = escola.nome || escola.name || '';
    return nome.toLowerCase().includes(busca.toLowerCase());
  });

  const getClasseStatus = (status: string) => {
    switch (status) {
      case 'Esperando': return 'card-esperando';
      case 'Reprovado': return 'card-reprovado';
      case 'Aprovado': default: return 'card-aprovado';
    }
  };

  // TELA ESPECÍFICA: Entrou em uma escola
  if (escolaSelecionada) {
    return (
      <div className="container-sucesso">
        <div className="card-sucesso">
          <div className="icone-sucesso"><GraduationCap size={32} /></div>
          <h2>Acesso Confirmado</h2>
          <p>Você entrou em:<br /><strong>{escolaSelecionada.nome || escolaSelecionada.name}</strong></p>
          <button onClick={() => setEscolaSelecionada(null)} className="btn-voltar">
            <ArrowLeft size={18} /> Voltar para Seleção
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Cabeçalho Fixo */}
      <header className="cabecalho">
        <div className="cabecalho-texto">
          <h1>SECRETARIA</h1>
          <p>Nome do responsável</p>
        </div>
      </header>

      {/* --- TROCA INTELIGENTE DE CONTEÚDO NO MEIO DA TELA --- */}
      {abaAtiva === 'calendario' ? (
        /* CONTEÚDO ABA 2: CALENDÁRIO / NUTRIÇÃO (LÓGICA VISUAL ATUALIZADA AQUI!) */
        <main className="lista-cardapios">
          {carregandoCardapios ? (
            <p className="msg-vazio">Carregando cardápios...</p>
          ) : cardapios.map((item: any) => {
            const tituloExibicao = item.titulo || (item.semana ? `Cardápio - Semana de ${new Date(item.semana).toLocaleDateString('pt-BR')} (${item.mes}/${item.ano})` : `Cardápio #${item.id}`);
            const dataExibicao = item.dataEnvio || `Atualizado em ${new Date().toLocaleDateString('pt-BR')}`;
            const statusExibicao = item.status || 'Esperando';

            return (
              <div key={item.id} className={`card-item ${getClasseStatus(statusExibicao)}`}>
                <h3 className="card-titulo">{tituloExibicao}</h3>
                <div className="card-rodape">
                  <span>{dataExibicao}</span>
                  <span style={{ fontWeight: 600 }}>{statusExibicao}</span>
                </div>
              </div>
            );
          })}
        </main>
      ) : abaAtiva === 'sair' ? (
        /* CONTEÚDO ABA 3: SAIR */
        <main className="tela-centralizada">
          <h2>Desconectar do sistema...</h2>
        </main>
      ) : (
        /* CONTEÚDO ABA 1: LISTA DE ESCOLAS (PADRÃO) */
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
            <button className="btn-filtro"><Filter size={18} /></button>
          </div>

          <main className="lista-escolas">
            {carregandoEscolas ? (
              <p className="msg-vazio">Carregando escolas...</p>
            ) : escolasFiltradas.length > 0 ? (
              escolasFiltradas.map((escola, index) => (
                <button
                  key={escola.id}
                  onClick={() => setEscolaSelecionada(escola)}
                  className={`btn-escola ${CORES[index % CORES.length]}`}
                >
                  {escola.nome || escola.name || `Escola #${escola.id}`}
                </button>
              ))
            ) : (
              <p className="msg-vazio">Nenhuma escola cadastrada.</p>
            )}
          </main>
        </>
      )}

      {/* Rodapé Fixo com Botões que trocam o Estado */}
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
          <div className="icone-calendario-wrapper">
            <Calendar size={24} />
            <span className="ponto-rosa"></span>
          </div>
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