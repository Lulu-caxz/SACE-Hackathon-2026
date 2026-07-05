import React, { useState, useEffect } from 'react';
import { Check, X, Eye, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:3001';

interface Refeicao {
    id: string;
    tipo: string;
    descricao: string;
}

interface DiaCardapio {
    id: string;
    dia: string;
    data: string;
    refeicoes: Refeicao[];
}

interface Nutricional {
    id: string;
    diaAbrev: string;
    kcal: number;
    cho: number;
    ptn: number;
    lip: number;
    sodioMg: number;
}

interface Cardapio {
    id: string;
    dataInicial: string;
    dataFinal: string;
    status: string;
    criadoEm: string;
    motivoReprovacao?: string;
    dias?: DiaCardapio[];
    nutricional?: Nutricional[];
}

export default function GestaoCardapiosSecretaria() {
    const [cardapiosPendentes, setCardapiosPendentes] = useState<Cardapio[]>([]);
    const [carregando, setCarregando] = useState<boolean>(true);

    const [cardapioSelecionado, setCardapioSelecionado] = useState<Cardapio | null>(null);
    const [modalVisualizar, setModalVisualizar] = useState<boolean>(false);
    const [abaAtiva, setAbaAtiva] = useState<'refeicoes' | 'nutricional'>('refeicoes');

    const [modalRecusar, setModalRecusar] = useState<boolean>(false);
    const [motivoRecusa, setMotivoRecusa] = useState<string>('');
    const [processando, setProcessando] = useState<boolean>(false);

    useEffect(() => {
        carregarCardapiosPendentes();
    }, []);

    async function carregarCardapiosPendentes() {
        try {
            setCarregando(true);
            const res = await fetch(`${API_URL}/cardapios`);
            if (res.ok) {
                const data: Cardapio[] = await res.json();
                const pendentes = data.filter(c => c.status === "Aguardando" || c.status === "PENDENTE");
                setCardapiosPendentes(pendentes);
            }
        } catch (error) {
            console.error("Erro ao buscar cardápios:", error);
        } finally {
            setCarregando(false);
        }
    }

    async function abrirDetalhes(id: string) {
        try {
            setProcessando(true);
            const res = await fetch(`${API_URL}/cardapios/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCardapioSelecionado(data);
                setAbaAtiva('refeicoes');
                setModalVisualizar(true);
            }
        } catch (error) {
            console.error("Erro ao buscar detalhes:", error);
        } finally {
            setProcessando(false);
        }
    }

    async function aprovarCardapio(id: string) {
        if (!confirm("Confirmar aprovação? Este será o cardápio oficial.")) return;
        try {
            setProcessando(true);
            const res = await fetch(`${API_URL}/cardapios/atualizar/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "APROVADO" })
            });
            if (res.ok) {
                alert("Cardápio aprovado com sucesso!");
                setModalVisualizar(false);
                carregarCardapiosPendentes();
            }
        } catch (error) {
            console.error("Erro na aprovação:", error);
        } finally {
            setProcessando(false);
        }
    }

    function abrirModalRecusa(cardapio: Cardapio) {
        setCardapioSelecionado(cardapio);
        setMotivoRecusa('');
        setModalRecusar(true);
    }

    async function confirmarRecusa() {
        if (!motivoRecusa.trim() || !cardapioSelecionado) {
            alert("Digite o motivo para orientar a Nutricionista.");
            return;
        }
        try {
            setProcessando(true);
            const res = await fetch(`${API_URL}/cardapios/atualizar/${cardapioSelecionado.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: "Reprovado", motivoReprovacao: motivoRecusa })
            });
            if (res.ok) {
                alert("Cardápio reprovado e Nutricionista notificada.");
                setModalRecusar(false);
                setModalVisualizar(false);
                carregarCardapiosPendentes();
            }
        } catch (error) {
            console.error("Erro na recusa:", error);
        } finally {
            setProcessando(false);
        }
    }

    return (
        <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ borderBottom: '2px solid #0056b3', paddingBottom: '16px', marginBottom: '24px' }}>
                <h1 style={{ color: '#003366', margin: '0 0 8px 0', fontSize: '24px' }}>Auditoria e Aprovação de Cardápios</h1>
                <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Avalie as refeições e as tabelas nutricionais antes da aprovação final.</p>
            </div>

            {carregando ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Carregando cardápios pendentes...</div>
            ) : cardapiosPendentes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <AlertCircle size={48} color="#28a745" style={{ margin: '0 auto 12px auto', display: 'block' }} />
                    <h3 style={{ color: '#333', margin: '0 0 8px 0' }}>Tudo verificado!</h3>
                    <p style={{ color: '#666', margin: 0 }}>Nenhum cardápio aguardando aprovação.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {cardapiosPendentes.map(c => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                            <div>
                                <span style={{ backgroundColor: '#ffc107', color: '#856404', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Aguardando Aprovação</span>
                                <h3 style={{ margin: '10px 0 4px 0', color: '#003366', fontSize: '18px' }}>Período: {c.dataInicial} até {c.dataFinal}</h3>
                                <span style={{ fontSize: '13px', color: '#888' }}>Enviado em: {c.criadoEm}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => abrirDetalhes(c.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                                    <Eye size={16} /> Auditoria Completa
                                </button>
                                <button onClick={() => aprovarCardapio(c.id)} disabled={processando} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                                    <Check size={16} /> Aprovar
                                </button>
                                <button onClick={() => abrirModalRecusa(c)} disabled={processando} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                                    <X size={16} /> Reprovar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE AUDITORIA COMPLETA COM TABELA NUTRICIONAL */}
            {modalVisualizar && cardapioSelecionado && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '850px', maxHeight: '90vh', borderRadius: '10px', overflowY: 'auto', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '16px', marginBottom: '16px' }}>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', color: '#003366' }}>Auditoria do Cardápio ({cardapioSelecionado.dataInicial} a {cardapioSelecionado.dataFinal})</h2>
                                <span style={{ fontSize: '13px', color: '#666' }}>Status: {cardapioSelecionado.status}</span>
                            </div>
                            <button onClick={() => setModalVisualizar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="#666" /></button>
                        </div>

                        {/* BOTÕES PARA ALTERNAR ENTRE REFEIÇÕES E TABELA NUTRICIONAL */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <button
                                onClick={() => setAbaAtiva('refeicoes')}
                                style={{ flex: 1, padding: '10px', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: abaAtiva === 'refeicoes' ? '#0056b3' : '#e9ecef', color: abaAtiva === 'refeicoes' ? '#fff' : '#333' }}
                            >
                                🍎 REFEIÇÕES POR DIA
                            </button>
                            <button
                                onClick={() => setAbaAtiva('nutricional')}
                                style={{ flex: 1, padding: '10px', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: abaAtiva === 'nutricional' ? '#0056b3' : '#e9ecef', color: abaAtiva === 'nutricional' ? '#fff' : '#333' }}
                            >
                                📊 TABELA NUTRICIONAL COMPLETA
                            </button>
                        </div>

                        {/* CONTEÚDO 1: REFEIÇÕES */}
                        {abaAtiva === 'refeicoes' ? (
                            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                                {(!cardapioSelecionado.dias || cardapioSelecionado.dias.length === 0) ? (
                                    <p style={{ color: '#888' }}>Sem refeições cadastradas.</p>
                                ) : (
                                    cardapioSelecionado.dias.map((dia, idx) => (
                                        <div key={idx} style={{ border: '1px solid #e9ecef', borderRadius: '6px', padding: '16px', backgroundColor: '#fdfdfd' }}>
                                            <h4 style={{ margin: '0 0 12px 0', color: '#0056b3', borderBottom: '1px solid #f1f1f1', paddingBottom: '6px' }}>{dia.dia}</h4>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {dia.refeicoes?.map((ref, rIdx) => (
                                                    <div key={rIdx} style={{ display: 'flex', fontSize: '14px' }}>
                                                        <strong style={{ width: '130px', color: '#444' }}>{ref.tipo}:</strong>
                                                        <span style={{ color: '#222' }}>{ref.descricao}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* CONTEÚDO 2: TABELA NUTRICIONAL */
                            <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
                                {(!cardapioSelecionado.nutricional || cardapioSelecionado.nutricional.length === 0) ? (
                                    <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Nenhuma tabela nutricional foi enviada junto a este cardápio.</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#0056b3', color: '#fff' }}>
                                                <th style={{ padding: '10px' }}>Dia</th>
                                                <th style={{ padding: '10px' }}>Kcal</th>
                                                <th style={{ padding: '10px' }}>Carboidratos (CHO)</th>
                                                <th style={{ padding: '10px' }}>Proteínas (PTN)</th>
                                                <th style={{ padding: '10px' }}>Lipídeos (LIP)</th>
                                                <th style={{ padding: '10px' }}>Sódio (Na)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cardapioSelecionado.nutricional.map((n, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #ddd', backgroundColor: idx % 2 === 0 ? '#f9fafb' : '#fff' }}>
                                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{n.diaAbrev || `Dia ${idx+1}`}</td>
                                                    <td style={{ padding: '10px' }}>{n.kcal} kcal</td>
                                                    <td style={{ padding: '10px' }}>{n.cho}g</td>
                                                    <td style={{ padding: '10px' }}>{n.ptn}g</td>
                                                    <td style={{ padding: '10px' }}>{n.lip}g</td>
                                                    <td style={{ padding: '10px', color: n.sodioMg > 600 ? '#dc3545' : '#333', fontWeight: n.sodioMg > 600 ? 'bold' : 'normal' }}>{n.sodioMg}mg</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                            <button onClick={() => abrirModalRecusa(cardapioSelecionado)} style={{ padding: '10px 18px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>REPROVAR COM MOTIVO</button>
                            <button onClick={() => aprovarCardapio(cardapioSelecionado.id)} style={{ padding: '10px 18px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>APROVAR OFICIALMENTE</button>
                        </div>
                    </div>
                </div>
            )}

            {modalRecusar && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '500px', borderRadius: '8px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#dc3545' }}>Reprovar Cardápio</h3>
                        <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>Informe o motivo para que a Nutricionista corrija e reenvie.</p>
                        <textarea rows={4} placeholder="Ex: Sódio acima de 600mg na quinta-feira..." value={motivoRecusa} onChange={(e) => setMotivoRecusa(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontFamily: 'inherit', fontSize: '14px', marginBottom: '16px', resize: 'vertical' }} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setModalRecusar(false)} disabled={processando} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={confirmarRecusa} disabled={processando || !motivoRecusa.trim()} style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: processando || !motivoRecusa.trim() ? 'not-allowed' : 'pointer' }}>Confirmar Reprovação</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}