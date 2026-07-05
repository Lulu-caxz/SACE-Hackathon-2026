import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

function mapearDiaSemana(nomeDia: string): any {
    const limpo = (nomeDia || "").toLowerCase().trim();
    if (limpo.includes("seg")) return "SEGUNDA";
    if (limpo.includes("ter")) return "TERCA";
    if (limpo.includes("qua")) return "QUARTA";
    if (limpo.includes("qui")) return "QUINTA";
    if (limpo.includes("sex")) return "SEXTA";
    return "SEGUNDA";
}

function formatarCardapioParaFrontend(c: any) {
    if (!c) return null;


    const listaNutri = (c.nutricionais || c.nutricional || []).map((n: any) => ({
        ...n,
        dia: n.diaAbrev || n.dia || "Geral",
        diaAbrev: n.diaAbrev || n.dia || "Geral",
        na: n.sodioMg ?? n.na ?? 0,
        sodioMg: n.sodioMg ?? n.na ?? 0
    }));

    return {
        ...c,
        dataInicial: c.dataInicial ? new Date(c.dataInicial).toISOString().split("T")[0] : "",
        dataFinal: c.dataFinal ? new Date(c.dataFinal).toISOString().split("T")[0] : "",
        criadoEm: c.criadoEm ? new Date(c.criadoEm).toLocaleDateString("pt-BR") : "",
        nutricional: listaNutri,   // Para frontends que buscam no singular
        nutricionais: listaNutri   // Para frontends que buscam no plural
    };
}


router.get("/oficial/atual", async (_req: Request, res: Response): Promise<any> => {
    try {
        const cardapioOficial = await prisma.cardapioSemanal.findFirst({
            where: {
                OR: [{ status: "APROVADO" }, { status: "Aprovado" }]
            },
            orderBy: { atualizadoEm: "desc" },
            include: {
                dias: { orderBy: { data: "asc" }, include: { refeicoes: true } },
                nutricionais: true
            }
        });

        return res.json(formatarCardapioParaFrontend(cardapioOficial));
    } catch (error: any) {
        return res.status(500).json({ error: "Erro interno" });
    }
});


router.put("/atualizar/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { status, motivoReprovacao } = req.body;

        let statusLimpo = status;
        if (status?.toUpperCase() === "APROVADO") statusLimpo = "APROVADO";
        if (status?.toUpperCase() === "REPROVADO" || status?.toUpperCase() === "RECUSADO") statusLimpo = "Reprovado";

        const resultado = await prisma.$transaction(async (tx) => {
            const atualizado = await tx.cardapioSemanal.update({
                where: { id },
                data: {
                    ...(statusLimpo && { status: statusLimpo }),
                    ...(motivoReprovacao !== undefined && { motivoReprovacao: motivoReprovacao }),
                }
            });

            if (statusLimpo === "Reprovado" || statusLimpo === "RECUSADO") {
                await tx.notificacao.create({
                    data: {
                        cardapioId: id,
                        titulo: "⚠️ Cardápio Reprovado pela Secretaria",
                        mensagem: `Motivo: ${motivoReprovacao || "Verifique com a secretaria."}`
                    }
                });
            }
            return atualizado;
        });

        return res.json(resultado);
    } catch (error: any) {
        return res.status(500).json({ error: "Erro ao atualizar cardápio." });
    }
});


router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const statusQuery = req.query.status ? String(req.query.status) : undefined;
        const filtro: any = statusQuery ? { status: statusQuery } : {};

        const cardapios = await prisma.cardapioSemanal.findMany({
            where: filtro,
            orderBy: { criadoEm: "desc" },
            include: { 
                dias: { include: { refeicoes: true } },
                nutricionais: true
            }
        });

        return res.json(cardapios.map(formatarCardapioParaFrontend));
    } catch (error) {
        return res.status(500).json({ error: "Erro ao listar" });
    }
});


router.get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const cardapio = await prisma.cardapioSemanal.findUnique({
            where: { id },
            include: { 
                dias: { include: { refeicoes: true } },
                nutricionais: true
            }
        });

        if (!cardapio) return res.status(404).json({ error: "Não encontrado" });

        return res.json(formatarCardapioParaFrontend(cardapio));
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar" });
    }
});


