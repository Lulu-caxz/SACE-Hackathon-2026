import "./cardapio.css";

export default function Cardapio({
    titulo,
    subtitulo,
    cor
}) {

    const dias = [
        {
            dia: "SEGUNDA-FEIRA",
            data: "06/07/2026"
        },
        {
            dia: "TERÇA-FEIRA",
            data: "07/07/2026"
        },
        {
            dia: "QUARTA-FEIRA",
            data: "08/07/2026"
        },
        {
            dia: "QUINTA-FEIRA",
            data: "08/07/2026"
        },
        {
            dia: "SEXTA-FEIRA",
            data: "08/07/2026"
        }
    ];

    return (
        <div
            className="cardapio"
            style={{ background: cor, color: cor}}
        >
            <div className="titulo-cardapio">

                <h2>{titulo}</h2>

                <span>{subtitulo}</span>

            </div>

            {
                dias.map((item, index) => (

                    <div
                        className="dia-cardapio"
                        key={index}
                    >

                        <div className="cabecalho-dia" style={{alignItems:"center"}}>

                            <span style={{color: cor}}>{item.dia}</span>

                            <small>{item.data}</small>

                        </div>

                        <table>

                            <tbody>

                                <tr>
                                    <td>DESJEJUM</td>
                                    <td>Mamadeira com fórmula</td>
                                </tr>

                                <tr>
                                    <td>COLAÇÃO*</td>
                                    <td>Fruta</td>
                                </tr>

                                <tr>
                                    <td>ALMOÇO</td>
                                    <td>
                                        Arroz papa, Caldo de feijão,
                                        Frango desfiado,
                                        Legumes
                                        <br /><br />
                                        Sobremesa: Fruta
                                    </td>
                                </tr>

                                <tr>
                                    <td>LANCHE</td>
                                    <td>Pão de queijo e Suco integral</td>
                                </tr>

                                <tr>
                                    <td>JANTAR</td>
                                    <td>
                                        Arroz, Feijão,
                                        Almôndegas ao molho,
                                        Purê de batata,
                                        Salada
                                        <br /><br />
                                        Sobremesa: Fruta
                                    </td>
                                </tr>

                            </tbody>

                        </table>

                    </div>

                ))
            }

        </div>
    );
}