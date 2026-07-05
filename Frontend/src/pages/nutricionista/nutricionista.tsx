import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, LogOut } from 'lucide-react';
import './nutricionista.css';

const API_URL = 'http://localhost:3001';

const DIAS_SEMANA = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const REFEICOES_PADRAO = ['DESJEJUM', 'COLAÇÃO', 'ALMOÇO', 'LANCHE', 'JANTAR'];
const DIAS_ABREV = ['Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.'];

/* ========================================================
   TIPOS
======================================================== */

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
    id: number | string;
    dataInicial?: string;
    dataFinal?: string;
    status?: string;
    criadoEm?: string;
    motivoReprovacao?: string;
    dias?: any[];
    nutricional?: any[];
}

/* ========================================================
   HELPERS
======================================================== */

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

/* ========================================================
   COMPONENTE PRINCIPAL
======================================================== */

export default function NutricionistaApp() {
    const [tela, setTela] = useState<'lista' | 'criacao'>('lista');
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    const [cardapios, setCardapios] = useState<Cardapio[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);

    // Estado para controlar o popup/modal do dia-bloco
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

    // estado do formulário de criação
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [dias, setDias] = useState<DiaForm[]>(criarDiasIniciais(''));
    const [nutricional, setNutricional] = useState<NutricionalForm[]>(criarNutricionalInicial());

    useEffect(() => {
        carregarCardapios();
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

    function abrirCriacao() {
        setDataInicial('');
        setDataFinal('');
        setDias(criarDiasIniciais(''));
        setNutricional(criarNutricionalInicial());
        setTela('criacao');
    }

    function atualizarDataInicial(valor: string) {
        setDataInicial(valor);
        setDias((prev) => prev.map((d, idx) => ({ ...d, data: somarDias(valor, idx) })));
    }

    // Abre o popup passando qual dia foi clicado
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
            const res = await fetch(`${API_URL}/cardapios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dataInicial, dataFinal, status: 'Aguardando', dias, nutricional }),
            });
            if (res.ok) {
                await carregarCardapios();
                setTela('lista');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setEnviando(false);
        }
    }

    function getClasseCard(status: string = '') {
        return status === 'Reprovado' ? 'card-cardapio-nutri reprovado' : 'card-cardapio-nutri';
    }

    function formatarTitulo(c: Cardapio) {
        if (c.dataInicial && c.dataFinal) return `Cardápio - ${c.dataInicial} a ${c.dataFinal}`;
        return `Cardápio #${c.id}`;
    }

    return (
        <div className="app-container">
            <header className="cabecalho">
                <div className="cabecalho-texto">
                    <h1 style={{ fontFamily: "gunters medium" }} >NUTRICIONISTA</h1>
                    <p>{usuario?.nome || 'Nome do responsável'}</p>
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
                                    <div className="card-cardapio-rodape">
                                        <span>{c.criadoEm || 'Registrado'}</span>
                                        <span className="card-cardapio-status">{c.status || 'Aguardando'}</span>
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
                        <span className="detalhe-titulo">Criação do cardápio</span>
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
                        <div className="titulo-cardapio-criacao">CARDÁPIO CEI</div>
                        <div className="subtitulo-cardapio-criacao">CRIANÇAS DE 6 A 12 MESES</div>
                    </div>

                    {dias.map((dia, diaIdx) => (
                        <div className="dia-bloco" key={dia.nome}>
                            <div className="dia-bloco-cabecalho">
                                <div className="dia-bloco-cabecalho-info">
                                    <span>{dia.nome.toUpperCase()}</span>
                                    {dia.data && <span className="dia-bloco-cabecalho-data">{dia.data}</span>}
                                </div>
                                {/* Modificado para abrir o modal de popup */}
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
                                        {/* Input removido. Agora renderiza apenas o texto vindo do banco/estado */}
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

                    {/* POPUP / MODAL DA REFEIÇÃO */}
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
                                    <button
                                        className="btn-cancelar-form"
                                        onClick={fecharModalRefeicao}
                                    >
                                        CANCELAR
                                    </button>

                                    <button
                                        className="btn-enviar-form"
                                        onClick={salvarRefeicoes}
                                    >
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
                            {enviando ? 'ENVIANDO...' : 'ENVIAR'}
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