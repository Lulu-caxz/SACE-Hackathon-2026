import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, LogOut, Bell } from 'lucide-react';
import './nutricionista.css';

const API_URL = 'http://localhost:3001';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const REFEICOES_PADRAO = ['DESJEJUM', 'COLAÇÃO', 'ALMOÇO', 'LANCHE', 'JANTAR'];
const DIAS_ABREV = ['Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.'];

interface Usuario {
    nome?: string;
}

interface RefeicaoForm {
    id: string;
    tipo: string;
    descricao: string;
    editavel: boolean;
}

interface DiaForm {
    nome: string;
    data: string;
    refeicoes: RefeicaoForm[];
}

interface NutricionalForm {
    id: string;
    dia: string;
    kcal: string;
    cho: string;
    ptn: string;
    lip: string;
    na: string;
    editavel: boolean;
}

interface Cardapio {
    id: string;
    dataInicial?: string;
    dataFinal?: string;
    status?: string;
    criadoEm?: string;
    motivoReprovacao?: string;
    dias?: any[];
    nutricional?: any[];
}

interface Notificacao {
    id: string;
    titulo: string;
    mensagem: string;
    lida: boolean;
    criadoEm: string;
    cardapioId: string;
}

function gerarId(): string {
    return Math.random().toString(36).slice(2, 9);
}

function somarDias(dataBase: string, incremento: number): string {
    if (!dataBase) return '';
    const [ano, mes, dia] = dataBase.split('-').map(Number);
    if (!ano || !mes || !dia) return '';
    const d = new Date(ano, mes - 1, dia);
    d.setDate(d.getDate() + incremento);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
}

function criarDiasIniciais(dataInicial: string): DiaForm[] {
    return DIAS_SEMANA.map((nome, idx) => ({
        nome,
        data: somarDias(dataInicial, idx),
        refeicoes: REFEICOES_PADRAO.map((tipo) => ({ id: gerarId(), tipo, descricao: '', editavel: false })),
    }));
}

function criarNutricionalInicial(): NutricionalForm[] {
    return DIAS_ABREV.map((dia) => ({ id: gerarId(), dia, kcal: '', cho: '', ptn: '', lip: '', na: '', editavel: false }));
}

