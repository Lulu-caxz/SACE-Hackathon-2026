import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Helper para converter string ou enum no padrão correto do Prisma
function mapearDiaSemana(nomeDia: string): any {
    const limpo = (nomeDia || "").toLowerCase().trim();
    if (limpo.includes("seg")) return "SEGUNDA";
    if (limpo.includes("ter")) return "TERCA";
    if (limpo.includes("qua")) return "QUARTA";
    if (limpo.includes("qui")) return "QUINTA";
    if (limpo.includes("sex")) return "SEXTA";
    return "SEGUNDA";
}

// ==========================================
// 1. LISTAR DIAS (Com filtro opcional por cardapioId)
// ==========================================
router.get("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const cardapioIdQuery = req.query.cardapioId ? String(req.query.cardapioId) : undefined;
        const filtro: any = cardapioIdQuery ? { cardapioId: cardapioIdQuery } : {};

        const dias = await prisma.cardapioDia.findMany({
            where: filtro,
            orderBy: { data: "asc" },
            include: {
                refeicoes: true,
                registro: true
            }
        });

        const diasFormatados = dias.map(d => ({
            ...d,
            data: d.data ? d.data.toISOString().split("T")[0] : null
        }));

        return res.json(diasFormatados);
    } catch (error: any) {
        console.error("Erro ao listar dias do cardápio:", error);
        return res.status(500).json({ error: "Erro interno ao listar dias." });
    }
});

// ==========================================
// 2. BUSCAR DIA POR ID
// ==========================================
router.get("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const dia = await prisma.cardapioDia.findUnique({
            where: { id },
            include: {
                refeicoes: {
                    include: { nutricionais: true }
                },
                registro: true
            }
        });

        if (!dia) {
            return res.status(404).json({ error: "Dia do cardápio não encontrado." });
        }

        return res.json({
            ...dia,
            data: dia.data ? dia.data.toISOString().split("T")[0] : null
        });
    } catch (error: any) {
        console.error("Erro ao buscar dia:", error);
        return res.status(500).json({ error: "Erro interno ao buscar dia." });
    }
});

// ==========================================
// 3. CRIAR UM NOVO DIA NO CARDÁPIO
// ==========================================
router.post("/", async (req: Request, res: Response): Promise<any> => {
    try {
        const { cardapioId, dia, data } = req.body;

        if (!cardapioId) {
            return res.status(400).json({ error: "O cardapioId é obrigatório." });
        }

        // Garante que a data seja salva corretamente no formato exigido pelo Prisma (@db.Date)
        const dataObj = data ? new Date(`${data}T00:00:00Z`) : new Date();

        const novoDia = await prisma.cardapioDia.create({
            data: {
                cardapioId: String(cardapioId),
                dia: mapearDiaSemana(dia),
                data: isNaN(dataObj.getTime()) ? new Date() : dataObj
            },
            include: {
                refeicoes: true
            }
        });

        return res.status(201).json(novoDia);
    } catch (error: any) {
        console.error("Erro ao criar dia do cardápio:", error);
        return res.status(500).json({ error: error.message || "Erro ao criar dia do cardápio." });
    }
});

// ==========================================
// 4. ATUALIZAR UM DIA
// ==========================================
router.put("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);
        const { dia, data } = req.body;

        const dadosAtualizacao: any = {};
        if (dia) dadosAtualizacao.dia = mapearDiaSemana(dia);
        if (data) {
            const dataObj = new Date(`${data}T00:00:00Z`);
            if (!isNaN(dataObj.getTime())) {
                dadosAtualizacao.data = dataObj;
            }
        }

        const diaAtualizado = await prisma.cardapioDia.update({
            where: { id },
            data: dadosAtualizacao,
            include: { refeicoes: true }
        });

        return res.json(diaAtualizado);
    } catch (error: any) {
        console.error("Erro ao atualizar dia:", error);
        return res.status(500).json({ error: "Erro ao atualizar dia do cardápio." });
    }
});

// ==========================================
// 5. DELETAR UM DIA DO CARDÁPIO
// ==========================================
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
    try {
        const id = String(req.params.id);

        await prisma.cardapioDia.delete({
            where: { id }
        });

        return res.json({ message: "Dia removido com sucesso." });
    } catch (error: any) {
        console.error("Erro ao deletar dia:", error);
        return res.status(500).json({ error: "Erro ao deletar dia do cardápio." });
    }
});

export default router;