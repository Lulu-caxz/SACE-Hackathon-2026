import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// ==========================================
// 1. LISTAR TODAS AS NOTIFICAÇÕES
// ==========================================
router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const apenasNaoLidas = String(req.query.apenasNaoLidas) === "true";
        const filtro: any = apenasNaoLidas ? { lida: false } : {};

        const notificacoes = await prisma.notificacao.findMany({
            where: filtro,
            orderBy: { criadoEm: "desc" },
            include: {
                cardapio: {
                    select: {
                        id: true,
                        dataInicial: true,
                        dataFinal: true,
                        status: true,
                        motivoReprovacao: true
                    }
                }
            }
        });

        const notificacoesFormatadas = notificacoes.map(n => ({
            id: n.id,
            titulo: n.titulo,
            mensagem: n.mensagem,
            lida: n.lida,
            criadoEm: n.criadoEm.toLocaleDateString("pt-BR") + " às " + n.criadoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            cardapioId: n.cardapioId,
            cardapio: n.cardapio ? {
                ...n.cardapio,
                dataInicial: n.cardapio.dataInicial.toISOString().split("T")[0],
                dataFinal: n.cardapio.dataFinal.toISOString().split("T")[0]
            } : null
        }));

        return res.json(notificacoesFormatadas);
    } catch (error: any) {
        console.error("Erro ao listar notificações:", error);
        return res.status(500).json({ error: "Erro interno ao listar notificações." });
    }
});

// ==========================================
// 2. MARCAR UMA NOTIFICAÇÃO COMO LIDA
// ==========================================
router.put("/:id/lida", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);

        const notificacaoAtualizada = await prisma.notificacao.update({
            where: { id },
            data: { lida: true }
        });

        return res.json(notificacaoAtualizada);
    } catch (error: any) {
        console.error("Erro ao marcar notificação como lida:", error);
        return res.status(500).json({ error: "Erro ao atualizar notificação." });
    }
});

// ==========================================
// 3. MARCAR TODAS COMO LIDAS
// ==========================================
router.put("/ler-todas", async (_req: Request, res: Response): Promise<any> => {
    try {
        await prisma.notificacao.updateMany({
            where: { lida: false },
            data: { lida: true }
        });

        return res.json({ message: "Todas as notificações foram marcadas como lidas." });
    } catch (error: any) {
        console.error("Erro ao marcar todas como lidas:", error);
        return res.status(500).json({ error: "Erro ao atualizar notificações." });
    }
});

export default router;