router.post("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const { dataInicial, dataFinal, dias, nutricional } = req.body;
        const dtInicial = new Date(`${dataInicial}T00:00:00Z`);
        const dtFinal = new Date(`${dataFinal}T00:00:00Z`);

        const novo = await prisma.$transaction(async (tx) => {
            const cardapio = await tx.cardapioSemanal.create({
                data: {
                    dataInicial: dtInicial,
                    dataFinal: dtFinal,
                    mes: dtInicial.getUTCMonth() + 1,
                    ano: dtInicial.getUTCFullYear(),
                    status: "Aguardando",
                }
            });

            if (Array.isArray(dias)) {
                for (const d of dias) {
                    const dataDia = d.data ? new Date(d.data.split("/").reverse().join("-")) : dtInicial;
                    const cardapioDia = await tx.cardapioDia.create({
                        data: {
                            cardapioId: cardapio.id,
                            dia: mapearDiaSemana(d.nome),
                            data: isNaN(dataDia.getTime()) ? dtInicial : dataDia,
                        }
                    });

                    if (Array.isArray(d.refeicoes)) {
                        for (const r of d.refeicoes) {
                            if (r.descricao?.trim()) {
                                await tx.refeicao.create({
                                    data: {
                                        cardapioDiaId: cardapioDia.id,
                                        tipo: r.tipo || "OUTRA",
                                        descricao: r.descricao
                                    }
                                });
                            }
                        }
                    }
                }
            }

            if (Array.isArray(nutricional)) {
                for (const n of nutricional) {
                    await tx.informacaoNutricional.create({
                        data: {
                            cardapioId: cardapio.id,
                            diaAbrev: n.dia || n.diaAbrev || "Geral",
                            kcal: parseFloat(n.kcal) || 0,
                            cho: parseFloat(n.cho) || 0,
                            ptn: parseFloat(n.ptn) || 0,
                            lip: parseFloat(n.lip) || 0,
                            sodioMg: parseFloat(n.na ?? n.sodioMg ?? 0)
                        }
                    });
                }
            }

            return cardapio;
        });

        return res.status(201).json(novo);
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});


router.put("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { dataInicial, dataFinal, dias, nutricional } = req.body;

        const dtInicial = new Date(`${dataInicial}T00:00:00Z`);
        const dtFinal = new Date(`${dataFinal}T00:00:00Z`);

        const cardapioAtualizado = await prisma.$transaction(async (tx) => {
            const cardapio = await tx.cardapioSemanal.update({
                where: { id },
                data: {
                    dataInicial: dtInicial,
                    dataFinal: dtFinal,
                    status: "Aguardando",
                    motivoReprovacao: null
                }
            });

            await tx.cardapioDia.deleteMany({ where: { cardapioId: id } });
            await tx.informacaoNutricional.deleteMany({ where: { cardapioId: id } });

            if (Array.isArray(dias)) {
                for (const d of dias) {
                    const dataDia = d.data ? new Date(d.data.split("/").reverse().join("-")) : dtInicial;
                    const cardapioDia = await tx.cardapioDia.create({
                        data: {
                            cardapioId: cardapio.id,
                            dia: mapearDiaSemana(d.nome),
                            data: isNaN(dataDia.getTime()) ? dtInicial : dataDia,
                        }
                    });

                    if (Array.isArray(d.refeicoes)) {
                        for (const r of d.refeicoes) {
                            if (r.descricao?.trim()) {
                                await tx.refeicao.create({
                                    data: {
                                        cardapioDiaId: cardapioDia.id,
                                        tipo: r.tipo || "OUTRA",
                                        descricao: r.descricao
                                    }
                                });
                            }
                        }
                    }
                }
            }

            if (Array.isArray(nutricional)) {
                for (const n of nutricional) {
                    await tx.informacaoNutricional.create({
                        data: {
                            cardapioId: cardapio.id,
                            diaAbrev: n.dia || n.diaAbrev || "Geral",
                            kcal: parseFloat(n.kcal) || 0,
                            cho: parseFloat(n.cho) || 0,
                            ptn: parseFloat(n.ptn) || 0,
                            lip: parseFloat(n.lip) || 0,
                            sodioMg: parseFloat(n.na ?? n.sodioMg ?? 0)
                        }
                    });
                }
            }

            return cardapio;
        });

        return res.json(cardapioAtualizado);
    } catch (error: any) {
        return res.status(500).json({ error: "Erro ao editar cardápio." });
    }
});

export default router;