import "./cardapio.css";

interface Refeicao {
    id?: string;
    tipo: string;
    descricao: string;
}

interface DiaCardapio {
    id?: string;
    dia: string;
    data?: string;
    refeicoes?: Refeicao[];
}

interface CardapioProps {
    titulo: string;
    subtitulo: string;
    cor: string;
    dados?: {
        id?: string;
        dataInicial?: string;
        dataFinal?: string;
        dias?: DiaCardapio[];
    } | null;
    carregando?: boolean;
}

export default function Cardapio({
    titulo,
    subtitulo,
    cor,
    dados,
    carregando
}: CardapioProps) {

 
    const dias = dados?.dias || [];

    return (
        <div
            className="cardapio"
            style={{ background: cor, color: cor }}
        >
            <div className="titulo-cardapio">
                <h2>{titulo}</h2>
                <span>{subtitulo}</span>
            </div>

            {carregando ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#fff" }}>
                    Carregando cardápio oficial da semana...
                </div>
            ) : dias.length === 0 ? (
                <div style={{ 
                    textAlign: "center", 
                    padding: "40px 20px", 
                    backgroundColor: "rgba(255, 255, 255, 0.9)", 
                    borderRadius: "8px",
                    margin: "20px",
                    color: "#333",
                    fontFamily: '"Montserrat", sans-serif'
                }}>
                    <strong>Nenhum cardápio aprovado disponível.</strong>
                    <p style={{ margin: "8px 0 0 0", fontSize: "13px", color: "#666" }}>
                        Aguardando revisão e aprovação pela Secretaria.
                    </p>
                </div>
            ) : (
                dias.map((item, index) => (
                    <div
                        className="dia-cardapio"
                        key={index}
                    >
                        <div className="cabecalho-dia" style={{ alignItems: "center" }}>
                            <span style={{ color: cor }}>{item.dia}</span>
                            {item.data && <small>{item.data}</small>}
                        </div>

                        <table>
                            <tbody>
                                {(!item.refeicoes || item.refeicoes.length === 0) ? (
                                    <tr>
                                        <td colSpan={2} style={{ textAlign: "center", fontStyle: "italic", color: "#666" }}>
                                            Sem refeições cadastradas para este dia.
                                        </td>
                                    </tr>
                                ) : (
                                    item.refeicoes.map((ref, rIdx) => (
                                        <tr key={rIdx}>
                                            <td>{ref.tipo}</td>
                                            <td>{ref.descricao}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ))
            )}
        </div>
    );
}