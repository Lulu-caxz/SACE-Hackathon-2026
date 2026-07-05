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

// ⚡ HELPER BLINDADO: Não deixa dar erro 500 se dataInicial ou dataFinal forem null!
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
        nutricional: listaNutri,
        nutricionais: listaNutri
    };
}

// ==========================================
// 1. ROTA OFICIAL DA HOME / LOGIN
// ==========================================
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
        console.error("❌ Erro em /oficial/atual:", error);
        return res.status(500).json({ error: "Erro interno ao buscar cardápio oficial." });
    }
});

// ==========================================
// 2. APROVAÇÃO E REPROVAÇÃO DA SECRETARIA
// ==========================================
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
        console.error("❌ Erro em /atualizar/:id:", error);
        return res.status(500).json({ error: "Erro ao atualizar cardápio." });
    }
});

// ==========================================
// 3. LISTAR TODOS OS CARDÁPIOS (BLINDADO CONTRA ERRO 500)
// ==========================================
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
    } catch (error: any) {
        console.error("❌ Erro ao listar cardápios:", error);
        return res.status(500).json({ error: "Erro interno ao listar cardápios." });
    }
});

// ==========================================
// 4. BUSCAR CARDÁPIO POR ID
// ==========================================
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
    } catch (error: any) {
        console.error("❌ Erro ao buscar cardápio:", error);
        return res.status(500).json({ error: "Erro ao buscar" });
    }
});

// ==========================================
// 5. CRIAR CARDÁPIO (Nutricionista)
// ==========================================
router.post("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const { dataInicial, dataFinal, dias, nutricional } = req.body;

        const dtInicial = dataInicial ? new Date(`${dataInicial}T00:00:00Z`) : new Date();
        const dtFinal = dataFinal ? new Date(`${dataFinal}T00:00:00Z`) : new Date();

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
                                        tipo: String(r.tipo || "OUTRA"),
                                        descricao: String(r.descricao)
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
                            diaAbrev: String(n.dia || n.diaAbrev || "Geral"),
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

        console.log("✅ [NUTRI] Cardápio salvo com sucesso no banco ID:", novo.id);
        return res.status(201).json(novo);
    } catch (error: any) {
        console.error("❌ Erro no POST /cardapios:", error);
        return res.status(500).json({ error: error.message || "Erro ao criar cardápio." });
    }
});

// ==========================================
// 6. EDITAR E REENVIAR CARDÁPIO
// ==========================================
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { dataInicial, dataFinal, dias, nutricional } = req.body;

        const dtInicial = dataInicial ? new Date(`${dataInicial}T00:00:00Z`) : new Date();
        const dtFinal = dataFinal ? new Date(`${dataFinal}T00:00:00Z`) : new Date();

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
                                        tipo: String(r.tipo || "OUTRA"),
                                        descricao: String(r.descricao)
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
                            diaAbrev: String(n.dia || n.diaAbrev || "Geral"),
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
        console.error("❌ Erro ao editar cardápio:", error);
        return res.status(500).json({ error: "Erro ao editar cardápio." });
    }
});

export default router;