export default function NutricionistaApp() {
    const [tela, setTela] = useState<'lista' | 'criacao'>('lista');
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    const [cardapios, setCardapios] = useState<Cardapio[]>([]);
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
    
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [cardapioEditandoId, setCardapioEditandoId] = useState<string | null>(null);

    const [refeicaoModal, setRefeicaoModal] = useState<{
        aberto: boolean;
        diaIdx: number | null;
    }>({
        aberto: false,
        diaIdx: null,
    });

    const [alimentosSelecionados, setAlimentosSelecionados] = useState<{
        [key: string]: string[];
    }>({});

    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [dias, setDias] = useState<DiaForm[]>(criarDiasIniciais(''));
    const [nutricional, setNutricional] = useState<NutricionalForm[]>(criarNutricionalInicial());

    useEffect(() => {
        carregarCardapios();
        carregarNotificacoes();
        carregarUsuario();
    }, []);

    async function carregarUsuario() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setUsuario(await res.json());
        } catch (err) {
            console.error(err);
        }
    }

    async function carregarCardapios() {
        try {
            setCarregando(true);
            const res = await fetch(`${API_URL}/cardapios`);
            if (res.ok) setCardapios(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setCarregando(false);
        }
    }

    async function carregarNotificacoes() {
        try {
            const res = await fetch(`${API_URL}/notificacoes?apenasNaoLidas=true`);
            if (res.ok) setNotificacoes(await res.json());
        } catch (err) {
            console.error(err);
        }
    }

    async function marcarNotificacaoLida(id: string) {
        try {
            await fetch(`${API_URL}/notificacoes/${id}/lida`, { method: 'PUT' });
            setNotificacoes(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    function abrirCriacao() {
        setCardapioEditandoId(null);
        setDataInicial('');
        setDataFinal('');
        setDias(criarDiasIniciais(''));
        setNutricional(criarNutricionalInicial());
        setTela('criacao');
    }

    async function abrirEdicao(cardapio: Cardapio) {
        setCardapioEditandoId(cardapio.id);
        setDataInicial(cardapio.dataInicial || '');
        setDataFinal(cardapio.dataFinal || '');

        if (cardapio.dias && cardapio.dias.length > 0) {
            const diasMapeados: DiaForm[] = DIAS_SEMANA.map((nome, idx) => {
                const diaBanco = cardapio.dias?.[idx];
                const refeicoesMapeadas: RefeicaoForm[] = REFEICOES_PADRAO.map(tipo => {
                    const refBanco = diaBanco?.refeicoes?.find((r: any) => r.tipo === tipo);
                    return {
                        id: refBanco?.id || gerarId(),
                        tipo,
                        descricao: refBanco?.descricao || '',
                        editavel: false
                    };
                });

                return {
                    nome,
                    data: somarDias(cardapio.dataInicial || '', idx),
                    refeicoes: refeicoesMapeadas
                };
            });
            setDias(diasMapeados);
        } else {
            setDias(criarDiasIniciais(cardapio.dataInicial || ''));
        }

        setNutricional(criarNutricionalInicial());
        setTela('criacao');
    }

    function atualizarDataInicial(valor: string) {
        setDataInicial(valor);
        setDias((prev) => prev.map((d, idx) => ({ ...d, data: somarDias(valor, idx) })));
    }

    function abrirModalRefeicao(diaIdx: number) {
        setRefeicaoModal({ aberto: true, diaIdx });
    }

    function fecharModalRefeicao() {
        setRefeicaoModal({ aberto: false, diaIdx: null });
    }

    function adicionarAlimento(refeicao: string, alimento: string) {
        setAlimentosSelecionados((prev) => ({
            ...prev,
            [refeicao]: [...(prev[refeicao] || []), alimento],
        }));
    }

    function salvarRefeicoes() {
        if (refeicaoModal.diaIdx === null) return;

        setDias((prev) =>
            prev.map((dia, idx) => {
                if (idx !== refeicaoModal.diaIdx) return dia;

                return {
                    ...dia,
                    refeicoes: dia.refeicoes.map((r) => ({
                        ...r,
                        descricao: (alimentosSelecionados[r.tipo] || []).join(", "),
                    })),
                };
            })
        );

        setAlimentosSelecionados({});
        fecharModalRefeicao();
    }

    function removerRefeicao(diaIdx: number, refId: string) {
        setDias((prev) =>
            prev.map((d, idx) => (idx !== diaIdx ? d : { ...d, refeicoes: d.refeicoes.filter((r) => r.id !== refId) }))
        );
    }

    function atualizarNutricional(id: string, campo: keyof NutricionalForm, valor: string) {
        setNutricional((prev) => prev.map((n) => (n.id === id ? { ...n, [campo]: valor } : n)));
    }

    function adicionarLinhaNutricional() {
        setNutricional((prev) => [...prev, { id: gerarId(), dia: '', kcal: '', cho: '', ptn: '', lip: '', na: '', editavel: true }]);
    }

    async function enviarCardapio() {
        if (!dataInicial || !dataFinal) {
            alert('Preencha a data inicial e a data final.');
            return;
        }
        try {
            setEnviando(true);
            const url = cardapioEditandoId 
                ? `${API_URL}/cardapios/${cardapioEditandoId}` 
                : `${API_URL}/cardapios`;
            const metodo = cardapioEditandoId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataInicial, dataFinal, dias, nutricional }),
            });
            if (res.ok) {
                await carregarCardapios();
                setTela('lista');
            } else {
                alert('Erro ao enviar cardápio ao servidor.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEnviando(false);
        }
    }

    function getClasseCard(status: string = '') {
        if (status === 'RECUSADO' || status === 'Reprovado') return 'card-cardapio-nutri reprovado';
        if (status === 'APROVADO') return 'card-cardapio-nutri aprovado';
        return 'card-cardapio-nutri';
    }

    function formatarTitulo(c: Cardapio) {
        if (c.dataInicial && c.dataFinal) return `Cardápio - ${c.dataInicial} a ${c.dataFinal}`;
        return `Cardápio #${c.id}`;
    }

    return (
        <div className="app-container">
            <header className="cabecalho" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                <div className="cabecalho-texto">
                    <h1 style={{ fontFamily: "gunters medium", margin: 0 }}>NUTRICIONISTA</h1>
                    <p style={{ margin: 0 }}>{usuario?.nome || 'Nutricionista Responsável'}</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <button 
                        onClick={() => setMostrarNotificacoes(!mostrarNotificacoes)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', color: '#333' }}
                    >
                        <Bell size={26} />
                        {notificacoes.length > 0 && (
                            <span style={{
                                position: 'absolute', top: -5, right: -5, backgroundColor: '#dc3545',
                                color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold'
                            }}>
                                {notificacoes.length}
                            </span>
                        )}
                    </button>

                    {mostrarNotificacoes && (
                        <div style={{
                            position: 'absolute', right: 0, top: '40px', width: '320px', backgroundColor: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '8px', zIndex: 1000, padding: '12px', border: '1px solid #ddd'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                                <strong style={{ color: '#dc3545' }}>Notificações de Recusa</strong>
                                <button onClick={() => setMostrarNotificacoes(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                            {notificacoes.length === 0 ? (
                                <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>Nenhuma nova notificação.</p>
                            ) : (
                                notificacoes.map(n => (
                                    <div key={n.id} style={{ fontSize: '13px', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '8px' }}>
                                        <strong style={{ display: 'block', color: '#333' }}>{n.titulo}</strong>
                                        <p style={{ margin: '4px 0', color: '#555' }}>{n.mensagem}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                                            <span style={{ fontSize: '11px', color: '#888' }}>{n.criadoEm}</span>
                                            <button 
                                                onClick={() => marcarNotificacaoLida(n.id)}
                                                style={{ background: '#0056b3', color: '#fff', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                                            >
                                                Lida
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </header>

            {tela === 'lista' ? (
                <>
                    <main className="lista-cardapios-nutri">
                        {carregando ? (
                            <p className="msg-vazio">Carregando cardápios...</p>
                        ) : cardapios.length === 0 ? (
                            <p className="msg-vazio">Nenhum cardápio cadastrado ainda.</p>
                        ) : (
                            cardapios.map((c) => (
                                <div key={c.id} className={getClasseCard(c.status)}>
                                    <div className="card-cardapio-titulo">{formatarTitulo(c)}</div>
                                    
                                    {(c.status === 'RECUSADO' || c.status === 'Reprovado') && c.motivoReprovacao && (
                                        <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '8px', borderRadius: '4px', margin: '8px 0', fontSize: '13px', borderLeft: '4px solid #ffeeba' }}>
                                            <strong>Motivo da Recusa:</strong> {c.motivoReprovacao}
                                        </div>
                                    )}

                                    <div className="card-cardapio-rodape">
                                        <span>{c.criadoEm || 'Registrado'}</span>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span className="card-cardapio-status">{c.status || 'PENDENTE'}</span>
                                            {(c.status === 'RECUSADO' || c.status === 'Reprovado') && (
                                                <button 
                                                    onClick={() => abrirEdicao(c)}
                                                    style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    EDITAR E REENVIAR
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </main>
                    <button className="btn-criar-cardapio" onClick={abrirCriacao}>
                        CRIAR CARDÁPIO
                    </button>
                </>
            ) : (
                <main className="criacao-area">
                    <div className="detalhe-topo">
                        <button className="btn-voltar-simples" onClick={() => setTela('lista')}>
                            <ArrowLeft size={20} />
                        </button>
                        <span className="detalhe-titulo">
                            {cardapioEditandoId ? 'Edição de Cardápio Recusado' : 'Criação do cardápio'}
                        </span>
                    </div>

                    <div className="periodo-grid">
                        <div className="periodo-item">
                            <span className="periodo-label">Data Inicial</span>
                            <input
                                type="date"
                                className="input-data"
                                value={dataInicial}
                                onChange={(e) => atualizarDataInicial(e.target.value)}
                            />
                        </div>
                        <div className="periodo-item">
                            <span className="periodo-label">Data Final</span>
                            <input type="date" className="input-data" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <div className="titulo-cardapio-criacao">CARDÁPIO ESCOLAR</div>
                        <div className="subtitulo-cardapio-criacao">GESTÃO NUTRICIONAL</div>
                    </div>

                    {dias.map((dia, diaIdx) => (
                        <div className="dia-bloco" key={dia.nome}>
                            <div className="dia-bloco-cabecalho">
                                <div className="dia-bloco-cabecalho-info">
                                    <span>{dia.nome.toUpperCase()}</span>
                                    {dia.data && <span className="dia-bloco-cabecalho-data">{dia.data}</span>}
                                </div>
                                <button className="btn-add-circular" onClick={() => abrirModalRefeicao(diaIdx)} title="Adicionar refeição">
                                    <Plus size={14} />
                                </button>
                            </div>
                            <div className="tabela-refeicoes">
                                {dia.refeicoes.map((ref) => (
                                    <div className="linha-refeicao-input" key={ref.id}>
                                        <div className="celula-tipo-refeicao">
                                            {ref.tipo}
                                        </div>
                                        <div className="celula-input-refeicao" style={{ padding: '8px 12px' }}>
                                            {ref.descricao}
                                        </div>
                                        {ref.editavel && (
                                            <button className="btn-remover-refeicao" onClick={() => removerRefeicao(diaIdx, ref.id)} title="Remover">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {refeicaoModal.aberto && refeicaoModal.diaIdx !== null && (
                        <div className="modal-overlay">
                            <div className="modal-cardapio">
                                <div className="modal-topo">
                                    <h2>{dias[refeicaoModal.diaIdx].nome.toUpperCase()}</h2>
                                    <span>{dias[refeicaoModal.diaIdx].data}</span>
                                </div>

                                <div className="modal-refeicoes">
                                    {REFEICOES_PADRAO.map((refeicao) => (
                                        <div className="modal-refeicao" key={refeicao}>
                                            <label>{refeicao}</label>
                                            <div className="campo-refeicao">
                                                {(alimentosSelecionados[refeicao] || []).map((item, index) => (
                                                    <div className="item-alimento" key={index}>
                                                        {item}
                                                    </div>
                                                ))}
                                                <select
                                                    className="select-alimento"
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        if (e.target.value !== "") {
                                                            adicionarAlimento(refeicao, e.target.value);
                                                            e.target.value = "";
                                                        }
                                                    }}
                                                >
                                                    <option value="">Adicionar alimento</option>
                                                    <option value="Leite">Leite</option>
                                                    <option value="Banana">Banana</option>
                                                    <option value="Maçã">Maçã</option>
                                                    <option value="Arroz">Arroz</option>
                                                    <option value="Feijão">Feijão</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="modal-botoes">
                                    <button className="btn-cancelar-form" onClick={fecharModalRefeicao}>
                                        CANCELAR
                                    </button>
                                    <button className="btn-enviar-form" onClick={salvarRefeicoes}>
                                        ADICIONAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="secao-nutricional-criacao">
                        <div className="nutricional-cabecalho-criacao">
                            <span>VALOR NUTRICIONAL</span>
                            <button className="btn-add-circular" onClick={adicionarLinhaNutricional} title="Adicionar linha">
                                <Plus size={14} />
                            </button>
                        </div>
                        <div className="linha-nutricional-cabecalho">
                            <span></span>
                            <span>KCAL</span>
                            <span>CHO (g)</span>
                            <span>PTN (g)</span>
                            <span>LIP (g)</span>
                            <span>NA (mg)</span>
                        </div>
                        {nutricional.map((linha) => (
                            <div className="linha-nutricional-dados" key={linha.id}>
                                <span className="celula-dia-nutricional">
                                    {linha.editavel ? (
                                        <input
                                            className="input-nutricional"
                                            placeholder="Dia"
                                            value={linha.dia}
                                            onChange={(e) => atualizarNutricional(linha.id, 'dia', e.target.value)}
                                        />
                                    ) : (
                                        linha.dia
                                    )}
                                </span>
                                <input
                                    className="input-nutricional"
                                    value={linha.kcal}
                                    onChange={(e) => atualizarNutricional(linha.id, 'kcal', e.target.value)}
                                />
                                <input
                                    className="input-nutricional"
                                    value={linha.cho}
                                    onChange={(e) => atualizarNutricional(linha.id, 'cho', e.target.value)}
                                />
                                <input
                                    className="input-nutricional"
                                    value={linha.ptn}
                                    onChange={(e) => atualizarNutricional(linha.id, 'ptn', e.target.value)}
                                />
                                <input
                                    className="input-nutricional"
                                    value={linha.lip}
                                    onChange={(e) => atualizarNutricional(linha.id, 'lip', e.target.value)}
                                />
                                <input
                                    className="input-nutricional"
                                    value={linha.na}
                                    onChange={(e) => atualizarNutricional(linha.id, 'na', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="botoes-form-criacao">
                        <button className="btn-cancelar-form" onClick={() => setTela('lista')} disabled={enviando}>
                            CANCELAR
                        </button>
                        <button className="btn-enviar-form" onClick={enviarCardapio} disabled={enviando}>
                            {enviando ? 'SALVANDO...' : cardapioEditandoId ? 'REENVIAR PARA APROVAÇÃO' : 'ENVIAR'}
                        </button>
                    </div>
                </main>
            )}

            <nav className="nav-inferior">
                <button
                    className="nav-item"
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.reload();
                    }}
                >
                    <LogOut size={24} />
                </button>
            </nav>
        </div>
    );
}